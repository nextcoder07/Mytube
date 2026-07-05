// cache/keys.ts — Typed cache key builders
export const CacheKeys = {
  search:         (query: string, providers: string) => `search:${query}:${providers}`,
  summary:        (contentId: string)                => `summary:${contentId}`,
  roadmap:        (goalId: string)                   => `roadmap:${goalId}`,
  feed:           (userId: string)                   => `feed:${userId}`,
  recommendation: (userId: string)                   => `recommendation:${userId}`,
  session:        (userId: string)                   => `session:${userId}`,
  rateLimit:      (ip: string)                       => `ratelimit:${ip}`,
} as const;
