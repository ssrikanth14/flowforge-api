import {
  verifyRefreshToken,
  generateAccessToken,
  generateRefreshToken,
} from "../../utils/token.js";

import {
  comparePassword,
  hashPassword,
} from "../../utils/password.js";

import { authRepository } from "../../repositories/auth.repository.js";

import { JWT_CONFIG } from "../../config/jwt.js";

import AppError from "../../utils/AppError.js";

export const refreshAccessToken = async (
  refreshToken
) => {
  if (!refreshToken) {
    throw new AppError("Refresh token missing.", 401);
  }

  // Verify JWT
  const payload = verifyRefreshToken(refreshToken);

  // Find session
  const session =
    await authRepository.findSessionById(
      payload.sessionId
    );

  if (!session || session.isRevoked || session.expiresAt <= new Date()) {
    throw new AppError("Session expired.", 401);
  }

  // Verify refresh token hash
  const valid = await comparePassword(
    refreshToken,
    session.refreshTokenHash
  );

  if (!valid) {
    await authRepository.revokeSession(session._id);

    throw new AppError(
      "Refresh token reuse detected.",
      401
    );
  }

  // Generate new refresh token
  const newRefreshToken =
    generateRefreshToken({
      userId: payload.userId,
      sessionId: session._id,
    });

  const newHash =
    await hashPassword(newRefreshToken);

  // Rotate refresh token
  await authRepository.updateSession(
    session._id,
    {
      refreshTokenHash: newHash,
      lastUsedAt: new Date(),
    }
  );

  // Load user
  const user =
    await authRepository.findUserById(
      payload.userId
    );

  if (!user) {
    await authRepository.revokeSession(session._id);
    throw new AppError("User not found.", 401);
  }

  const accessToken =
    generateAccessToken({
      userId: user._id,
      role: user.role,
    });

  return {
    accessToken,
    refreshToken: newRefreshToken,
  };
};