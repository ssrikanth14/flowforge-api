import mongoose from "mongoose";
import { ROLES } from "../constants/roles.js";

const memberSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: {
      type: String,
      enum: [ROLES.WORKSPACE_OWNER, ROLES.WORKSPACE_ADMIN, ROLES.PROJECT_MANAGER, ROLES.DEVELOPER, ROLES.VIEWER, ROLES.GUEST],
      required: true,
    },
    joinedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const workspaceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    description: { type: String, trim: true, maxlength: 500, default: "" },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    members: { type: [memberSchema], default: [] },
  },
  { timestamps: true }
);

workspaceSchema.index({ "members.user": 1 });

export default mongoose.model("Workspace", workspaceSchema);