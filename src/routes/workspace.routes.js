import { Router } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import { protect } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.js";
import * as controller from "../controllers/workspace.controller.js";
import { addMemberSchema, createWorkspaceSchema, updateWorkspaceSchema } from "../validators/workspace.validator.js";

const router = Router();
router.use(protect);
router.route("/").post(validate(createWorkspaceSchema), asyncHandler(controller.create)).get(asyncHandler(controller.list));
router.route("/:workspaceId").get(asyncHandler(controller.get)).patch(validate(updateWorkspaceSchema), asyncHandler(controller.update)).delete(asyncHandler(controller.remove));
router.post("/:workspaceId/members", validate(addMemberSchema), asyncHandler(controller.addMember));
router.delete("/:workspaceId/members/:memberId", asyncHandler(controller.removeMember));
export default router;