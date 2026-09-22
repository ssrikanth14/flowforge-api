import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().max(1000).optional().default(""),
  status: z.enum(["planned", "active", "completed", "archived"]).optional(),
});

export const updateProjectSchema = createProjectSchema.partial();