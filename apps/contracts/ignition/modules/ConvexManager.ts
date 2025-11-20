import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const stakingTokenAddress =
  process.env.STAKING_TOKEN_ADDRESS ?? process.env.MARKET_STAKING_TOKEN ?? "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const treasuryAddress = process.env.TREASURY_ADDRESS ?? "0xcccccccccccccccccccccccccccccccccccccccc";

if (!stakingTokenAddress) {
  throw new Error("Missing STAKING_TOKEN_ADDRESS environment variable for ConvexMarketManager deployment");
}

if (!treasuryAddress) {
  throw new Error("Missing TREASURY_ADDRESS environment variable for ConvexMarketManager deployment");
}

export default buildModule("ConvexDeploymentModule", (m) => {
  const manager = m.contract("ConvexMarketManager", [stakingTokenAddress, treasuryAddress]);

  return { manager };
});
