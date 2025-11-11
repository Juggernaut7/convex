import { Types } from "mongoose";
import { StatusCodes } from "http-status-codes";
import { Market, type MarketDocument } from "./market.model.js";
import type { CreateMarketInput, UpdateMarketInput } from "./market.validator.js";
import { AppError } from "../../errors/app-error.js";

export async function listMarkets(query: Partial<Pick<MarketDocument, "category" | "status">> = {}) {
  return Market.find(query).sort({ closeTime: 1 }).lean();
}

export async function getMarketById(id: string) {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid market id", StatusCodes.BAD_REQUEST);
  }
  const market = await Market.findById(id).lean();
  if (!market) {
    throw new AppError("Market not found", StatusCodes.NOT_FOUND);
  }
  return market;
}

export async function createMarket(input: CreateMarketInput, createdBy: string) {
  const market = await Market.create({
    ...input,
    createdBy,
    status: input.status ?? "draft"
  });
  return market.toObject();
}

export async function updateMarket(id: string, input: UpdateMarketInput) {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid market id", StatusCodes.BAD_REQUEST);
  }
  const market = await Market.findByIdAndUpdate(id, input, { new: true }).lean();
  if (!market) {
    throw new AppError("Market not found", StatusCodes.NOT_FOUND);
  }
  return market;
}

export async function deleteMarket(id: string) {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid market id", StatusCodes.BAD_REQUEST);
  }
  const market = await Market.findByIdAndDelete(id).lean();
  if (!market) {
    throw new AppError("Market not found", StatusCodes.NOT_FOUND);
  }
  return market;
}

