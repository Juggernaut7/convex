import { ethers } from "hardhat";

async function main() {
  const [signer] = await ethers.getSigners();

  const tokenAddress = "0x6c23508A9b310C5f2eb2e2eFeBeB748067478667";
  const recipient = process.env.MINT_RECIPIENT ?? signer.address;
  const amount = ethers.parseUnits(process.env.MINT_AMOUNT ?? "1000", 18);

  console.log(`Minting ${ethers.formatUnits(amount, 18)} tokens to ${recipient}`);
  console.log(`Using signer ${signer.address}`);

  const token = await ethers.getContractAt("MockERC20", tokenAddress, signer);
  const tx = await token.mint(recipient, amount);
  console.log(`Mint transaction sent: ${tx.hash}`);
  await tx.wait();
  console.log("Mint confirmed!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});


