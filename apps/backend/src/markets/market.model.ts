import mongoose from "mongoose";

export type MarketType = "crypto" | "sports" | "event";
export type ResolutionSource = "flare" | "coingecko";
export type MarketStatus = "pending" | "resolved";
export type OutcomeSide = "yes" | "no";

export interface MarketDocument extends mongoose.Document {
  onChainId: number;
  title: string;
  description?: string;
  category: "Sports" | "Crypto" | "Culture";
  marketType: MarketType;
  resolutionSource: ResolutionSource;
  condition?: {
    target: number;
    operator: ">" | "<" | ">=" | "<=" | "==";
  };
  asset?: string;
  status: MarketStatus;
  outcome: OutcomeSide | null;
  createdAt: Date;
  updatedAt: Date;
}

const ConditionSchema = new mongoose.Schema(
  {
    target: { type: Number, required: true },
    operator: {
      type: String,
      required: true,
      enum: [">", "<", ">=", "<=", "=="],
    },
  },
  { _id: false }
);

const MarketSchema = new mongoose.Schema<MarketDocument>(
  {
    onChainId: { type: Number, required: true, unique: true, index: true },
    title: { type: String, required: true },
    description: { type: String },
    category: {
      type: String,
      required: true,
      enum: ["Sports", "Crypto", "Culture"],
    },
    marketType: {
      type: String,
      required: true,
      enum: ["crypto", "sports", "event"],
    },
    resolutionSource: {
      type: String,
      required: true,
      enum: ["flare", "coingecko"],
    },
    condition: { type: ConditionSchema },
    asset: { type: String },
    status: {
      type: String,
      required: true,
      enum: ["pending", "resolved"],
      default: "pending",
    },
    outcome: {
      type: String,
      enum: ["yes", "no"],
      default: null,
    },
  },
  { timestamps: true }
);

export const MarketModel =
  mongoose.models.Market ||
  mongoose.model<MarketDocument>("Market", MarketSchema);


