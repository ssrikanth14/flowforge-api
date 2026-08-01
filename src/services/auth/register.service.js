import mongoose from "mongoose";

import { authRepository } from "../../repositories/auth.repository.js";

import {
  generateAccessToken,
  generateRefreshToken,
} from "../../utils/token.js";

import { hashPassword } from "../../utils/password.js";

import AppError from "../../utils/AppError.js";

export const register = async (userData) => {
  // Check if email already exists
  const existingUser = await authRepository.findUserByEmail(
    userData.email
  );

  if (existingUser) {
    throw new AppError("Email already exists.", 409);
  }

  // Create new user
  const user = await authRepository.createUser(userData);

  // Generate session ID
  const sessionId = new mongoose.Types.ObjectId();

  // Generate refresh token
  const refreshToken = generateRefreshToken({
    userId: user._id,
    sessionId,
  });

  // Hash refresh token
  const refreshTokenHash = await hashPassword(refreshToken);

  // Store session
  await authRepository.createSession({
    _id: sessionId,
    userId: user._id,
    refreshTokenHash,
    expiresAt: new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
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