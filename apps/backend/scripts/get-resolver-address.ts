import { ethers } from "ethers";
import * as dotenv from "dotenv";
import { resolve } from "path";

// Load .env from backend directory
dotenv.config({ path: resolve(__dirname, "../.env") });

const resolverPrivateKey = process.env.RESOLVER_PRIVATE_KEY;

if (!resolverPrivateKey) {
  console.error("❌ RESOLVER_PRIVATE_KEY not found in .env");
  console.error("\nPlease add RESOLVER_PRIVATE_KEY to apps/backend/.env");
  process.exit(1);
}

try {
  const wallet = new ethers.Wallet(resolverPrivateKey);
  console.log("\n✅ Resolver Address:");
  console.log(wallet.address);
  console.log("\n📋 Add this to your apps/web/.env.local:");
  console.log(`NEXT_PUBLIC_RESOLVER_ADDRESS=${wallet.address}\n`);
} catch (error) {
  console.error("❌ Invalid private key:", error);
  process.exit(1);
}


