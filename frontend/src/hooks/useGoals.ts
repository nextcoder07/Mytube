// frontend/src/hooks/useGoals.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { Goal, Roadmap } from "../types/content";

export function useGoals() {
  const queryClient = useQueryClient();

  const { data: goals = [], isLoading: isLoadingGoals, error: goalsError } = useQuery<Goal[]>({
    queryKey: ["goals"],
    queryFn: async () => {
      const res = await api.get("/goals");
      return res.data?.data || [];
    },
  });

  const { data: roadmaps = [], isLoading: isLoadingRoadmaps } = useQuery<Roadmap[]>({
    queryKey: ["roadmaps"],
    queryFn: async () => {
      const res = await api.get("/goals/roadmaps");
      return res.data?.data || [];
    },
  });

  const createGoalMutation = useMutation({
    mutationFn: async (newGoal: {
      title: string;
      description?: string;
      category?: string;
      difficulty?: "beginner" | "intermediate" | "advanced";
      targetDate?: string;
      priority1?: string;
      priority2?: string;
      priority3?: string;
    }) => {
      const res = await api.post("/goals", newGoal);
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });

  const updateGoalMutation = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Omit<Goal, "id" | "userId">>;
    }) => {
      const res = await api.put(`/goals/${id}`, updates);
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });

  const deleteGoalMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/goals/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });

  const generateRoadmapMutation = useMutation({
    mutationFn: async ({
      goalId,
      timePerWeek,
    }: {
      goalId: string;
      timePerWeek?: number;
    }) => {
      const res = await api.post(`/goals/${goalId}/roadmap`, { timePerWeek });
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roadmaps"] });
    },
  });

  return {
    goals,
    roadmaps,
    isLoading: isLoadingGoals || isLoadingRoadmaps,
    error: goalsError,
    createGoal: createGoalMutation.mutateAsync,
    isCreating: createGoalMutation.isPending,
    updateGoal: updateGoalMutation.mutateAsync,
    deleteGoal: deleteGoalMutation.mutateAsync,
    generateRoadmap: generateRoadmapMutation.mutateAsync,
    isGeneratingRoadmap: generateRoadmapMutation.isPending,
  };
}
