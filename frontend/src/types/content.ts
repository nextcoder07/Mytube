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

/** Advanced search filter state for YouTube API optimization */
export interface SearchFiltersState {
  order: 'relevance' | 'date' | 'viewCount' | 'rating';
  videoDuration: 'any' | 'short' | 'medium' | 'long';
  videoCategoryId: string;
  relevanceLanguage: string;
}

/** YouTube video category constants */
export const VIDEO_CATEGORIES = [
  { id: '', label: 'All Categories' },
  { id: '27', label: 'Education' },
  { id: '28', label: 'Science & Technology' },
  { id: '26', label: 'How-to & Style' },
  { id: '24', label: 'Entertainment' },
  { id: '25', label: 'News & Politics' },
  { id: '22', label: 'People & Blogs' },
  { id: '10', label: 'Music' },
  { id: '20', label: 'Gaming' },
] as const;

export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi' },
  { code: 'es', label: 'Spanish' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'ja', label: 'Japanese' },
  { code: 'ko', label: 'Korean' },
  { code: 'pt', label: 'Portuguese' },
  { code: 'zh', label: 'Chinese' },
  { code: 'ar', label: 'Arabic' },
] as const;

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description?: string;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  status: "active" | "completed" | "paused";
  targetDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoadmapPhase {
  title: string;
  description?: string;
  weeks?: number;
  duration?: string;
  topics: string[];
  resourcesSuggested?: string[];
  resources?: string[];
}

export interface Roadmap {
  id: string;
  userId: string;
  goalId: string;
  title: string;
  description?: string;
  phases: RoadmapPhase[];
  createdAt: string;
}


