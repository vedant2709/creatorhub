import { generateAIInsights } from "../services/ai.service.js";
import { getDashboardStatsService } from "../services/dashboard.service.js";

export const getAIInsightsController = async(req,res,next) => {
    try {
        // 🔥 1. Get dashboard data
        const stats = await getDashboardStatsService(req.token);

        // 🔥 2. Generate AI insights
        const insights = await generateAIInsights(stats);

        res.json({
            success: true,
            data: insights
        });
    } catch (error) {
        console.error("AI Insights Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to generate insights"
        });
    }
}