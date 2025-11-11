import { StatusCodes } from "http-status-codes";
import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";
import { RegisterInput, LoginInput } from "./auth.validator.js";
import { User } from "../users/user.model.js";
import { AppError } from "../../errors/app-error.js";
import { env } from "../../config/env.js";

export async function registerUser(input: RegisterInput) {
  const existing = await User.findOne({ email: input.email });
  if (existing) {
    throw new AppError("Email already in use", StatusCodes.CONFLICT);
  }

  const passwordHash = await bcrypt.hash(input.password, 10);
  const user = await User.create({ email: input.email, password: passwordHash });

  return {
    id: user._id.toString(),
    email: user.email,
    roles: user.roles
  };
}

export async function authenticateUser(input: LoginInput) {
  const user = await User.findOne({ email: input.email });
  if (!user) {
    throw new AppError("Invalid credentials", StatusCodes.UNAUTHORIZED);
  }

  const valid = await bcrypt.compare(input.password, user.password);
  if (!valid) {
    throw new AppError("Invalid credentials", StatusCodes.UNAUTHORIZED);
  }

  const signOptions: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"]
  };

  const token = jwt.sign({ sub: user._id.toString(), roles: user.roles }, env.JWT_SECRET, signOptions);

  return {
    token,
    user: {
      id: user._id.toString(),
      email: user.email,
      roles: user.roles
    }
  };
}

