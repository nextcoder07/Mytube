"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheKeys = void 0;
// cache/keys.ts — Typed cache key builders
exports.CacheKeys = {
    search: (query, providers) => `search:${query}:${providers}`,
    summary: (contentId) => `summary:${contentId}`,
    roadmap: (goalId) => `roadmap:${goalId}`,
    feed: (userId) => `feed:${userId}`,
    recommendation: (userId) => `recommendation:${userId}`,
    session: (userId) => `session:${userId}`,
    rateLimit: (ip) => `ratelimit:${ip}`,
};
//# sourceMappingURL=keys.js.map