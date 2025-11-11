import type { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { AppError } from "../errors/app-error.js";
import { UserDocument, User } from "../modules/users/user.model.js";

export interface AuthenticatedRequest extends Request {
  user?: Pick<UserDocument, "_id" | "email" | "roles">;
}

export function authenticate() {
  return async (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      return next(new AppError("Authentication required", StatusCodes.UNAUTHORIZED));
    }

    try {
      const token = header.split(" ")[1];
      const payload = jwt.verify(token, env.JWT_SECRET) as { sub: string };
      const user = await User.findById(payload.sub).select("_id email roles").lean();
      if (!user) {
        return next(new AppError("User not found", StatusCodes.UNAUTHORIZED));
      }
      req.user = user;
      return next();
    } catch (error) {
      return next(new AppError("Invalid or expired token", StatusCodes.UNAUTHORIZED));
    }
  };
}

export function authorize(...allowedRoles: string[]) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError("Authentication required", StatusCodes.UNAUTHORIZED));
    }
    const hasRole = req.user.roles.some((role) => allowedRoles.includes(role));
    if (!hasRole) {
      return next(new AppError("Forbidden", StatusCodes.FORBIDDEN));
    }
    return next();
  };
}

