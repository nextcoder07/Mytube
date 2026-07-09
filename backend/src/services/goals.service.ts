// src/services/goals.service.ts
import { supabase } from "../utils/supabase";
import { Goal } from "../models/goal.model";
import AIGateway from "../ai/gateway";
import { buildPrompt } from "../ai/prompt";
import UserService from "./user.service";

export class GoalsService {
  static async getGoals(userId: string): Promise<Goal[]> {
    const { data, error } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    // Normalize DB snake_case -> camelCase for the API contract
    return (data || []).map((r: any) => GoalsService.normalizeGoalRecord(r));
  }

  static async createGoal(
    userId: string,
    goalData: {
      title: string;
      description?: string;
      category?: string;
      difficulty?: "beginner" | "intermediate" | "advanced";
      targetDate?: string;
      priority1?: string;
      priority2?: string;
      priority3?: string;
      useInSearch?: boolean;
    }
  ): Promise<Goal> {
    const { data, error } = await supabase
      .from("goals")
      .insert({
        user_id: userId,
        title: goalData.title,
        description: goalData.description || "",
        category: goalData.category || "General",
        difficulty: goalData.difficulty || "beginner",
        target_date: goalData.targetDate,
        priority1: goalData.priority1,
        priority2: goalData.priority2,
        priority3: goalData.priority3,
        status: "active",
        use_in_search: goalData.useInSearch !== undefined ? goalData.useInSearch : true,
      })
      .select()
      .single();

    if (error || !data) throw error || new Error("Failed to create goal");
    return GoalsService.normalizeGoalRecord(data as any);
  }

  static async updateGoal(
    userId: string,
    goalId: string,
    updates: Partial<Omit<Goal, "id" | "userId">>
  ): Promise<Goal> {
    const dbUpdates: any = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.difficulty !== undefined) dbUpdates.difficulty = updates.difficulty;
    if (updates.targetDate !== undefined) dbUpdates.target_date = updates.targetDate;
    if ((updates as any).priority1 !== undefined) dbUpdates.priority1 = (updates as any).priority1;
    if ((updates as any).priority2 !== undefined) dbUpdates.priority2 = (updates as any).priority2;
    if ((updates as any).priority3 !== undefined) dbUpdates.priority3 = (updates as any).priority3;
    if ((updates as any).useInSearch !== undefined) dbUpdates.use_in_search = (updates as any).useInSearch;

    const { data, error } = await supabase
      .from("goals")
      .update(dbUpdates)
      .eq("id", goalId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error || !data) throw error || new Error("Failed to update goal");
    return GoalsService.normalizeGoalRecord(data as any);
  }

  static async deleteGoal(userId: string, goalId: string): Promise<boolean> {
    const { error } = await supabase
      .from("goals")
      .delete()
      .eq("id", goalId)
      .eq("user_id", userId);

    if (error) throw error;
    return true;
  }

  /**
   * AI-generated learning roadmap based on goal, user profile, and schedule.
   */
  static async generateRoadmap(
    userId: string,
    goalId: string,
    options?: { timePerWeek?: number }
  ) {
    // 1. Fetch goal
    const { data: goal, error: goalError } = await supabase
      .from("goals")
      .select("*")
      .eq("id", goalId)
      .eq("user_id", userId)
      .single();

    if (goalError || !goal) {
      throw new Error("Goal not found");
    }

    // 2. Fetch user profile (to read learning style / level)
    const userWithProfile = await UserService.getProfile(userId);
    const difficulty = goal.difficulty || "beginner";
    const learningStyle = userWithProfile.profile?.learning_style || "mixed";
    const timePerWeek = options?.timePerWeek || 5; // default 5 hours/week

    // 3. Compile prompt
    let goalDescription = goal.description || "";
    try {
      const json = JSON.parse(goal.description);
      goalDescription = `${json.describe || ""}. Priorities: 1. ${json.priority1 || ""}, 2. ${json.priority2 || ""}, 3. ${json.priority3 || ""}`;
    } catch (e) {
      // not JSON, keep as is
    }

    const prompt = buildPrompt("roadmap", {
      goal: `${goal.title}. ${goalDescription}`,
      level: difficulty,
      timePerWeek: timePerWeek.toString(),
      targetDate: goal.target_date || "3 months from now",
    });

    // 4. Generate with AI
    const aiText = await AIGateway.generate(prompt);
    let parsedRoadmap: any;

    try {
      parsedRoadmap = JSON.parse(aiText.replace(/```json|```/g, "").trim());
    } catch (err: any) {
      console.error("Failed to parse generated roadmap JSON. Response was:", aiText);
      throw new Error("AI did not return a valid structured roadmap. Please try again.");
    }

    // 5. Store in DB
    const { data: roadmapRecord, error: roadmapError } = await supabase
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
    await UserService.addXp(userId, 50).catch((e) =>
      console.error("Failed to award XP:", e.message)
    );

    return roadmapRecord;
  }

  /**
   * Fetch all roadmaps for a user
   */
  static async getRoadmaps(userId: string) {
    const { data, error } = await supabase
      .from("learning_paths")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Fetch a single roadmap
   */
  static async getRoadmap(userId: string, roadmapId: string) {
    const { data, error } = await supabase
      .from("learning_paths")
      .select("*, goals(*)")
      .eq("id", roadmapId)
      .eq("user_id", userId)
      .single();

    if (error) throw error;
    // normalize nested goal if present
    if (data && data.goals) data.goals = GoalsService.normalizeGoalRecord(data.goals);
    return data;
  }

  /**
   * Build a context string from all the user's goals that have useInSearch enabled.
   * This string is injected into the search ranker to boost goal-relevant results.
   */
  static async getActiveGoalContext(userId: string): Promise<string> {
    const { data, error } = await supabase
      .from("goals")
      .select("title, description, category")
      .eq("user_id", userId)
      .eq("use_in_search", true)
      .eq("status", "active");

    if (error || !data || data.length === 0) return "";

    // Build a compact context string from all matching goals
    return data
      .map((g: any) => {
          const row = GoalsService.normalizeGoalRecord(g);
          let text = `Goal: ${row.title}`;
          if (row.description) {
            const parts: string[] = [];
            try {
              const json = JSON.parse(row.description || "{}");
              if (json.describe) parts.push(json.describe);
              if (json.priority1) parts.push(`Priority 1: ${json.priority1}`);
              if (json.priority2) parts.push(`Priority 2: ${json.priority2}`);
              if (json.priority3) parts.push(`Priority 3: ${json.priority3}`);
            } catch {
              // not JSON
            }
            if (parts.length) text += `. ${parts.join(". ")}`;
            else text += `. ${row.description}`;
          }
          if (row.category) text += `. Category: ${row.category}`;
          return text;
      })
      .join(" | ");
  }

  private static normalizeGoalRecord(r: any) {
    if (!r) return r;
    return {
      id: r.id,
      userId: r.user_id || r.userId,
      title: r.title,
      description: r.description,
      category: r.category,
      difficulty: r.difficulty,
      targetDate: r.target_date || r.targetDate,
      priority1: r.priority1 || null,
      priority2: r.priority2 || null,
      priority3: r.priority3 || null,
      status: r.status,
      useInSearch: r.use_in_search !== undefined ? r.use_in_search : r.useInSearch,
      createdAt: r.created_at || r.createdAt,
    } as Goal;
  }
}

export default GoalsService;
