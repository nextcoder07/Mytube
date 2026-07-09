"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoalsService = void 0;
// src/services/goals.service.ts
const supabase_1 = require("../utils/supabase");
const gateway_1 = __importDefault(require("../ai/gateway"));
const prompt_1 = require("../ai/prompt");
const user_service_1 = __importDefault(require("./user.service"));
class GoalsService {
    static async getGoals(userId) {
        const { data, error } = await supabase_1.supabase
            .from("goals")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false });
        if (error)
            throw error;
        return (data || []);
    }
    static async createGoal(userId, goalData) {
        const { data, error } = await supabase_1.supabase
            .from("goals")
            .insert({
            user_id: userId,
            title: goalData.title,
            description: goalData.description || "",
            category: goalData.category || "General",
            difficulty: goalData.difficulty || "beginner",
            target_date: goalData.targetDate,
            status: "active",
            use_in_search: goalData.useInSearch !== undefined ? goalData.useInSearch : true,
        })
            .select()
            .single();
        if (error || !data)
            throw error || new Error("Failed to create goal");
        return data;
    }
    static async updateGoal(userId, goalId, updates) {
        const dbUpdates = {};
        if (updates.title !== undefined)
            dbUpdates.title = updates.title;
        if (updates.description !== undefined)
            dbUpdates.description = updates.description;
        if (updates.category !== undefined)
            dbUpdates.category = updates.category;
        if (updates.difficulty !== undefined)
            dbUpdates.difficulty = updates.difficulty;
        if (updates.targetDate !== undefined)
            dbUpdates.target_date = updates.targetDate;
        if (updates.status !== undefined)
            dbUpdates.status = updates.status;
        if (updates.useInSearch !== undefined)
            dbUpdates.use_in_search = updates.useInSearch;
        const { data, error } = await supabase_1.supabase
            .from("goals")
            .update(dbUpdates)
            .eq("id", goalId)
            .eq("user_id", userId)
            .select()
            .single();
        if (error || !data)
            throw error || new Error("Failed to update goal");
        return data;
    }
    static async deleteGoal(userId, goalId) {
        const { error } = await supabase_1.supabase
            .from("goals")
            .delete()
            .eq("id", goalId)
            .eq("user_id", userId);
        if (error)
            throw error;
        return true;
    }
    /**
     * AI-generated learning roadmap based on goal, user profile, and schedule.
     */
    static async generateRoadmap(userId, goalId, options) {
        // 1. Fetch goal
        const { data: goal, error: goalError } = await supabase_1.supabase
            .from("goals")
            .select("*")
            .eq("id", goalId)
            .eq("user_id", userId)
            .single();
        if (goalError || !goal) {
            throw new Error("Goal not found");
        }
        // 2. Fetch user profile (to read learning style / level)
        const userWithProfile = await user_service_1.default.getProfile(userId);
        const difficulty = goal.difficulty || "beginner";
        const learningStyle = userWithProfile.profile?.learning_style || "mixed";
        const timePerWeek = options?.timePerWeek || 5; // default 5 hours/week
        // 3. Compile prompt
        let goalDescription = goal.description || "";
        try {
            const json = JSON.parse(goal.description);
            goalDescription = `${json.describe || ""}. Priorities: 1. ${json.priority1 || ""}, 2. ${json.priority2 || ""}, 3. ${json.priority3 || ""}`;
        }
        catch (e) {
            // not JSON, keep as is
        }
        const prompt = (0, prompt_1.buildPrompt)("roadmap", {
            goal: `${goal.title}. ${goalDescription}`,
            level: difficulty,
            timePerWeek: timePerWeek.toString(),
            targetDate: goal.target_date || "3 months from now",
        });
        // 4. Generate with AI
        const aiText = await gateway_1.default.generate(prompt);
        let parsedRoadmap;
        try {
            parsedRoadmap = JSON.parse(aiText.replace(/```json|```/g, "").trim());
        }
        catch (err) {
            console.error("Failed to parse generated roadmap JSON. Response was:", aiText);
            throw new Error("AI did not return a valid structured roadmap. Please try again.");
        }
        // 5. Store in DB
        const { data: roadmapRecord, error: roadmapError } = await supabase_1.supabase
            .from("learning_paths")
            .insert({
            user_id: userId,
            goal_id: goalId,
            title: parsedRoadmap.title || `Roadmap for ${goal.title}`,
            description: parsedRoadmap.description || goal.description,
            phases: parsedRoadmap.phases || [],
        })
            .select()
            .single();
        if (roadmapError || !roadmapRecord) {
            throw roadmapError || new Error("Failed to store generated roadmap");
        }
        // Reward user with 50 XP for creating a roadmap!
        await user_service_1.default.addXp(userId, 50).catch((e) => console.error("Failed to award XP:", e.message));
        return roadmapRecord;
    }
    /**
     * Fetch all roadmaps for a user
     */
    static async getRoadmaps(userId) {
        const { data, error } = await supabase_1.supabase
            .from("learning_paths")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false });
        if (error)
            throw error;
        return data;
    }
    /**
     * Fetch a single roadmap
     */
    static async getRoadmap(userId, roadmapId) {
        const { data, error } = await supabase_1.supabase
            .from("learning_paths")
            .select("*, goals(*)")
            .eq("id", roadmapId)
            .eq("user_id", userId)
            .single();
        if (error)
            throw error;
        return data;
    }
    /**
     * Build a context string from all the user's goals that have useInSearch enabled.
     * This string is injected into the search ranker to boost goal-relevant results.
     */
    static async getActiveGoalContext(userId) {
        const { data, error } = await supabase_1.supabase
            .from("goals")
            .select("title, description, category")
            .eq("user_id", userId)
            .eq("use_in_search", true)
            .eq("status", "active");
        if (error || !data || data.length === 0)
            return "";
        // Build a compact context string from all matching goals
        return data
            .map((g) => {
            let text = `Goal: ${g.title}`;
            if (g.description) {
                try {
                    const json = JSON.parse(g.description);
                    const parts = [];
                    if (json.describe)
                        parts.push(json.describe);
                    if (json.priority1)
                        parts.push(`Priority 1: ${json.priority1}`);
                    if (json.priority2)
                        parts.push(`Priority 2: ${json.priority2}`);
                    if (json.priority3)
                        parts.push(`Priority 3: ${json.priority3}`);
                    text += `. ${parts.join(". ")}`;
                }
                catch {
                    text += `. ${g.description}`;
                }
            }
            if (g.category)
                text += `. Category: ${g.category}`;
            return text;
        })
            .join(" | ");
    }
}
exports.GoalsService = GoalsService;
exports.default = GoalsService;
//# sourceMappingURL=goals.service.js.map