import * as authService from "../services/auth/index.js";

import { successResponse } from "../utils/response.js";
import { setRefreshTokenCookie } from "../utils/cookies.js";

export const register = async (req, res) => {
  const result = await authService.register(req.body);

  setRefreshTokenCookie(res, result.refreshToken);

  return successResponse(
    res,
    201,
    "User registered successfully.",
    {
      user: {
        id: result.user._id,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        email: result.user.email,
        role: result.user.role,
      },
      accessToken: result.accessToken,
    }
  );
};
export const login = async (req, res) => {
  const result = await authService.login(req.body);

  setRefreshTokenCookie(res, result.refreshToken);

  return successResponse(
    res,
    200,
    "Login successful.",
    {
      user: {
        id: result.user._id,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        email: result.user.email,
        role: result.user.role,
      },
      accessToken: result.accessToken,
    }
  );
};



// Coming next sprint
export const refresh = async (req, res) => {};

// Coming next sprint
export const logout = async (req, res) => {};