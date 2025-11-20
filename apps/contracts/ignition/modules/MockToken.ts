import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const tokenName = process.env.MOCK_TOKEN_NAME ?? "Convex Stable";
const tokenSymbol = process.env.MOCK_TOKEN_SYMBOL ?? "cUSD";

export default buildModule("MockTokenModule", (m) => {
  const token = m.contract("MockERC20", [tokenName, tokenSymbol]);

  return { token };
});
