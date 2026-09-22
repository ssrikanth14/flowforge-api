import Workspace from "../models/Workspace.js";
import Project from "../models/Project.js";
import Task from "../models/Task.js";
import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import { ROLES } from "../constants/roles.js";

const getMember = (workspace, userId) =>
  workspace.members.find((member) => member.user.toString() === userId.toString());

export const requireWorkspaceMember = async (workspaceId, userId) => {
  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) throw new AppError("Workspace not found.", 404);
  const member = getMember(workspace, userId);
  if (!member) throw new AppError("You are not a member of this workspace.", 403);
  return { workspace, member };
};

const requireManager = (member) => {
  if (![ROLES.WORKSPACE_OWNER, ROLES.WORKSPACE_ADMIN].includes(member.role)) {
    throw new AppError("Workspace administrator permission is required.", 403);
  }
};

export const createWorkspace = async ({ name, description, userId }) => {
  return Workspace.create({
    name,
    description,
    owner: userId,
    members: [{ user: userId, role: ROLES.WORKSPACE_OWNER }],
  });
};

export const listWorkspaces = (userId) =>
  Workspace.find({ "members.user": userId }).sort({ updatedAt: -1 });

export const getWorkspace = async (workspaceId, userId) => {
  const { workspace } = await requireWorkspaceMember(workspaceId, userId);
  return workspace.populate("members.user", "firstName lastName email avatar");
};

export const updateWorkspace = async (workspaceId, userId, data) => {
  const { workspace, member } = await requireWorkspaceMember(workspaceId, userId);
  requireManager(member);
  Object.assign(workspace, data);
  return workspace.save();
};

export const deleteWorkspace = async (workspaceId, userId) => {
  const { workspace, member } = await requireWorkspaceMember(workspaceId, userId);
  if (member.role !== ROLES.WORKSPACE_OWNER) throw new AppError("Only the workspace owner can delete it.", 403);
  const projects = await Project.find({ workspace: workspaceId }).select("_id");
  await Task.deleteMany({ workspace: workspaceId });
  await Project.deleteMany({ _id: { $in: projects.map((project) => project._id) } });
  await workspace.deleteOne();
};

export const addMember = async (workspaceId, userId, email, role) => {
  const { workspace, member } = await requireWorkspaceMember(workspaceId, userId);
  requireManager(member);
  const user = await User.findByEmail(email);
  if (!user) throw new AppError("User not found.", 404);
  if (getMember(workspace, user._id)) throw new AppError("User is already a workspace member.", 409);
  workspace.members.push({ user: user._id, role });
  await workspace.save();
  return workspace.populate("members.user", "firstName lastName email avatar");
};

export const removeMember = async (workspaceId, userId, memberId) => {
  const { workspace, member } = await requireWorkspaceMember(workspaceId, userId);
  requireManager(member);
  if (workspace.owner.toString() === memberId.toString()) throw new AppError("The workspace owner cannot be removed.", 400);
  workspace.members = workspace.members.filter((item) => item.user.toString() !== memberId.toString());
  await workspace.save();
};