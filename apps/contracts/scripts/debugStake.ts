import { ethers } from "hardhat";

async function main() {
  console.log("Debugging stake revert...");
  const [signer] = await ethers.getSigners();

  const managerAddress = "0x1229229745005BC2077Efa78bD86bEa241ad1A43";
  const marketId = Number(process.env.MARKET_ID ?? "2");
  const amount = ethers.parseUnits(process.env.AMOUNT ?? "1", 18);

  const manager = await ethers.getContractAt("ConvexMarketManager", managerAddress);

  const calldata = manager.interface.encodeFunctionData("stake", [marketId, 1, amount]);

  try {
    await ethers.provider.call({
      to: managerAddress,
      data: calldata,
      from: signer.address,
    });
    console.log("Call succeeded unexpectedly.");
  } catch (error) {
    console.error("Call reverted.");
    console.error(error);
    // @ts-expect-error ethers provider error data
    const data = error?.data ?? error?.error?.data;
    if (data) {
      console.error("Revert data:", data);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
