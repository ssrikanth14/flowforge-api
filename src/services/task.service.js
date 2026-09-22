import Project from "../models/Project.js";
import Task from "../models/Task.js";
import AppError from "../utils/AppError.js";
import { requireWorkspaceMember } from "./workspace.service.js";
import { ROLES } from "../constants/roles.js";

const canWrite = (role) => ![ROLES.VIEWER, ROLES.GUEST].includes(role);

const ensureAssigneeIsMember = (workspace, assignee) => {
  if (assignee && !workspace.members.some((member) => member.user.toString() === assignee.toString())) {
    throw new AppError("Task assignee must be a workspace member.", 400);
  }
};

const getProjectForUser = async (projectId, userId) => {
  const project = await Project.findById(projectId);
  if (!project) throw new AppError("Project not found.", 404);
  const access = await requireWorkspaceMember(project.workspace, userId);
  return { project, member: access.member };
};

export const createTask = async (projectId, userId, data) => {
  const { project, member } = await getProjectForUser(projectId, userId);
  if (!canWrite(member.role)) throw new AppError("You cannot create tasks in this workspace.", 403);
  const { workspace } = await requireWorkspaceMember(project.workspace, userId);
  ensureAssigneeIsMember(workspace, data.assignee);
  return Task.create({ ...data, project: project._id, workspace: project.workspace, createdBy: userId });
};

export const listTasks = async (projectId, userId, filters) => {
  await getProjectForUser(projectId, userId);
  const query = { project: projectId };
  if (filters.status) query.status = filters.status;
  if (filters.priority) query.priority = filters.priority;
  if (filters.assignee) query.assignee = filters.assignee;
  return Task.find(query).populate("assignee", "firstName lastName email").sort({ createdAt: -1 });
};

export const getTask = async (taskId, userId) => {
  const task = await Task.findById(taskId).populate("assignee", "firstName lastName email");
  if (!task) throw new AppError("Task not found.", 404);
  await requireWorkspaceMember(task.workspace, userId);
  return task;
};

export const updateTask = async (taskId, userId, data) => {
  const task = await Task.findById(taskId);
  if (!task) throw new AppError("Task not found.", 404);
  const { member } = await requireWorkspaceMember(task.workspace, userId);
  if (!canWrite(member.role)) throw new AppError("You cannot update tasks in this workspace.", 403);
  const { workspace } = await requireWorkspaceMember(task.workspace, userId);
  ensureAssigneeIsMember(workspace, data.assignee);
  Object.assign(task, data);
  return task.save();
};

export const deleteTask = async (taskId, userId) => {
  const task = await Task.findById(taskId);
  if (!task) throw new AppError("Task not found.", 404);
  const { member } = await requireWorkspaceMember(task.workspace, userId);
  if (![ROLES.WORKSPACE_OWNER, ROLES.WORKSPACE_ADMIN, ROLES.PROJECT_MANAGER].includes(member.role)) {
    throw new AppError("Project manager permission is required.", 403);
  }
  await task.deleteOne();
};