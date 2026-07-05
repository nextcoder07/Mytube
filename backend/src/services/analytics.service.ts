// src/services/analytics.service.ts
import { supabase } from "../utils/supabase";
import UserService from "./user.service";

export class AnalyticsService {
  /**
   * Log an event to analytics database and optionally reward XP
   */
  static async logEvent(
    userId: string | null,
    eventType: string,
    eventData: Record<string, any>
  ) {
    const { data, error } = await supabase.from("analytics").insert({
      user_id: userId,
      event_type: eventType,
      event_data: eventData,
    });

    if (error) {
      console.error("Failed to log analytics event:", error.message);
      return false;
    }

    // Award XP for learning actions
    if (userId) {
      let xpAward = 0;
      if (eventType === "watch_video") xpAward = 15;
      else if (eventType === "read_article") xpAward = 10;
      else if (eventType === "create_note") xpAward = 20;
      else if (eventType === "complete_goal") xpAward = 100;
      else if (eventType === "generate_roadmap") xpAward = 50;

      if (xpAward > 0) {
        await UserService.addXp(userId, xpAward).catch((e) =>
          console.error("Failed to reward event XP:", e.message)
        );
      }
    }

    return true;
  }

  /**
   * Fetch general statistics or activity feed for dashboard progress
   */
  static async getUserStats(userId: string) {
    // 1. Fetch user profile for total XP & streak
    const profileData = await UserService.getProfile(userId);

    // 2. Fetch aggregate count of events in last 30 days
    const { count, error } = await supabase
      .from("analytics")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    const totalEvents = count || 0;

    return {
      xp: profileData.profile?.total_xp || 0,
      streak: profileData.profile?.streak || 0,
      dailyGoalMinutes: profileData.profile?.daily_goal_minutes || 30,
      learningStyle: profileData.profile?.learning_style || "mixed",
      totalActivities: totalEvents,
    };
  }
}

export default AnalyticsService;
