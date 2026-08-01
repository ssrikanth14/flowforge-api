import env from "../config/env.js";

export const cookieOptions = {
  httpOnly: true,
  secure: env.nodeEnv === "production",
  sameSite: "strict",
};

export const setRefreshTokenCookie = (
  res,
  refreshToken
) => {
  res.cookie(
    "refreshToken",
    refreshToken,
    {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    }
  );
};

export const clearRefreshTokenCookie = (
  res
) => {
  res.clearCookie(
    "refreshToken",
    cookieOptions
  );
};