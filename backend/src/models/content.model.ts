// src/models/content.model.ts

/** Universal content object — every provider normalizes to this shape */
export interface Content {
  id: string;
  title: string;
  url: string;
  source: "youtube" | "github" | "reddit" | "medium" | "website" | "devto" | "wikipedia";
  type: "video" | "article" | "repo" | "post" | "course" | "channel" | "profile";
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
  excludeIds?: string[];
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
  goalId?: string;
  // Pagination support
  after?: string;
  // Cache control
  useCache?: boolean;
  userId?: string;
}

export interface ProviderSearchResult {
  items: Content[];
  nextPageToken?: string;
  after?: string;
  page?: number;
  startIndex?: number;
  hasMore?: boolean;
}

/**
 * Paginated search response with caching metadata
 */
export interface PaginatedSearchResponse {
  data: Content[];
  pagination: {
    currentPage: number;
    resultsPerPage: number;
    totalResults: number;
    totalPages: number;
    hasNextPage: boolean;
  };
  cache: {
    isCached: boolean;
    source?: string;
  };
}
