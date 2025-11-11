import type { Response } from "express";
import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "../../middleware/async-handler.js";
import type { AuthenticatedRequest } from "../../middleware/auth.js";
import { registerSchema, loginSchema } from "./auth.validator.js";
import { registerUser, authenticateUser } from "./auth.service.js";

export const register = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const payload = registerSchema.parse(req.body);
  const user = await registerUser(payload);
  return res.status(StatusCodes.CREATED).json({ success: true, data: user });
});

export const login = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const payload = loginSchema.parse(req.body);
  const authResponse = await authenticateUser(payload);
  return res.status(StatusCodes.OK).json({ success: true, data: authResponse });
});

