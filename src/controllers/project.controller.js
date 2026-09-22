import * as projectService from "../services/project.service.js";
import { successResponse } from "../utils/response.js";

export const create = async (req, res) => successResponse(res, 201, "Project created.", { project: await projectService.createProject(req.params.workspaceId, req.user.id, req.body) });
export const list = async (req, res) => successResponse(res, 200, "Projects retrieved.", { projects: await projectService.listProjects(req.params.workspaceId, req.user.id) });
export const get = async (req, res) => successResponse(res, 200, "Project retrieved.", { project: await projectService.getProject(req.params.projectId, req.user.id) });
export const update = async (req, res) => successResponse(res, 200, "Project updated.", { project: await projectService.updateProject(req.params.projectId, req.user.id, req.body) });
export const remove = async (req, res) => { await projectService.deleteProject(req.params.projectId, req.user.id); return successResponse(res, 200, "Project deleted."); };