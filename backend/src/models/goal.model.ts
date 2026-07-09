// src/models/goal.model.ts
export interface Goal {
  id: string;
  userId: string;
  title: string;
  description?: string;
  category?: string;
  difficulty?: "beginner" | "intermediate" | "advanced";
  targetDate?: string;
  priority1?: string;
  priority2?: string;
  priority3?: string;
  status: "active" | "completed" | "paused";
  /** Whether this goal should influence search result ranking */
  useInSearch: boolean;
  createdAt: Date;
}
