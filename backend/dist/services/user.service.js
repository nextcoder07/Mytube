"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
// src/services/user.service.ts
const supabase_1 = require("../utils/supabase");
class UserService {
    /**
     * Get complete user record including profile details.
     */
    static async getProfile(userId) {
        const { data: user, error: userError } = await supabase_1.supabase
            .from("users")
            .select("*")
            .eq("id", userId)
            .single();
        if (userError || !user) {
            throw new Error("User record not found");
        }
        const { data: profile, error: profileError } = await supabase_1.supabase
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
    static async updateProfile(userId, updates) {
        // 1. Update user fields
        if (updates.displayName !== undefined || updates.photoUrl !== undefined) {
            await supabase_1.supabase
                .from("users")
                .update({
                display_name: updates.displayName,
                photo_url: updates.photoUrl,
                updated_at: new Date(),
            })
                .eq("id", userId);
        }
        // 2. Update profile fields
        const profileUpdates = {};
        if (updates.bio !== undefined)
            profileUpdates.bio = updates.bio;
        if (updates.location !== undefined)
            profileUpdates.location = updates.location;
        if (updates.website !== undefined)
            profileUpdates.website = updates.website;
        if (updates.learningStyle !== undefined)
            profileUpdates.learning_style = updates.learningStyle;
        if (updates.dailyGoalMinutes !== undefined)
            profileUpdates.daily_goal_minutes = updates.dailyGoalMinutes;
        // Custom user API keys
        const { userKeyRotationManager } = require("../utils/userKeyManager");
        if (updates.user_youtube_api_keys !== undefined) {
            profileUpdates.user_youtube_api_keys = updates.user_youtube_api_keys;
            userKeyRotationManager.clearUserState("youtube", userId);
        }
        if (updates.user_github_api_keys !== undefined) {
            profileUpdates.user_github_api_keys = updates.user_github_api_keys;
            userKeyRotationManager.clearUserState("github", userId);
        }
        if (Object.keys(profileUpdates).length > 0) {
            const { error } = await supabase_1.supabase
                .from("profiles")
                .update(profileUpdates)
                .eq("id", userId);
            if (error)
                throw error;
        }
        return this.getProfile(userId);
    }
    /**
     * Add XP to the user's total, updating level and streaks.
     */
    static async addXp(userId, amount) {
        const { data: profile, error } = await supabase_1.supabase
            .from("profiles")
            .select("total_xp")
            .eq("id", userId)
            .single();
        if (error || !profile)
            return;
        const newXp = (profile.total_xp || 0) + amount;
        await supabase_1.supabase
            .from("profiles")
            .update({ total_xp: newXp })
            .eq("id", userId);
    }
    /**
     * Increment user daily streak.
     */
    static async incrementStreak(userId) {
        const { data: profile, error } = await supabase_1.supabase
            .from("profiles")
            .select("streak")
            .eq("id", userId)
            .single();
        if (error || !profile)
            return;
        const newStreak = (profile.streak || 0) + 1;
        await supabase_1.supabase
            .from("profiles")
            .update({ streak: newStreak })
            .eq("id", userId);
    }
    /**
     * Delete user and cascade tables
     */
    static async deleteUser(userId) {
        const { error } = await supabase_1.supabase.from("users").delete().eq("id", userId);
        if (error)
            throw error;
        return true;
    }
}
exports.UserService = UserService;
exports.default = UserService;
//# sourceMappingURL=user.service.js.map