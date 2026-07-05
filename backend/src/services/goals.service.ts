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
    return (data || []) as any[];
  }

  static async createGoal(
    userId: string,
    goalData: {
      title: string;
      description?: string;
      category?: string;
      difficulty?: "beginner" | "intermediate" | "advanced";
      targetDate?: string;
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
        status: "active",
      })
      .select()
      .single();

    if (error || !data) throw error || new Error("Failed to create goal");
    return data as any;
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
    if (updates.status !== undefined) dbUpdates.status = updates.status;

    const { data, error } = await supabase
      .from("goals")
      .update(dbUpdates)
      .eq("id", goalId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error || !data) throw error || new Error("Failed to update goal");
    return data as any;
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
    const prompt = buildPrompt("roadmap", {
      goal: `${goal.title}. ${goal.description || ""}`,
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
    return data;
  }
}

export default GoalsService;
