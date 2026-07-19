// src/services/feed.service.ts
import { supabase } from "../utils/supabase";
import SearchService from "./search.service";
import GoalsService from "./goals.service";
import UserService from "./user.service";
import { SearchOptions } from "../models/content.model";

export class FeedService {
  /**
   * Get personalized feed. If user has active goals, return content matching those goals.
   * Otherwise, return a mixed feed of general tech topics.
   */
  static async getFeed(
    userId: string,
    page = 1,
    limit = 10,
    providers?: string[],
    excludeIds?: string[],
    goalId?: string,
    useCache = true
  ) {
    try {
      // 1. Fetch active goals and context
      const goals = await GoalsService.getGoals(userId);
      const activeGoals = goals.filter((g) => g.status === "active");
      if (activeGoals.length === 0) {
        return { content: [], page, hasMore: false };
      }

      const focusGoals = goalId
        ? activeGoals.filter((goal) => goal.id === goalId)
        : activeGoals;
      const effectiveGoals = focusGoals.length > 0 ? focusGoals : activeGoals;

      const goalContext = await GoalsService.getActiveGoalContext(userId);
      const userProfile = await UserService.getProfile(userId).catch(() => null);
      const profileContextParts: string[] = [];
      if (userProfile?.profile?.learning_style) profileContextParts.push(`Learning style: ${userProfile.profile.learning_style}`);
      if (userProfile?.profile?.bio) profileContextParts.push(`Bio: ${userProfile.profile.bio}`);
      if (userProfile?.profile?.daily_goal_minutes) profileContextParts.push(`Daily learning goal: ${userProfile.profile.daily_goal_minutes} minutes`);

      const availableProviders = ["youtube", "github", "reddit", "medium", "website", "devto", "wikipedia"];
      const selectedProviders = providers && providers.length > 0 ? providers : availableProviders;

      const goalQueryParts = effectiveGoals.flatMap((goal) => {
        const parts = [goal.title, goal.category, goal.description];
        if (goal.priority1) parts.push(goal.priority1);
        if (goal.priority2) parts.push(goal.priority2);
        if (goal.priority3) parts.push(goal.priority3);
        return parts.filter(Boolean);
      });

      // Use a broader OR-based join to increase recall across providers and scrapers
      const query = goalQueryParts.join(' OR ');
      const focusedGoalId = effectiveGoals[0]?.id;

      // Fetch watched items to exclude from the feed (only if watched > 1 hour ago)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { data: watchedRecords } = await supabase
        .from("watch_history")
        .select("content_id")
        .eq("user_id", userId)
        .lt("watched_at", oneHourAgo);

      const dbExcludeIds = (watchedRecords || []).map((r: any) => r.content_id);
      const combinedExcludeIds = Array.from(new Set([
        ...(excludeIds || []),
        ...dbExcludeIds
      ]));

      const searchOptions: SearchOptions = {
        page,
        limit,
        providers: selectedProviders,
        goalId: focusedGoalId,
        aiContext: [goalContext, profileContextParts.join('. ')].filter(Boolean).join('. '),
        excludeIds: combinedExcludeIds,
        useCache,
      };

      const contentList = await SearchService.search(userId, query, searchOptions);

      return {
        content: contentList,
        page,
        hasMore: contentList.length === limit,
      };
    } catch (err: any) {
      console.error("Feed error, returning empty list:", err.message);
      return { content: [], page, hasMore: false };
    }
  }

  /**
   * Fetch recommendations table for user.
   */
  static async getRecommended(userId: string, excludeIds?: string[]) {
    const { data, error } = await supabase
      .from("recommendations")
      .select("*, content(*)")
      .eq("user_id", userId)
      .order("score", { ascending: false })
      .limit(10);

    if (error) throw error;

    let recommendations = (data || []).filter((item: any) => item.content).map((item: any) => ({
      ...item.content,
      metadata: {
        ...item.content.metadata,
        recommendationReason: item.reason,
        recommendationScore: item.score,
      },
    }));

    // Fetch watched items to exclude (only if watched > 1 hour ago)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: watchedRecords } = await supabase
      .from("watch_history")
      .select("content_id")
      .eq("user_id", userId)
      .lt("watched_at", oneHourAgo);

    const dbExcludeIds = (watchedRecords || []).map((r: any) => r.content_id);
    const combinedExcludeIds = Array.from(new Set([
      ...(excludeIds || []),
      ...dbExcludeIds
    ]));

    if (combinedExcludeIds.length > 0) {
      const excludeSet = new Set(combinedExcludeIds);
      recommendations = recommendations.filter((item) => !excludeSet.has(item.id));
    }

    if (recommendations.length > 0) {
      return recommendations;
    }

    const fallbackFeed = await this.getFeed(userId, 1, 10, undefined, combinedExcludeIds);
    return fallbackFeed.content;
  }
}

export default FeedService;
