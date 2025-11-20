import { ethers } from "hardhat";

async function main() {
  const marketId = Number(process.env.MARKET_ID ?? "0");
  const managerAddress = "0x1229229745005BC2077Efa78bD86bEa241ad1A43";

  const manager = await ethers.getContractAt("ConvexMarketManager", managerAddress);
  const market = await manager.markets(marketId);

  console.log(`Market ${marketId} details:`);
  console.log({
    closeTime: Number(market.closeTime),
    status: market.status,
    yesPool: market.yesPool.toString(),
    noPool: market.noPool.toString(),
  });

  const block = await ethers.provider.getBlock("latest");
  console.log(`Current timestamp: ${block?.timestamp}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});


