import * as workspaceService from "../services/workspace.service.js";
import { successResponse } from "../utils/response.js";

export const create = async (req, res) => successResponse(res, 201, "Workspace created.", { workspace: await workspaceService.createWorkspace({ ...req.body, userId: req.user.id }) });
export const list = async (req, res) => successResponse(res, 200, "Workspaces retrieved.", { workspaces: await workspaceService.listWorkspaces(req.user.id) });
export const get = async (req, res) => successResponse(res, 200, "Workspace retrieved.", { workspace: await workspaceService.getWorkspace(req.params.workspaceId, req.user.id) });
export const update = async (req, res) => successResponse(res, 200, "Workspace updated.", { workspace: await workspaceService.updateWorkspace(req.params.workspaceId, req.user.id, req.body) });
export const remove = async (req, res) => { await workspaceService.deleteWorkspace(req.params.workspaceId, req.user.id); return successResponse(res, 200, "Workspace deleted."); };
export const addMember = async (req, res) => successResponse(res, 200, "Workspace member added.", { workspace: await workspaceService.addMember(req.params.workspaceId, req.user.id, req.body.email, req.body.role) });
export const removeMember = async (req, res) => { await workspaceService.removeMember(req.params.workspaceId, req.user.id, req.params.memberId); return successResponse(res, 200, "Workspace member removed."); };