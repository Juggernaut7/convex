import { ethers } from "hardhat";

async function main() {
  const managerAddress = process.env.MANAGER_ADDRESS ?? "0x1229229745005BC2077Efa78bD86bEa241ad1A43";
  const manager = await ethers.getContractAt("ConvexMarketManager", managerAddress);
  const token = await manager.stakingToken();
  console.log(`Manager ${managerAddress} stakingToken:`, token);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
