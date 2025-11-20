import { ethers } from "hardhat";

async function main() {
  const owner = process.env.OWNER ?? "";
  if (!owner) {
    throw new Error("Set OWNER to the wallet address you want to inspect");
  }

  const spender = "0x1229229745005BC2077Efa78bD86bEa241ad1A43";
  const tokenAddress = "0x6c23508A9b310C5f2eb2e2eFeBeB748067478667";

  const token = await ethers.getContractAt("MockERC20", tokenAddress);
  const allowance = await token.allowance(owner, spender);
  const balance = await token.balanceOf(owner);

  console.log(`Allowance from ${owner} to manager: ${ethers.formatUnits(allowance, 18)} cUSD`);
  console.log(`Balance of ${owner}: ${ethers.formatUnits(balance, 18)} cUSD`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});


