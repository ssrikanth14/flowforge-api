import { Router } from "express";

const router = Router();

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

export default router;