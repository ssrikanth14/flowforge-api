import * as taskService from "../services/task.service.js";
import { successResponse } from "../utils/response.js";

export const create = async (req, res) => successResponse(res, 201, "Task created.", { task: await taskService.createTask(req.params.projectId, req.user.id, req.body) });
export const list = async (req, res) => successResponse(res, 200, "Tasks retrieved.", { tasks: await taskService.listTasks(req.params.projectId, req.user.id, req.query) });
export const get = async (req, res) => successResponse(res, 200, "Task retrieved.", { task: await taskService.getTask(req.params.taskId, req.user.id) });
export const update = async (req, res) => successResponse(res, 200, "Task updated.", { task: await taskService.updateTask(req.params.taskId, req.user.id, req.body) });
export const remove = async (req, res) => { await taskService.deleteTask(req.params.taskId, req.user.id); return successResponse(res, 200, "Task deleted."); };