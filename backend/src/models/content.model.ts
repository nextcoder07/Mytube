// src/models/content.model.ts

/** Universal content object — every provider normalizes to this shape */
export interface Content {
  id: string;
  title: string;
  url: string;
  source: "youtube" | "github" | "reddit" | "medium" | "website";
  type: "video" | "article" | "repo" | "post" | "course";
  thumbnail?: string;
  description?: string;
  author?: string;
  duration?: number; // seconds (videos)
  difficulty?: string;
  summary?: string;
  tags: string[];
  language: string;
  metadata: Record<string, unknown>; // source-specific extras
  viewCount?: number;
  createdAt: Date;
}

export interface SearchOptions {
  providers?: string[];
  type?: string;
  page?: number;
  limit?: number;
  pageToken?: string;
  // YouTube-optimized API filters
  order?: 'relevance' | 'date' | 'viewCount' | 'rating';
  videoDuration?: 'any' | 'short' | 'medium' | 'long';
  videoCategoryId?: string;
  relevanceLanguage?: string;
  // AI Search personalization
  aiContext?: string;
  after?: string; // date string (freshness constraint)
}
