import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().trim().min(2).max(200),
  description: z.string().trim().max(5000).optional().default(""),
  status: z.enum(["todo", "in_progress", "blocked", "done"]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  assignee: z.string().optional().nullable(),
  dueDate: z.coerce.date().optional().nullable(),
});

export const updateTaskSchema = createTaskSchema.partial();