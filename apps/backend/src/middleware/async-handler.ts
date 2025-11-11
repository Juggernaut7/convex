import type { NextFunction, Request, Response } from "express";

export const asyncHandler =
  <T extends Request, U extends Response>(fn: (req: T, res: U, next: NextFunction) => Promise<unknown>) =>
  (req: T, res: U, next: NextFunction) =>
    fn(req, res, next).catch(next);

