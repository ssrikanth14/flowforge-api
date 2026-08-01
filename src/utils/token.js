import jwt from "jsonwebtoken";
import { JWT_CONFIG } from "../config/jwt.js";

/**
 * Generate a JWT access token.
 *
 * @param {object} payload - Data to include in the token.
 * @returns {string} JWT access token.
 */
export const generateAccessToken = ({ userId, role }) => {
  return jwt.sign(
    { userId, role },
    JWT_CONFIG.accessTokenSecret,
    {
      expiresIn: JWT_CONFIG.accessTokenExpiry,
    }
  );
};

/**
 * Generate a JWT refresh token.
 *
 * @param {object} payload - Data to include in the token.
 * @returns {string} JWT refresh token.
 */
export const generateRefreshToken = ({
  userId,
  sessionId,
}) => {
  return jwt.sign(
    {
      userId,
      sessionId,
    },
    JWT_CONFIG.refreshTokenSecret,
    {
      expiresIn: JWT_CONFIG.refreshTokenExpiry,
    }
  );
};

/**
 * Verify a JWT access token.
 *
 * @param {string} token - JWT access token.
 * @returns {object} Decoded payload.
 */
export const verifyAccessToken = (token) => {
  return jwt.verify(token, JWT_CONFIG.accessTokenSecret);
};

/**
 * Verify a JWT refresh token.
 *
 * @param {string} token - JWT refresh token.
 * @returns {object} Decoded payload.
 */
export const verifyRefreshToken = (token) => {
  return jwt.verify(token, JWT_CONFIG.refreshTokenSecret);
};