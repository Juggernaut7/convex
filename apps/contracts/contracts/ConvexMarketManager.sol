// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title ConvexMarketManager
 * @notice Binary conviction markets with off-chain oracle resolution support.
 * @dev Focused on hackathon velocity while maintaining sensible safety guards.
 */
contract ConvexMarketManager is AccessControl, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ---------------------------------------------------------------------
    // Constants & roles
    // ---------------------------------------------------------------------

    bytes32 public constant CREATOR_ROLE = keccak256("CREATOR_ROLE");
    bytes32 public constant RESOLVER_ROLE = keccak256("RESOLVER_ROLE");
    bytes32 public constant GUARDIAN_ROLE = keccak256("GUARDIAN_ROLE");

    uint16 public constant BPS_DENOMINATOR = 10_000;
    uint16 public constant MAX_PROTOCOL_FEE_BPS = 500; // 5%
    uint16 public constant MAX_CREATOR_FEE_BPS = 300; // 3%

    // ---------------------------------------------------------------------
    // Types
    // ---------------------------------------------------------------------

    enum Outcome {
        Undefined,
        Yes,
        No
    }

    enum MarketStatus {
        Live,
        Closed,
        Resolved,
        Void
    }

    struct Position {
        uint128 yesStake;
        uint128 noStake;
    }

    struct OracleCondition {
        bytes32 conditionType; // e.g. keccak256("PRICE_GREATER_THAN")
        string dataFeedId; // CoinGecko asset id, fixture id, etc.
        int256 targetValue;
        string targetDescription; // human readable (optional)
        bytes extraData; // opaque payload for backend automation
    }

    struct Market {
        bytes32 questionId;
        string metadataURI;
        address creator;
        address resolver;
        uint64 closeTime;
        uint64 resolveTime;
        uint16 protocolFeeBps;
        uint16 creatorFeeBps;
        uint128 yesPool;
        uint128 noPool;
        uint128 payoutPool;
        uint128 totalWinningStake;
        MarketStatus status;
        Outcome winningOutcome;
        bool usesOracle;
    }

    struct CreateMarketParams {
        bytes32 questionId;
        uint64 closeTime;
        address resolver;
        bool usesOracle;
        uint16 protocolFeeBps;
        uint16 creatorFeeBps;
        string metadataURI;
        OracleCondition condition;
    }

    // ---------------------------------------------------------------------
    // Storage
    // ---------------------------------------------------------------------

    IERC20 public immutable stakingToken;
    address public treasury;
    uint32 public nextMarketId;

    mapping(uint32 => Market) public markets;
    mapping(uint32 => OracleCondition) private _oracleConditions;
    mapping(uint32 => mapping(address => Position)) private _positions;

    // ---------------------------------------------------------------------
    // Events
    // ---------------------------------------------------------------------

    event MarketCreated(
        uint32 indexed marketId,
        bytes32 indexed questionId,
        address indexed creator,
        address resolver,
        uint64 closeTime,
        bool usesOracle,
        uint16 protocolFeeBps,
        uint16 creatorFeeBps,
        string metadataURI
    );

    event MarketOracleConfigured(
        uint32 indexed marketId,
        bytes32 indexed conditionType,
        bytes32 dataFeedIdHash,
        int256 targetValue,
        string targetDescription
    );

    event MarketClosed(uint32 indexed marketId);
    event MarketResolved(uint32 indexed marketId, Outcome outcome, uint128 payoutPool, uint128 totalWinningStake);
    event MarketVoided(uint32 indexed marketId);
    event MarketResolverUpdated(uint32 indexed marketId, address indexed newResolver);
    event MarketMetadataUpdated(uint32 indexed marketId, string newMetadataURI);
    event StakePlaced(uint32 indexed marketId, address indexed user, Outcome outcome, uint256 amount);
    event StakeClaimed(uint32 indexed marketId, address indexed user, uint256 payout, bool wasVoid);

    // ---------------------------------------------------------------------
    // Errors
    // ---------------------------------------------------------------------

    error InvalidFee();
    error InvalidResolver();
    error InvalidCloseTime();
    error MarketClosedOrResolved();
    error MarketTradingClosed();
    error MarketNotReadyForResolution();
    error MarketAlreadyResolved();
    error MarketNotResolved();
    error MarketNotVoid();
    error NothingToClaim();
    error OutcomeRequired();
    error UnauthorizedResolver();
    error UnauthorizedCreator();
    error UnauthorizedCloser();
    error UnauthorizedCaller();
    error ZeroAmount();
    error OracleConditionRequired();

    // ---------------------------------------------------------------------
    // Constructor
    // ---------------------------------------------------------------------

    constructor(IERC20 token, address treasuryAddress) {
        if (treasuryAddress == address(0)) revert InvalidResolver();
        stakingToken = token;
        treasury = treasuryAddress;

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(GUARDIAN_ROLE, msg.sender);
        _grantRole(CREATOR_ROLE, msg.sender);
        _grantRole(RESOLVER_ROLE, msg.sender);
    }

    // ---------------------------------------------------------------------
    // Admin actions
    // ---------------------------------------------------------------------

    function setTreasury(address newTreasury) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (newTreasury == address(0)) revert InvalidResolver();
        treasury = newTreasury;
    }

    function pause() external onlyRole(GUARDIAN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(GUARDIAN_ROLE) {
        _unpause();
    }

    // ---------------------------------------------------------------------
    // Market lifecycle
    // ---------------------------------------------------------------------

    function createMarket(CreateMarketParams calldata params) external whenNotPaused returns (uint32 marketId) {
        if (!hasRole(CREATOR_ROLE, msg.sender)) revert UnauthorizedCreator();
        if (params.closeTime <= block.timestamp) revert InvalidCloseTime();
        if (params.protocolFeeBps > MAX_PROTOCOL_FEE_BPS || params.creatorFeeBps > MAX_CREATOR_FEE_BPS) {
            revert InvalidFee();
        }
        if (params.resolver == address(0)) revert InvalidResolver();
        if (params.usesOracle && params.condition.conditionType == bytes32(0)) revert OracleConditionRequired();

        marketId = nextMarketId++;

        markets[marketId] = Market({
            questionId: params.questionId,
            metadataURI: params.metadataURI,
            creator: msg.sender,
            resolver: params.resolver,
            closeTime: params.closeTime,
            resolveTime: 0,
            protocolFeeBps: params.protocolFeeBps,
            creatorFeeBps: params.creatorFeeBps,
            yesPool: 0,
            noPool: 0,
            payoutPool: 0,
            totalWinningStake: 0,
            status: MarketStatus.Live,
            winningOutcome: Outcome.Undefined,
            usesOracle: params.usesOracle
        });

        if (params.usesOracle) {
            _oracleConditions[marketId] = OracleCondition({
                conditionType: params.condition.conditionType,
                dataFeedId: params.condition.dataFeedId,
                targetValue: params.condition.targetValue,
                targetDescription: params.condition.targetDescription,
                extraData: params.condition.extraData
            });

            emit MarketOracleConfigured(
                marketId,
                params.condition.conditionType,
                keccak256(bytes(params.condition.dataFeedId)),
                params.condition.targetValue,
                params.condition.targetDescription
            );
        }

        emit MarketCreated(
            marketId,
            params.questionId,
            msg.sender,
            params.resolver,
            params.closeTime,
            params.usesOracle,
            params.protocolFeeBps,
            params.creatorFeeBps,
            params.metadataURI
        );
    }

    function closeMarket(uint32 marketId) external {
        Market storage market = markets[marketId];
        if (market.status != MarketStatus.Live) revert MarketClosedOrResolved();
        if (msg.sender != market.creator && !hasRole(GUARDIAN_ROLE, msg.sender)) revert UnauthorizedCloser();
        market.status = MarketStatus.Closed;
        emit MarketClosed(marketId);
    }

    function updateResolver(uint32 marketId, address newResolver) external {
        if (newResolver == address(0)) revert InvalidResolver();
        Market storage market = markets[marketId];
        if (msg.sender != market.creator && !hasRole(DEFAULT_ADMIN_ROLE, msg.sender)) revert UnauthorizedCaller();
        market.resolver = newResolver;
        emit MarketResolverUpdated(marketId, newResolver);
    }

    function updateMetadata(uint32 marketId, string calldata newMetadataURI) external {
        Market storage market = markets[marketId];
        if (msg.sender != market.creator && !hasRole(DEFAULT_ADMIN_ROLE, msg.sender)) revert UnauthorizedCaller();
        market.metadataURI = newMetadataURI;
        emit MarketMetadataUpdated(marketId, newMetadataURI);
    }

    // ---------------------------------------------------------------------
    // Staking
    // ---------------------------------------------------------------------

    function stake(uint32 marketId, Outcome outcome, uint128 amount) external whenNotPaused nonReentrant {
        if (amount == 0) revert ZeroAmount();
        if (outcome == Outcome.Undefined) revert OutcomeRequired();

        Market storage market = markets[marketId];
        if (market.status != MarketStatus.Live) revert MarketClosedOrResolved();
        if (block.timestamp >= market.closeTime) revert MarketTradingClosed();

        stakingToken.safeTransferFrom(msg.sender, address(this), amount);

        Position storage position = _positions[marketId][msg.sender];
        if (outcome == Outcome.Yes) {
            position.yesStake += amount;
            market.yesPool += amount;
        } else {
            position.noStake += amount;
            market.noPool += amount;
        }

        emit StakePlaced(marketId, msg.sender, outcome, amount);
    }

    // ---------------------------------------------------------------------
    // Resolution
    // ---------------------------------------------------------------------

    function resolveMarket(uint32 marketId, Outcome outcome) external whenNotPaused {
        if (outcome == Outcome.Undefined) revert OutcomeRequired();

        Market storage market = markets[marketId];
        if (market.status == MarketStatus.Resolved) revert MarketAlreadyResolved();
        if (block.timestamp < market.closeTime) revert MarketNotReadyForResolution();
        if (msg.sender != market.resolver && !hasRole(RESOLVER_ROLE, msg.sender)) revert UnauthorizedResolver();
        if (market.usesOracle && _oracleConditions[marketId].conditionType == bytes32(0)) {
            revert OracleConditionRequired();
        }

        uint128 yesPool = market.yesPool;
        uint128 noPool = market.noPool;
        uint128 totalPool = yesPool + noPool;

        market.resolveTime = uint64(block.timestamp);

        if (totalPool == 0) {
            market.status = MarketStatus.Void;
            market.winningOutcome = Outcome.Undefined;
            emit MarketVoided(marketId);
            return;
        }

        uint128 winningStake = outcome == Outcome.Yes ? yesPool : noPool;
        if (winningStake == 0) {
            market.status = MarketStatus.Void;
            market.winningOutcome = Outcome.Undefined;
            emit MarketVoided(marketId);
            return;
        }

        uint256 protocolFee = (uint256(totalPool) * market.protocolFeeBps) / BPS_DENOMINATOR;
        uint256 creatorFee = (uint256(totalPool) * market.creatorFeeBps) / BPS_DENOMINATOR;
        uint256 payoutPool = uint256(totalPool) - protocolFee - creatorFee;

        market.status = MarketStatus.Resolved;
        market.winningOutcome = outcome;
        market.payoutPool = uint128(payoutPool);
        market.totalWinningStake = winningStake;

        if (protocolFee > 0) {
            stakingToken.safeTransfer(treasury, protocolFee);
        }
        if (creatorFee > 0) {
            stakingToken.safeTransfer(market.creator, creatorFee);
        }

        emit MarketResolved(marketId, outcome, uint128(payoutPool), winningStake);
    }

    // ---------------------------------------------------------------------
    // Claims
    // ---------------------------------------------------------------------

    function claim(uint32 marketId) external nonReentrant {
        Market storage market = markets[marketId];
        if (market.status == MarketStatus.Live || market.status == MarketStatus.Closed) revert MarketNotResolved();

        Position storage position = _positions[marketId][msg.sender];
        uint256 payout;
        bool wasVoid = market.status == MarketStatus.Void;

        if (wasVoid) {
            uint128 totalStake = position.yesStake + position.noStake;
            if (totalStake == 0) revert NothingToClaim();
            position.yesStake = 0;
            position.noStake = 0;
            payout = totalStake;
        } else {
            Outcome winningOutcome = market.winningOutcome;
            uint128 userStake = winningOutcome == Outcome.Yes ? position.yesStake : position.noStake;
            if (userStake == 0) revert NothingToClaim();

            position.yesStake = winningOutcome == Outcome.Yes ? 0 : position.yesStake;
            position.noStake = winningOutcome == Outcome.No ? 0 : position.noStake;

            payout = (uint256(userStake) * market.payoutPool) / market.totalWinningStake;
        }

        stakingToken.safeTransfer(msg.sender, payout);
        emit StakeClaimed(marketId, msg.sender, payout, wasVoid);
    }

    // ---------------------------------------------------------------------
    // View helpers
    // ---------------------------------------------------------------------

    function positionOf(uint32 marketId, address user) external view returns (uint128 yesStake, uint128 noStake) {
        Position storage position = _positions[marketId][user];
        yesStake = position.yesStake;
        noStake = position.noStake;
    }

    function marketPools(uint32 marketId) external view returns (uint128 yesPool, uint128 noPool) {
        Market storage market = markets[marketId];
        yesPool = market.yesPool;
        noPool = market.noPool;
    }

    function getOracleCondition(uint32 marketId) external view returns (OracleCondition memory) {
        return _oracleConditions[marketId];
    }
}

