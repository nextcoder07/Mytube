// src/types/content.ts

export interface Content {
  id: string;
  title: string;
  url: string;
  source: "youtube" | "github" | "reddit" | "medium" | "website";
  type: "video" | "article" | "repo" | "post" | "course";
  thumbnail?: string;
  description?: string;
  author?: string;
  duration?: number;
  tags: string[];
  language: string;
  metadata: {
    aiExplanation?: string;
    aiScore?: number;
    channelId?: string;
    forks?: number;
    stars?: number;
    subreddit?: string;
    ups?: number;
    numComments?: number;
    [key: string]: unknown;
  };
  viewCount?: number;
  createdAt: string;
}

export interface Playlist {
  id: string;
  userId: string;
  title: string;
  description?: string;
  isPublic: boolean;
  aiGenerated: boolean;
  createdAt: string;
  items?: PlaylistItem[];
}

export interface PlaylistItem {
  id: string;
  playlistId: string;
  contentId: string;
  position: number;
  addedAt: string;
  content?: Content;
}

export interface Note {
  id: string;
  userId: string;
  contentId?: string;
  title?: string;
  body: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  content?: Content;
}

export interface Summary {
  contentId: string;
  summary: string;
  keyPoints: string[];
  cached?: boolean;
}
