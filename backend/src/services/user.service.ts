// src/services/user.service.ts
import { supabase } from "../utils/supabase";

export class UserService {
  /**
   * Get complete user record including profile details.
   */
  static async getProfile(userId: string) {
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (userError || !user) {
      throw new Error("User record not found");
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    return {
      ...user,
      profile: profile || null,
    };
  }

  /**
   * Update profile parameters (e.g. learning style, bio)
   */
  static async updateProfile(userId: string, updates: {
    displayName?: string;
    photoUrl?: string;
    bio?: string;
    location?: string;
    website?: string;
    learningStyle?: "visual" | "reading" | "mixed";
    dailyGoalMinutes?: number;
  }) {
    // 1. Update user fields
    if (updates.displayName !== undefined || updates.photoUrl !== undefined) {
      await supabase
        .from("users")
        .update({
          display_name: updates.displayName,
          photo_url: updates.photoUrl,
          updated_at: new Date(),
        })
        .eq("id", userId);
    }

    // 2. Update profile fields
    const profileUpdates: any = {};
    if (updates.bio !== undefined) profileUpdates.bio = updates.bio;
    if (updates.location !== undefined) profileUpdates.location = updates.location;
    if (updates.website !== undefined) profileUpdates.website = updates.website;
    if (updates.learningStyle !== undefined) profileUpdates.learning_style = updates.learningStyle;
    if (updates.dailyGoalMinutes !== undefined) profileUpdates.daily_goal_minutes = updates.dailyGoalMinutes;

    if (Object.keys(profileUpdates).length > 0) {
      const { error } = await supabase
        .from("profiles")
        .update(profileUpdates)
        .eq("id", userId);
      if (error) throw error;
    }

    return this.getProfile(userId);
  }

  /**
   * Add XP to the user's total, updating level and streaks.
   */
  static async addXp(userId: string, amount: number) {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("total_xp")
      .eq("id", userId)
      .single();

    if (error || !profile) return;

    const newXp = (profile.total_xp || 0) + amount;
    await supabase
      .from("profiles")
      .update({ total_xp: newXp })
      .eq("id", userId);
  }

  /**
   * Increment user daily streak.
   */
  static async incrementStreak(userId: string) {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("streak")
      .eq("id", userId)
      .single();

    if (error || !profile) return;

    const newStreak = (profile.streak || 0) + 1;
    await supabase
      .from("profiles")
      .update({ streak: newStreak })
      .eq("id", userId);
  }

  /**
   * Delete user and cascade tables
   */
  static async deleteUser(userId: string) {
    const { error } = await supabase.from("users").delete().eq("id", userId);
    if (error) throw error;
    return true;
  }
}

export default UserService;
