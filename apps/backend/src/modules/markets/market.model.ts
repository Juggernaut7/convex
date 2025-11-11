import mongoose, { Schema, type Model } from "mongoose";

export type MarketCategory = "sports" | "crypto" | "culture" | "custom";
export type MarketResolutionSource = "manual" | "oracle";

export interface MarketDocument {
  _id: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  category: MarketCategory;
  marketType: "price" | "event";
  onChainMarketId?: number;
  oracleId?: string;
  thresholdValue?: number;
  eventReference?: string;
  closeTime: Date;
  resolveBy?: Date;
  createdBy: mongoose.Types.ObjectId;
  status: "draft" | "live" | "settled" | "void";
  resolutionSource: MarketResolutionSource;
  winningOutcome?: "yes" | "no";
  oracleMeta?: {
    lastResolutionTx?: string;
    payload?: Record<string, unknown>;
    lastError?: string;
    lastErrorAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

type MarketModel = Model<MarketDocument>;

const marketSchema = new Schema<MarketDocument, MarketModel>(
  {
    title: { type: String, required: true },
    description: { type: String },
    category: { type: String, enum: ["sports", "crypto", "culture", "custom"], default: "custom" },
    marketType: { type: String, enum: ["price", "event"], required: true },
    onChainMarketId: { type: Number, index: true },
    oracleId: { type: String },
    thresholdValue: { type: Number },
    eventReference: { type: String },
    closeTime: { type: Date, required: true },
    resolveBy: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["draft", "live", "settled", "void"], default: "draft", index: true },
    resolutionSource: { type: String, enum: ["manual", "oracle"], default: "manual" },
    winningOutcome: { type: String, enum: ["yes", "no"] },
    oracleMeta: {
      lastResolutionTx: { type: String },
      payload: { type: Schema.Types.Mixed },
      lastError: { type: String },
      lastErrorAt: { type: Date }
    }
  },
  { timestamps: true }
);

export const Market = mongoose.model<MarketDocument, MarketModel>("Market", marketSchema);

