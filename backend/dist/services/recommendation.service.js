"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecommendationService = void 0;
// src/services/recommendation.service.ts
const supabase_1 = require("../utils/supabase");
const gateway_1 = __importDefault(require("../ai/gateway"));
const search_service_1 = __importDefault(require("./search.service"));
const goals_service_1 = __importDefault(require("./goals.service"));
class RecommendationService {
    /**
     * Refreshes recommendations for a user.
     * Finds active goals, asks AI what specific concepts to research next,
     * searches those terms, and inserts the top items with scores into the recommendations table.
     */
    static async refreshRecommendations(userId) {
        try {
            // 1. Fetch user goals
            const goals = await goals_service_1.default.getGoals(userId);
            const activeGoals = goals.filter((g) => g.status === "active");
            if (activeGoals.length === 0) {
                console.log(`No active goals for user ${userId}. Skipping recommendation refresh.`);
                return [];
            }
            // 2. Query AI Gateway for topics to search
            const goalTitles = activeGoals.map((g) => g.title).join(", ");
            const prompt = `
The user is studying: "${goalTitles}".
What are the top 3 sub-concepts or topics they should learn next?
Respond with a simple comma-separated list of search queries. Do not add numbers or formatting.
Example response: docker networking, multi-stage docker builds, container security
`;
            const aiText = await gateway_1.default.generate(prompt);
            const topics = aiText.split(",").map((t) => t.trim()).filter(Boolean);
            // 3. Search and save items
            const recommendationItems = [];
            for (const topic of topics) {
                const results = await search_service_1.default.search(userId, topic, {
                    limit: 3,
                    providers: ["youtube", "github"],
                });
                results.forEach((item, index) => {
                    recommendationItems.push({
                        user_id: userId,
                        content_id: item.id,
                        score: parseFloat((9.5 - index * 0.5).toFixed(2)),
                        reason: `Recommended to help with your goal to learn: ${topic}`,
                    });
                });
            }
            // 4. Save to recommendations table (upsert on conflict user_id + content_id)
            if (recommendationItems.length > 0) {
                // Clear old recommendations first to keep it fresh
                await supabase_1.supabase.from("recommendations").delete().eq("user_id", userId);
                const { data, error } = await supabase_1.supabase
                    .from("recommendations")
                    .insert(recommendationItems)
                    .select();
                if (error)
                    throw error;
                return data;
            }
            return [];
        }
        catch (err) {
            console.error(`Failed to refresh recommendations for user ${userId}:`, err.message);
            return [];
        }
    }
}
exports.RecommendationService = RecommendationService;
exports.default = RecommendationService;
//# sourceMappingURL=recommendation.service.js.map