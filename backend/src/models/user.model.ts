// src/models/user.model.ts
export interface User {
  id: string; // Firebase UID
  email: string;
  displayName?: string;
  photoUrl?: string;
  role: "user" | "admin";
  subscription: "free" | "premium";
  createdAt: Date;
  updatedAt: Date;
}

export interface Profile {
  id: string; // same as user id
  bio?: string;
  location?: string;
  website?: string;
  learningStyle?: "visual" | "reading" | "mixed";
  dailyGoalMinutes: number;
  streak: number;
  totalXp: number;
}
