import env from "./env.js";

export const JWT_CONFIG = Object.freeze({
  accessTokenSecret: env.jwtSecret,
  refreshTokenSecret: env.jwtRefreshSecret,

  accessTokenExpiry: env.accessTokenExpiry,
  refreshTokenExpiry: env.refreshTokenExpiry,
  refreshTokenExpiryMs: env.refreshTokenExpiryMs,
});