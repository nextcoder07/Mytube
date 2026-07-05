// src/services/feed.service.ts
import { supabase } from "../utils/supabase";
import SearchService from "./search.service";
import GoalsService from "./goals.service";

export class FeedService {
  /**
   * Get personalized feed. If user has active goals, return content matching those goals.
   * Otherwise, return a mixed feed of general tech topics.
   */
  static async getFeed(userId: string, page = 1, limit = 10) {
    try {
      // 1. Fetch active goals
      const goals = await GoalsService.getGoals(userId);
      const activeGoals = goals.filter((g) => g.status === "active");

      let query = "software development";
      if (activeGoals.length > 0) {
        // Pick one active goal randomly or based on latest
        query = activeGoals[0].title;
      }

      // 2. Perform search across providers
      const contentList = await SearchService.search(userId, query, {
        limit: limit * 2,
        providers: ["youtube", "github", "reddit", "medium"],
      });

      // Paginate results
      const start = (page - 1) * limit;
      const paginated = contentList.slice(start, start + limit);

      return {
        content: paginated,
        page,
        hasMore: contentList.length > start + limit,
      };
    } catch (err: any) {
      console.error("Feed error, returning empty list:", err.message);
      return { content: [], page, hasMore: false };
    }
  }

  /**
   * Fetch recommendations table for user.
   */
  static async getRecommended(userId: string) {
    const { data, error } = await supabase
      .from("recommendations")
      .select("*, content(*)")
      .eq("user_id", userId)
      .order("score", { ascending: false })
      .limit(10);

    if (error) throw error;

    // If database recommendations are empty, pre-generate or fall back to high quality general topics
    if (!data || data.length === 0) {
      const fallbackFeed = await this.getFeed(userId, 1, 10);
      return fallbackFeed.content.map((item, idx) => ({
        id: `rec_${idx}`,
        user_id: userId,
        content_id: item.id,
        score: 9.0 - idx * 0.5,
        reason: "Recommended based on your learning interests.",
        content: item,
        created_at: new Date(),
      }));
    }

    return data;
  }
}

export default FeedService;
