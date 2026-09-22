import { Router } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import { protect } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.js";
import * as controller from "../controllers/task.controller.js";
import { createTaskSchema, updateTaskSchema } from "../validators/task.validator.js";

const router = Router();
router.route("/projects/:projectId/tasks").post(protect, validate(createTaskSchema), asyncHandler(controller.create)).get(protect, asyncHandler(controller.list));
router.route("/tasks/:taskId").get(protect, asyncHandler(controller.get)).patch(protect, validate(updateTaskSchema), asyncHandler(controller.update)).delete(protect, asyncHandler(controller.remove));
export default router;