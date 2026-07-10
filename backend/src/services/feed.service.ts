// src/services/feed.service.ts
import { supabase } from "../utils/supabase";
import SearchService from "./search.service";
import GoalsService from "./goals.service";
import { SearchOptions } from "../models/content.model";

export class FeedService {
  /**
   * Get personalized feed. If user has active goals, return content matching those goals.
   * Otherwise, return a mixed feed of general tech topics.
   */
  static async getFeed(userId: string, page = 1, limit = 10, providers?: string[]) {
    try {
      // 1. Fetch active goals and context
      const goals = await GoalsService.getGoals(userId);
      const activeGoals = goals.filter((g) => g.status === "active");
      const goalContext = await GoalsService.getActiveGoalContext(userId);

      let query = "software development";
      let goalId: string | undefined;
      if (activeGoals.length > 0) {
        query = activeGoals.map((goal) => goal.title).join(" | ");
        goalId = activeGoals[0].id;
      }

      const availableProviders = ["youtube", "github", "reddit", "medium", "website", "devto", "wikipedia"];
      const selectedProviders = providers && providers.length > 0 ? providers : availableProviders;

      // 2. Perform search across providers with goal-aware ranking if possible
      const searchOptions: SearchOptions = {
        limit: limit * 2,
        providers: selectedProviders,
        goalId,
        aiContext: goalContext,
      };

      const contentList = await SearchService.search(userId, query, searchOptions);

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

    const recommendations = (data || []).filter((item: any) => item.content).map((item: any) => ({
      ...item.content,
      metadata: {
        ...item.content.metadata,
        recommendationReason: item.reason,
        recommendationScore: item.score,
      },
    }));

    if (recommendations.length > 0) {
      return recommendations;
    }

    const fallbackFeed = await this.getFeed(userId, 1, 10);
    return fallbackFeed.content;
  }
}

export default FeedService;
