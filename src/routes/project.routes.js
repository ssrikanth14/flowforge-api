import { Router } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import { protect } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.js";
import * as controller from "../controllers/project.controller.js";
import { createProjectSchema, updateProjectSchema } from "../validators/project.validator.js";

const router = Router();
router.post("/workspaces/:workspaceId/projects", protect, validate(createProjectSchema), asyncHandler(controller.create));
router.get("/workspaces/:workspaceId/projects", protect, asyncHandler(controller.list));
router.route("/projects/:projectId").get(protect, asyncHandler(controller.get)).patch(protect, validate(updateProjectSchema), asyncHandler(controller.update)).delete(protect, asyncHandler(controller.remove));
export default router;