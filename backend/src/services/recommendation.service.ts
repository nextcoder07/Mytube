// src/services/recommendation.service.ts
import { supabase } from "../utils/supabase";
import AIGateway from "../ai/gateway";
import SearchService from "./search.service";
import GoalsService from "./goals.service";

export class RecommendationService {
  /**
   * Refreshes recommendations for a user.
   * Finds active goals, asks AI what specific concepts to research next,
   * searches those terms, and inserts the top items with scores into the recommendations table.
   */
  static async refreshRecommendations(userId: string) {
    try {
      // 1. Fetch user goals
      const goals = await GoalsService.getGoals(userId);
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

      const aiText = await AIGateway.generate(prompt);
      const topics = aiText.split(",").map((t) => t.trim()).filter(Boolean);

      // 3. Search and save items
      const recommendationItems: any[] = [];

      for (const topic of topics) {
        const results = await SearchService.search(userId, topic, {
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
        await supabase.from("recommendations").delete().eq("user_id", userId);

        const { data, error } = await supabase
          .from("recommendations")
          .insert(recommendationItems)
          .select();

        if (error) throw error;
        return data;
      }

      return [];
    } catch (err: any) {
      console.error(`Failed to refresh recommendations for user ${userId}:`, err.message);
      return [];
    }
  }
}

export default RecommendationService;
