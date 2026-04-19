import { callAI } from "../utils/ai.js";

export const generateAIInsights = async (stats) => {
  try {
    // 🔥 STEP 1: Enhance stats (VERY IMPORTANT)
    const enhancedStats = {
      ...stats,

      stage:
        stats.totalSales <= 2
          ? "early_stage"
          : stats.totalSales < 20
          ? "growing"
          : "scaling",

      topProductRevenueShare:
        stats.topProducts?.length > 0
          ? stats.topProducts[0].revenue / (stats.totalRevenue || 1)
          : 0,

      activeDays: Object.keys(stats.revenueByDate || {}).length
    };

    // 🔥 STEP 2: Strong Prompt
    const prompt = `
You are a senior SaaS growth analyst.

Analyze the creator's business performance using the data below.

IMPORTANT RULES:
- Be concise and to the point
- Avoid obvious statements
- Focus on growth and revenue improvement
- Provide actionable insights only
- Max 2 lines per insight
- Prioritize highest impact insights first
- Do NOT repeat raw data

Return STRICT JSON (no markdown, no backticks):

{
  "summary": "1-2 line sharp business summary",
  "bestProduct": "product name",
  "insights": [
    "insight 1",
    "insight 2",
    "insight 3"
  ],
  "suggestions": [
    {
      "priority": "high | medium | low",
      "action": "specific actionable step"
    }
  ]
}

DATA:
${JSON.stringify(enhancedStats)}
`;

    // 🔥 STEP 3: Call AI
    const aiResponse = await callAI(prompt);

    // 🔥 STEP 4: Clean AI response (remove markdown)
    let cleaned = aiResponse
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    // 🔥 STEP 5: Extract JSON safely (fallback)
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");

    if (start !== -1 && end !== -1) {
      cleaned = cleaned.slice(start, end + 1);
    }

    // 🔥 STEP 6: Parse JSON
    const parsed = JSON.parse(cleaned);

    // 🔥 STEP 7: Normalize structure (safety)
    return {
      summary: parsed.summary || "",
      bestProduct: parsed.bestProduct || "",
      insights: parsed.insights || [],
      suggestions: parsed.suggestions || []
    };

  } catch (error) {
    console.error("AI Insights Error:", error);

    // 🔥 Fallback response (VERY IMPORTANT for production)
    return {
      summary: "Not enough data to generate insights yet.",
      bestProduct: "N/A",
      insights: [
        "Start generating more sales data to unlock insights"
      ],
      suggestions: [
        {
          priority: "high",
          action: "Promote your existing product to get initial traction"
        }
      ]
    };
  }
};