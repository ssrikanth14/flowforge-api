import { Router } from "express";
import workspaceRoutes from "./workspace.routes.js";
import projectRoutes from "./project.routes.js";
import taskRoutes from "./task.routes.js";

const router = Router();

router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    name: "FlowForge API",
    version: "v1",
    endpoints: {
      health: "/api/v1/health",
      auth: "/api/v1/auth",
      workspaces: "/api/v1/workspaces",
    },
  });
});

/**
 * Health Check
 */
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "FlowForge API is running 🚀",
    version: "v1",
    timestamp: new Date().toISOString(),
  });
});

router.use("/workspaces", workspaceRoutes);
router.use(projectRoutes);
router.use(taskRoutes);

export default router;