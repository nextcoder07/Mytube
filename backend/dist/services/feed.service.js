"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedService = void 0;
// src/services/feed.service.ts
const supabase_1 = require("../utils/supabase");
const search_service_1 = __importDefault(require("./search.service"));
const goals_service_1 = __importDefault(require("./goals.service"));
const user_service_1 = __importDefault(require("./user.service"));
class FeedService {
    /**
     * Get personalized feed. If user has active goals, return content matching those goals.
     * Otherwise, return a mixed feed of general tech topics.
     */
    static async getFeed(userId, page = 1, limit = 10, providers, excludeIds, goalId, useCache = true) {
        try {
            // 1. Fetch active goals and context
            const goals = await goals_service_1.default.getGoals(userId);
            const activeGoals = goals.filter((g) => g.status === "active");
            if (activeGoals.length === 0) {
                return { content: [], page, hasMore: false };
            }
            const focusGoals = goalId
                ? activeGoals.filter((goal) => goal.id === goalId)
                : activeGoals;
            const effectiveGoals = focusGoals.length > 0 ? focusGoals : activeGoals;
            const goalContext = await goals_service_1.default.getActiveGoalContext(userId);
            const userProfile = await user_service_1.default.getProfile(userId).catch(() => null);
            const profileContextParts = [];
            if (userProfile?.profile?.learning_style)
                profileContextParts.push(`Learning style: ${userProfile.profile.learning_style}`);
            if (userProfile?.profile?.bio)
                profileContextParts.push(`Bio: ${userProfile.profile.bio}`);
            if (userProfile?.profile?.daily_goal_minutes)
                profileContextParts.push(`Daily learning goal: ${userProfile.profile.daily_goal_minutes} minutes`);
            const availableProviders = ["youtube", "github", "reddit", "medium", "website", "devto", "wikipedia"];
            const selectedProviders = providers && providers.length > 0 ? providers : availableProviders;
            const goalQueryParts = effectiveGoals.flatMap((goal) => {
                const parts = [goal.title, goal.category, goal.description];
                if (goal.priority1)
                    parts.push(`Priority 1: ${goal.priority1}`);
                if (goal.priority2)
                    parts.push(`Priority 2: ${goal.priority2}`);
                if (goal.priority3)
                    parts.push(`Priority 3: ${goal.priority3}`);
                return parts.filter(Boolean);
            });
            const query = goalQueryParts.join(' | ');
            const focusedGoalId = effectiveGoals[0]?.id;
            const searchOptions = {
                page,
                limit,
                providers: selectedProviders,
                goalId: focusedGoalId,
                aiContext: [goalContext, profileContextParts.join('. ')].filter(Boolean).join('. '),
                excludeIds,
                useCache,
            };
            const contentList = await search_service_1.default.search(userId, query, searchOptions);
            return {
                content: contentList,
                page,
                hasMore: contentList.length === limit,
            };
        }
        catch (err) {
            console.error("Feed error, returning empty list:", err.message);
            return { content: [], page, hasMore: false };
        }
    }
    /**
     * Fetch recommendations table for user.
     */
    static async getRecommended(userId, excludeIds) {
        const { data, error } = await supabase_1.supabase
            .from("recommendations")
            .select("*, content(*)")
            .eq("user_id", userId)
            .order("score", { ascending: false })
            .limit(10);
        if (error)
            throw error;
        let recommendations = (data || []).filter((item) => item.content).map((item) => ({
            ...item.content,
            metadata: {
                ...item.content.metadata,
                recommendationReason: item.reason,
                recommendationScore: item.score,
            },
        }));
        if (excludeIds && excludeIds.length > 0) {
            const excludeSet = new Set(excludeIds);
            recommendations = recommendations.filter((item) => !excludeSet.has(item.id));
        }
        if (recommendations.length > 0) {
            return recommendations;
        }
        const fallbackFeed = await this.getFeed(userId, 1, 10, undefined, excludeIds);
        return fallbackFeed.content;
    }
}
exports.FeedService = FeedService;
exports.default = FeedService;
//# sourceMappingURL=feed.service.js.map