// src/types/user.ts

export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoUrl?: string;
  role: "user" | "admin";
  subscription: "free" | "premium";
  createdAt: string;
  updatedAt: string;
  profile?: Profile;
}

export interface Profile {
  id: string;
  bio?: string;
  location?: string;
  website?: string;
  learningStyle: "visual" | "reading" | "mixed";
  dailyGoalMinutes: number;
  streak: number;
  totalXp: number;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description?: string;
  category?: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  targetDate?: string;
  status: "active" | "completed" | "paused";
  createdAt: string;
}

export interface Roadmap {
  id: string;
  userId: string;
  goalId?: string;
  title: string;
  description?: string;
  phases: {
    title: string;
    duration: string;
    topics: string[];
    resources: string[];
  }[];
  createdAt: string;
}
