// src/models/goal.model.ts
export interface Goal {
  id: string;
  userId: string;
  title: string;
  description?: string;
  category?: string;
  difficulty?: "beginner" | "intermediate" | "advanced";
  targetDate?: string;
  status: "active" | "completed" | "paused";
  createdAt: Date;
}
