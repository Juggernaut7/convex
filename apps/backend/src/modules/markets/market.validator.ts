import { z } from "zod";

const oracleMetaSchema = z
  .object({
    lastResolutionTx: z.string().optional(),
    payload: z.record(z.any()).optional(),
    lastError: z.string().optional(),
    lastErrorAt: z.coerce.date().optional()
  })
  .partial();

export const createMarketSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  category: z.enum(["sports", "crypto", "culture", "custom"]).default("custom"),
  marketType: z.enum(["price", "event"]),
  onChainMarketId: z.number().int().nonnegative().optional(),
  oracleId: z.string().optional(),
  thresholdValue: z.number().optional(),
  eventReference: z.string().optional(),
  closeTime: z.coerce.date(),
  resolveBy: z.coerce.date().optional(),
  resolutionSource: z.enum(["manual", "oracle"]).default("manual"),
  status: z.enum(["draft", "live", "settled", "void"]).default("draft").optional(),
  oracleMeta: oracleMetaSchema.optional()
});

export const updateMarketSchema = createMarketSchema.partial().extend({
  status: z.enum(["draft", "live", "settled", "void"]).optional(),
  winningOutcome: z.enum(["yes", "no"]).optional()
});

export type CreateMarketInput = z.infer<typeof createMarketSchema>;
export type UpdateMarketInput = z.infer<typeof updateMarketSchema>;

