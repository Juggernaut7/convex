import { erc20Abi } from "viem";
import { Address, Hex, PublicClient, WalletClient, createPublicClient, formatUnits, parseAbi, parseUnits, http } from "viem";

import { DEFAULT_CHAIN_ID, MANAGER_CONTRACT_ADDRESS, RPC_URL, STAKING_TOKEN_ADDRESS } from "@/lib/constants";
import { celoMainnet } from "@/lib/chains";

export const convexManagerAbi = parseAbi([
  "function stake(uint32 marketId, uint8 outcome, uint128 amount) external",
  "function claim(uint32 marketId) external",
  "function markets(uint32 marketId) external view returns (bytes32 questionId,string metadataURI,address creator,address resolver,uint64 closeTime,uint64 resolveTime,uint16 protocolFeeBps,uint16 creatorFeeBps,uint128 yesPool,uint128 noPool,uint128 payoutPool,uint128 totalWinningStake,uint8 status,uint8 winningOutcome,bool usesOracle)",
  "function positionOf(uint32 marketId, address user) external view returns (uint128 yesStake, uint128 noStake)",
]);

export interface MarketStruct {
  questionId: Hex;
  metadataURI: string;
  creator: Address;
  resolver: Address;
  closeTime: bigint;
  resolveTime: bigint;
  protocolFeeBps: number;
  creatorFeeBps: number;
  yesPool: bigint;
  noPool: bigint;
  payoutPool: bigint;
  totalWinningStake: bigint;
  status: number;
  winningOutcome: number;
  usesOracle: boolean;
}

export function decodeMarketStruct(raw: any): MarketStruct {
  const [
    questionId,
    metadataURI,
    creator,
    resolver,
    closeTime,
    resolveTime,
    protocolFeeBps,
    creatorFeeBps,
    yesPool,
    noPool,
    payoutPool,
    totalWinningStake,
    status,
    winningOutcome,
    usesOracle,
  ] = raw as [
    Hex,
    string,
    Address,
    Address,
    bigint,
    bigint,
    number,
    number,
    bigint,
    bigint,
    bigint,
    bigint,
    number,
    number,
    boolean
  ];

  return {
    questionId,
    metadataURI,
    creator,
    resolver,
    closeTime,
    resolveTime,
    protocolFeeBps,
    creatorFeeBps,
    yesPool,
    noPool,
    payoutPool,
    totalWinningStake,
    status,
    winningOutcome,
    usesOracle,
  };
}

let cachedPublicClient: PublicClient | null = null;

export function getPublicClient(): PublicClient {
  if (!cachedPublicClient) {
    cachedPublicClient = createPublicClient({
      chain: celoMainnet,
      transport: http(RPC_URL),
    });
  }
  return cachedPublicClient;
}

export async function fetchOnChainMarket(
  client: PublicClient,
  marketId: number
): Promise<MarketStruct | null> {
  try {
    const result = await client.readContract({
      address: MANAGER_CONTRACT_ADDRESS,
      abi: convexManagerAbi,
      functionName: "markets",
      args: [marketId],
    });
    return decodeMarketStruct(result);
  } catch (error) {
    console.error("Failed to read market struct", { marketId, error });
    return null;
  }
}

export async function fetchUserPosition(
  client: PublicClient,
  marketId: number,
  user: Address
) {
  const [yesStake, noStake] = (await client.readContract({
    address: MANAGER_CONTRACT_ADDRESS,
    abi: convexManagerAbi,
    functionName: "positionOf",
    args: [marketId, user],
  })) as [bigint, bigint];

  return {
    yesStake,
    noStake,
  };
}

export async function ensureAllowance(
  walletClient: WalletClient,
  publicClient: PublicClient,
  owner: Address,
  spender: Address,
  required: bigint
) {
  const allowance = (await publicClient.readContract({
    address: STAKING_TOKEN_ADDRESS,
    abi: erc20Abi,
    functionName: "allowance",
    args: [owner, spender],
  })) as bigint;

  if (allowance >= required) {
    return;
  }

  if (!walletClient.account) {
    throw new Error("Wallet account not available");
  }
  const hash = await walletClient.writeContract({
    account: walletClient.account,
    address: STAKING_TOKEN_ADDRESS,
    abi: erc20Abi,
    functionName: "approve",
    args: [spender, required],
    chain: celoMainnet,
  });

  await publicClient.waitForTransactionReceipt({ hash });
}

export async function stakeOnMarket(
  walletClient: WalletClient,
  publicClient: PublicClient,
  marketId: number,
  outcome: "yes" | "no",
  amount: bigint
) {
  const account = walletClient.account?.address;
  if (!account) {
    throw new Error("Wallet not connected");
  }

  await ensureAllowance(walletClient, publicClient, account, MANAGER_CONTRACT_ADDRESS, amount);

  const outcomeEnum = outcome === "yes" ? 1 : 2;
  if (!walletClient.account) {
    throw new Error("Wallet account not available");
  }
  const hash = await walletClient.writeContract({
    account: walletClient.account,
    address: MANAGER_CONTRACT_ADDRESS,
    abi: convexManagerAbi,
    functionName: "stake",
    args: [marketId, outcomeEnum, amount],
    chain: celoMainnet,
  });

  await publicClient.waitForTransactionReceipt({ hash });

  return hash;
}

export async function claimWinnings(
  walletClient: WalletClient,
  publicClient: PublicClient,
  marketId: number
) {
  if (!walletClient.account) {
    throw new Error("Wallet account not available");
  }
  const hash = await walletClient.writeContract({
    account: walletClient.account,
    address: MANAGER_CONTRACT_ADDRESS,
    abi: convexManagerAbi,
    functionName: "claim",
    args: [marketId],
    chain: celoMainnet,
  });

  await publicClient.waitForTransactionReceipt({ hash });
  return hash;
}

export function formatTokenAmount(value: bigint, decimals = 18): number {
  return Number(formatUnits(value, decimals));
}

export function toTokenValue(amount: string | number, decimals = 18): bigint {
  return parseUnits(String(amount), decimals);
}

