import { expect } from "chai";
import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import { ethers } from "hardhat";

const ONE_TOKEN = 10n ** 18n;
const TEN_TOKENS = 10n * ONE_TOKEN;

enum Outcome {
  Undefined,
  Yes,
  No
}

async function deployManagerFixture() {
  const [deployer, creator, resolver, alice, bob, treasury] = await ethers.getSigners();

  const Token = await ethers.getContractFactory("MockERC20");
  const token = await Token.deploy("Mock Stable", "mUSD");
  await token.waitForDeployment();

  const Manager = await ethers.getContractFactory("ConvexMarketManager");
  const manager = await Manager.deploy(await token.getAddress(), treasury.address);
  await manager.waitForDeployment();

  // Grant roles
  await manager.grantRole(await manager.CREATOR_ROLE(), creator.address);
  await manager.grantRole(await manager.RESOLVER_ROLE(), resolver.address);

  return {
    token,
    manager,
    deployer,
    creator,
    resolver,
    alice,
    bob,
    treasury
  };
}

describe("ConvexMarketManager", function () {
  describe("createMarket", function () {
    it("stores oracle configuration and emits events", async function () {
      const { manager, creator, resolver } = await loadFixture(deployManagerFixture);

      const now = await time.latest();
      const closeTime = now + 3600;

      const params = {
        questionId: ethers.encodeBytes32String("btc-above-70k"),
        closeTime,
        resolver: resolver.address,
        usesOracle: true,
        protocolFeeBps: 250,
        creatorFeeBps: 100,
        metadataURI: "ipfs://market-metadata",
        condition: {
          conditionType: ethers.keccak256(ethers.toUtf8Bytes("PRICE_GREATER_THAN")),
          dataFeedId: "coingecko:bitcoin",
          targetValue: 70_000n * 10n ** 8n, // price with 8 decimals for backend parity
          targetDescription: "BTC >= $70k at settlement",
          extraData: ethers.toUtf8Bytes("{" + '"interval":"5m"' + "}")
        }
      };

      await expect(manager.connect(creator).createMarket(params))
        .to.emit(manager, "MarketCreated")
        .withArgs(
          0,
          params.questionId,
          creator.address,
          resolver.address,
          closeTime,
          true,
          params.protocolFeeBps,
          params.creatorFeeBps,
          params.metadataURI
        )
        .and.to.emit(manager, "MarketOracleConfigured")
        .withArgs(
          0,
          params.condition.conditionType,
          ethers.keccak256(ethers.toUtf8Bytes(params.condition.dataFeedId)),
          params.condition.targetValue,
          params.condition.targetDescription
        );

      const stored = await manager.markets(0);
      expect(stored.creator).to.equal(creator.address);
      expect(stored.resolver).to.equal(resolver.address);
      expect(stored.metadataURI).to.equal(params.metadataURI);
      expect(stored.usesOracle).to.equal(true);

      const condition = await manager.getOracleCondition(0);
      expect(condition.conditionType).to.equal(params.condition.conditionType);
      expect(condition.dataFeedId).to.equal(params.condition.dataFeedId);
      expect(condition.targetValue).to.equal(params.condition.targetValue);
      expect(condition.targetDescription).to.equal(params.condition.targetDescription);
    });

    it("reverts when close time is in the past", async function () {
      const { manager, creator, resolver } = await loadFixture(deployManagerFixture);

      const params = {
        questionId: ethers.encodeBytes32String("invalid-market"),
        closeTime: (await time.latest()) - 1,
        resolver: resolver.address,
        usesOracle: false,
        protocolFeeBps: 100,
        creatorFeeBps: 0,
        metadataURI: "",
        condition: {
          conditionType: ethers.ZeroHash,
          dataFeedId: "",
          targetValue: 0,
          targetDescription: "",
          extraData: "0x"
        }
      };

      await expect(manager.connect(creator).createMarket(params)).to.be.revertedWithCustomError(
        manager,
        "InvalidCloseTime"
      );
    });
  });

  describe("staking and resolution", function () {
    it("allows staking, resolution, and claiming payouts", async function () {
      const { token, manager, creator, resolver, alice, bob, treasury } =
        await loadFixture(deployManagerFixture);

      const params = {
        questionId: ethers.encodeBytes32String("btc-above-70k"),
        closeTime: (await time.latest()) + 3600,
        resolver: resolver.address,
        usesOracle: true,
        protocolFeeBps: 0,
        creatorFeeBps: 0,
        metadataURI: "ipfs://market",
        condition: {
          conditionType: ethers.keccak256(ethers.toUtf8Bytes("PRICE_GREATER_THAN")),
          dataFeedId: "coingecko:bitcoin",
          targetValue: 70_000n * 10n ** 8n,
          targetDescription: "BTC >= $70k",
          extraData: "0x"
        }
      };

      await manager.connect(creator).createMarket(params);

      // Mint and approve token balances
  await token.connect(creator).mint(alice.address, TEN_TOKENS);
  await token.connect(creator).mint(bob.address, TEN_TOKENS);
      await token.connect(alice).approve(await manager.getAddress(), TEN_TOKENS);
      await token.connect(bob).approve(await manager.getAddress(), TEN_TOKENS);

      await manager.connect(alice).stake(0, Outcome.Yes, TEN_TOKENS);
      await manager.connect(bob).stake(0, Outcome.No, 5n * ONE_TOKEN);

      // fast-forward past close time
      await time.increaseTo(params.closeTime + 1);

      await manager.connect(resolver).resolveMarket(0, Outcome.Yes);

      const market = await manager.markets(0);
      expect(market.status).to.equal(2n); // Resolved

      const aliceBalanceBefore = await token.balanceOf(alice.address);
      await manager.connect(alice).claim(0);
      const aliceBalanceAfter = await token.balanceOf(alice.address);

      // Alice staked 10, Bob 5 on losing side => total pool 15, Alice should get full 15 back.
      expect(aliceBalanceAfter - aliceBalanceBefore).to.equal(15n * ONE_TOKEN);

      // Bob should be unable to claim since he lost.
      await expect(manager.connect(bob).claim(0)).to.be.revertedWithCustomError(manager, "NothingToClaim");
    });
  });

  describe("permissions", function () {
    it("prevents non resolvers from resolving", async function () {
      const { manager, creator, alice } = await loadFixture(deployManagerFixture);
      const now = await time.latest();

      await manager.connect(creator).createMarket({
        questionId: ethers.encodeBytes32String("unauthorised"),
        closeTime: now + 10,
        resolver: creator.address,
        usesOracle: false,
        protocolFeeBps: 0,
        creatorFeeBps: 0,
        metadataURI: "",
        condition: {
          conditionType: ethers.ZeroHash,
          dataFeedId: "",
          targetValue: 0,
          targetDescription: "",
          extraData: "0x"
        }
      });

      await time.increaseTo(now + 11);

      await expect(manager.connect(alice).resolveMarket(0, Outcome.Yes)).to.be.revertedWithCustomError(
        manager,
        "UnauthorizedResolver"
      );
    });
  });
});

