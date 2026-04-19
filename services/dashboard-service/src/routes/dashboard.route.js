import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { getDashboardStatsController } from "../controllers/dashboard.controller.js";
import { getAIInsightsController } from "../controllers/ai.controller.js";

const router = Router();

router.get("/", authMiddleware, getDashboardStatsController);
router.get("/ai-insights", authMiddleware, getAIInsightsController);

export default router;