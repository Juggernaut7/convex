// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title ConvexMarketManager
 * @notice Admin-curated conviction markets for crypto and sports prediction.
 * @dev This contract focuses on:
 *      - holding market state and pools,
 *      - enforcing staking + claiming rules,
 *      - allowing a designated resolver address to finalize outcomes.
 *      External oracle / backend logic runs off-chain and calls `finalizeFromResolver`.
 */
contract ConvexMarketManager is AccessControl, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ---------------------------------------------------------------------
    // Roles & constants
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

    enum MarketType {
        Price,
        Sports
    }

    enum Outcome {
        Undefined,
        Yes,
        No
    }

    enum MarketStatus {
        Live,
        Resolving,
        Resolved,
        Void
    }

    enum Comparator {
        GreaterThan,
        GreaterThanOrEqual,
        LessThan,
        LessThanOrEqual
    }

    struct Position {
        uint128 yesStake;
        uint128 noStake;
    }

    struct Market {
        MarketType marketType;
        MarketStatus status;
        Outcome winningOutcome;
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
        bytes32 metadataHash;
    }

    struct CreateMarketParams {
        MarketType marketType;
        uint64 closeTime;
        address resolver;
        uint16 protocolFeeBps;
        uint16 creatorFeeBps;
        bytes32 metadataHash;
        // extraData slot reserved for future extensions (not used by core logic)
        bytes extraData;
    }

    // ---------------------------------------------------------------------
    // Storage
    // ---------------------------------------------------------------------

    IERC20 public immutable stakingToken;
    address public treasury;
    uint32 public nextMarketId;

    mapping(uint32 => Market) public markets;
    mapping(uint32 => mapping(address => Position)) private _positions;

    // ---------------------------------------------------------------------
    // Events
    // ---------------------------------------------------------------------

    event MarketCreated(
        uint32 indexed marketId,
        MarketType indexed marketType,
        address indexed resolver,
        uint64 closeTime,
        bytes32 metadataHash
    );

    event MarketResolved(
        uint32 indexed marketId,
        Outcome outcome,
        uint128 payoutPool,
        uint128 totalWinningStake,
        bytes resolverContext
    );
    event MarketVoided(uint32 indexed marketId);
    event StakePlaced(uint32 indexed marketId, address indexed account, Outcome outcome, uint256 amount);
    event StakeClaimed(uint32 indexed marketId, address indexed account, uint256 payout, bool wasVoid);

    // ---------------------------------------------------------------------
    // Errors
    // ---------------------------------------------------------------------

    error InvalidAddress();
    error InvalidCloseTime();
    error InvalidFees();
    error InvalidMarketType();
    error InvalidOutcome();
    error InvalidResolver();
    error MarketNotLive();
    error MarketTradingClosed();
    error MarketNotReady();
    error MarketAlreadyResolved();
    error MarketNotResolved();
    error NothingToClaim();
    error ZeroAmount();
    error OnlyResolver();
    error InvalidExtraData();

    // ---------------------------------------------------------------------
    // Constructor
    // ---------------------------------------------------------------------

    constructor(IERC20 stakingToken_, address treasury_) {
        if (address(stakingToken_) == address(0) || treasury_ == address(0)) revert InvalidAddress();
        stakingToken = stakingToken_;
        treasury = treasury_;

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(GUARDIAN_ROLE, msg.sender);
        _grantRole(CREATOR_ROLE, msg.sender);
        _grantRole(RESOLVER_ROLE, msg.sender);
    }

    // ---------------------------------------------------------------------
    // Admin
    // ---------------------------------------------------------------------

    function setTreasury(address newTreasury) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (newTreasury == address(0)) revert InvalidAddress();
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

    function createMarket(CreateMarketParams calldata params) external whenNotPaused onlyRole(CREATOR_ROLE) returns (uint32) {
        if (params.closeTime <= block.timestamp) revert InvalidCloseTime();
        if (params.resolver == address(0)) revert InvalidResolver();
        if (params.protocolFeeBps > MAX_PROTOCOL_FEE_BPS || params.creatorFeeBps > MAX_CREATOR_FEE_BPS) {
            revert InvalidFees();
        }

        uint32 marketId = nextMarketId++;
        markets[marketId] = Market({
            marketType: params.marketType,
            status: MarketStatus.Live,
            winningOutcome: Outcome.Undefined,
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
            metadataHash: params.metadataHash
        });
        _applyMarketConfig(marketId, params);

        emit MarketCreated(marketId, params.marketType, params.resolver, params.closeTime, params.metadataHash);
        return marketId;
    }

    function _applyMarketConfig(uint32, CreateMarketParams calldata params) private pure {
        // Currently no additional on-chain config is required beyond metadataHash.
        // This hook exists to keep the constructor stable if we extend config later.
        if (params.marketType != MarketType.Price && params.marketType != MarketType.Sports) {
            revert InvalidMarketType();
        }
    }

    // ---------------------------------------------------------------------
    // Staking
    // ---------------------------------------------------------------------

    function stake(uint32 marketId, Outcome side, uint128 amount) external whenNotPaused nonReentrant {
        if (amount == 0) revert ZeroAmount();
        if (side == Outcome.Undefined) revert InvalidOutcome();

        Market storage market = markets[marketId];
        if (market.status != MarketStatus.Live) revert MarketNotLive();
        if (block.timestamp >= market.closeTime) revert MarketTradingClosed();

        stakingToken.safeTransferFrom(msg.sender, address(this), amount);
        Position storage position = _positions[marketId][msg.sender];

        if (side == Outcome.Yes) {
            position.yesStake += amount;
            market.yesPool += amount;
        } else {
            position.noStake += amount;
            market.noPool += amount;
        }

        emit StakePlaced(marketId, msg.sender, side, amount);
    }

    // ---------------------------------------------------------------------
    // Resolution
    // ---------------------------------------------------------------------

    function resolveMarket(uint32 marketId, Outcome outcome) external whenNotPaused {
        if (outcome == Outcome.Undefined) revert InvalidOutcome();

        Market storage market = markets[marketId];
        if (market.status == MarketStatus.Resolved) revert MarketAlreadyResolved();
        if (block.timestamp < market.closeTime) revert MarketNotReady();
        
        // Allow resolver role OR the assigned resolver address
        if (msg.sender != market.resolver && !hasRole(RESOLVER_ROLE, msg.sender)) {
            revert OnlyResolver();
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

        emit MarketResolved(marketId, outcome, uint128(payoutPool), winningStake, "");
    }

    function finalizeFromResolver(
        uint32 marketId,
        Outcome outcome,
        bytes calldata resolverContext
    ) external whenNotPaused {
        if (outcome == Outcome.Undefined) revert InvalidOutcome();

        Market storage market = markets[marketId];
        if (market.status == MarketStatus.Resolved) revert MarketAlreadyResolved();
        if (block.timestamp < market.closeTime) revert MarketNotReady();
        if (msg.sender != market.resolver) revert OnlyResolver();

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

        emit MarketResolved(marketId, outcome, uint128(payoutPool), winningStake, resolverContext);
    }

    // ---------------------------------------------------------------------
    // Claims
    // ---------------------------------------------------------------------

    function claim(uint32 marketId) external nonReentrant {
        Market storage market = markets[marketId];
        if (market.status == MarketStatus.Live || market.status == MarketStatus.Resolving) revert MarketNotResolved();

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

            if (winningOutcome == Outcome.Yes) {
                position.yesStake = 0;
            } else {
                position.noStake = 0;
            }

            payout = (uint256(userStake) * market.payoutPool) / market.totalWinningStake;
        }

        stakingToken.safeTransfer(msg.sender, payout);
        emit StakeClaimed(marketId, msg.sender, payout, wasVoid);
    }

    // ---------------------------------------------------------------------
    // Views
    // ---------------------------------------------------------------------

    function positionOf(uint32 marketId, address account) external view returns (uint128 yesStake, uint128 noStake) {
        Position storage position = _positions[marketId][account];
        yesStake = position.yesStake;
        noStake = position.noStake;
    }

    function getMarket(uint32 marketId) external view returns (Market memory) {
        return markets[marketId];
    }
}

