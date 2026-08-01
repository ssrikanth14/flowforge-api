import mongoose from "mongoose";

import { authRepository } from "../../repositories/auth.repository.js";

import {
  generateAccessToken,
  generateRefreshToken,
} from "../../utils/token.js";

import {
  comparePassword,
  hashPassword,
} from "../../utils/password.js";

import { JWT_CONFIG } from "../../config/jwt.js";

import AppError from "../../utils/AppError.js";

export const login = async ({ email, password }) => {
  // Find user
  const user = await authRepository.findUserByEmail(email);

  if (!user) {
    throw new AppError("Invalid email or password.", 401);
  }

  // Verify password
  const isPasswordValid = await comparePassword(
    password,
    user.password
  );

  if (!isPasswordValid) {
    throw new AppError("Invalid email or password.", 401);
  }

  // Generate session id
  const sessionId = new mongoose.Types.ObjectId();

  // Generate refresh token
  const refreshToken = generateRefreshToken({
    userId: user._id,
    sessionId,
  });

  // Hash refresh token
  const refreshTokenHash = await hashPassword(refreshToken);

  // Save session
  await authRepository.createSession({
    _id: sessionId,
    userId: user._id,
    refreshTokenHash,
    expiresAt: new Date(
      Date.now() + JWT_CONFIG.refreshTokenExpiryMs
    ),
  });

  // Generate access token
  const accessToken = generateAccessToken({
    userId: user._id,
    role: user.role,
  });

  return {
    user,
    accessToken,
    refreshToken,
  };
};