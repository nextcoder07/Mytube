// src/services/history.service.ts
import { supabase } from "../utils/supabase";
import { Content } from "../models/content.model";
import AnalyticsService from "./analytics.service";

export class HistoryService {
  /**
   * Save watch event to database (both content table and watch_history table)
   * and log watch event in analytics to reward XP.
   */
  static async recordWatch(
    userId: string,
    content: Content,
    goalId?: string
  ) {
    // 1. Ensure the content exists in the content table
    const contentRecord = {
      id: content.id,
      title: content.title,
      url: content.url,
      source: content.source,
      type: content.type,
      thumbnail: content.thumbnail || null,
      description: content.description || null,
      author: content.author || null,
      duration: content.duration || null,
      view_count: content.viewCount || 0,
      tags: content.tags || [],
      language: content.language || "en",
      metadata: content.metadata || {},
    };

    const { error: contentError } = await supabase
      .from("content")
      .upsert(contentRecord, { onConflict: "id" }); // Use id as the conflict target for watch history

    if (contentError) {
      console.error("Failed to upsert content for history:", contentError.message);
      throw contentError;
    }

    // 2. Insert the watch history entry
    const watchEntry = {
      user_id: userId,
      content_id: content.id,
      goal_id: goalId || null,
      watched_at: new Date().toISOString(),
    };

    const { data: watchData, error: watchError } = await supabase
      .from("watch_history")
      .insert(watchEntry)
      .select("id, watched_at, goal_id")
      .single();

    if (watchError) {
      console.error("Failed to record watch history:", watchError.message);
      throw watchError;
    }

    // 3. Log event in analytics to trigger XP rewards
    // Determine event type based on content type
    const eventType = content.type === "video" ? "watch_video" : "read_article";
    await AnalyticsService.logEvent(userId, eventType, {
      contentId: content.id,
      goalId: goalId || undefined,
    }).catch((err) => {
      console.error("Failed to log analytics watch event:", err.message);
    });

    return {
      id: watchData.id,
      watchedAt: watchData.watched_at,
      goalId: watchData.goal_id,
      content,
    };
  }

  /**
   * Get watch history items for a user, joined with full content details
   */
  static async getWatchHistory(userId: string, goalId?: string) {
    let query = supabase
      .from("watch_history")
      .select(`
        id,
        watched_at,
        goal_id,
        content:content (
          id,
          title,
          url,
          source,
          type,
          thumbnail,
          description,
          author,
          duration,
          difficulty,
          summary,
          tags,
          language,
          metadata,
          view_count
        )
      `)
      .eq("user_id", userId)
      .order("watched_at", { ascending: false });

    if (goalId) {
      query = query.eq("goal_id", goalId);
    }

    const { data, error } = await query.limit(50);

    if (error) {
      console.error("Failed to fetch watch history:", error.message);
      throw error;
    }

    // Map database snake_case keys (like view_count) to camelCase expected by client
    return (data || []).map((item: any) => {
      if (!item.content) return null;
      
      const content = item.content;
      return {
        id: item.id,
        watchedAt: item.watched_at,
        goalId: item.goal_id,
        content: {
          id: content.id,
          title: content.title,
          url: content.url,
          source: content.source,
          type: content.type,
          thumbnail: content.thumbnail,
          description: content.description,
          author: content.author,
          duration: content.duration,
          difficulty: content.difficulty,
          summary: content.summary,
          tags: content.tags,
          language: content.language,
          metadata: content.metadata,
          viewCount: content.view_count,
        } as Content,
      };
    }).filter(Boolean);
  }
}

export default HistoryService;
