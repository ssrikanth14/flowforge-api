import { Router } from "express";

import * as authController from "../controllers/auth.controller.js";

import asyncHandler from "../utils/asyncHandler.js";

import { validate } from "../middleware/validate.js";

import {
  registerSchema,
  loginSchema,
} from "../validators/auth.validator.js";

const router = Router();

router.post(
  "/register",
  validate(registerSchema),
  asyncHandler(authController.register)
);

router.post(
  "/login",
  validate(loginSchema),
  asyncHandler(authController.login)
);

router.post(
  "/refresh",
  asyncHandler(authController.refresh)
);

router.post(
  "/logout",
  asyncHandler(authController.logout)
);

export default router;