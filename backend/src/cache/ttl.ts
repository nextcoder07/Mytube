// cache/ttl.ts — TTL constants (in seconds)
export const TTL = {
  SEARCH:         15 * 60,        // 15 min
  SUMMARY:        7 * 24 * 3600,  // 7 days
  ROADMAP:        24 * 3600,      // 24 hours
  FEED:           10 * 60,        // 10 min
  RECOMMENDATION: 1 * 3600,       // 1 hour
  SESSION:        7 * 24 * 3600,  // 7 days
  RATE_LIMIT:     60,             // 1 min
} as const;
