import { verifyAccessToken } from "../utils/token.js";
import { authRepository } from "../repositories/auth.repository.js";
import AppError from "../utils/AppError.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";

export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (
    !authHeader ||
    !authHeader.startsWith("Bearer ")
  ) {
    return next(
      new AppError(
        "Access token is required.",
        HTTP_STATUS.UNAUTHORIZED
      )
    );
  }

  const token = authHeader.split(" ")[1];

  const payload = verifyAccessToken(token);

  const user = await authRepository.findUserById(
    payload.userId
  );

  if (!user) {
    return next(
      new AppError(
        "User not found.",
        HTTP_STATUS.UNAUTHORIZED
      )
    );
  }

  req.user = {
    id: user._id,
    role: user.role,
  };

  next();
};