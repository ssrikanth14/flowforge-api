import Project from "../models/Project.js";
import Task from "../models/Task.js";
import AppError from "../utils/AppError.js";
import { requireWorkspaceMember } from "./workspace.service.js";
import { ROLES } from "../constants/roles.js";

const canWrite = (role) => [ROLES.WORKSPACE_OWNER, ROLES.WORKSPACE_ADMIN, ROLES.PROJECT_MANAGER].includes(role);

export const createProject = async (workspaceId, userId, data) => {
  const { member } = await requireWorkspaceMember(workspaceId, userId);
  if (!canWrite(member.role)) throw new AppError("Project manager permission is required.", 403);
  return Project.create({ ...data, workspace: workspaceId, createdBy: userId });
};

export const listProjects = async (workspaceId, userId) => {
  await requireWorkspaceMember(workspaceId, userId);
  return Project.find({ workspace: workspaceId }).sort({ updatedAt: -1 });
};

export const getProject = async (projectId, userId) => {
  const project = await Project.findById(projectId);
  if (!project) throw new AppError("Project not found.", 404);
  await requireWorkspaceMember(project.workspace, userId);
  return project;
};

export const updateProject = async (projectId, userId, data) => {
  const project = await getProject(projectId, userId);
  const { member } = await requireWorkspaceMember(project.workspace, userId);
  if (!canWrite(member.role)) throw new AppError("Project manager permission is required.", 403);
  Object.assign(project, data);
  return project.save();
};

export const deleteProject = async (projectId, userId) => {
  const project = await getProject(projectId, userId);
  const { member } = await requireWorkspaceMember(project.workspace, userId);
  if (!canWrite(member.role)) throw new AppError("Project manager permission is required.", 403);
  await Task.deleteMany({ project: project._id });
  await project.deleteOne();
};