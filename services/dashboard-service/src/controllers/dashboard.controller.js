import { getDashboardStatsService } from "../services/dashboard.service.js"

export const getDashboardStatsController = async(req,res) => {
    const data = await getDashboardStatsService(req.token, req.user);


    res.json({
    success: true,
    data
  });
}