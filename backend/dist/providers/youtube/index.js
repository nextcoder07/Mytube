"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.YouTubeProvider = void 0;
/**
 * Manages multiple YouTube API keys with automatic rotation.
 * When a key hits 429 (quota exceeded), it's marked as exhausted
 * and the next available key is used automatically.
 */
class YouTubeKeyManager {
    keys = [];
    exhaustedUntil = new Map(); // key -> timestamp when it can be retried
    currentIndex = 0;
    constructor() {
        this.loadKeys();
    }
    loadKeys() {
        // Support comma-separated list in YOUTUBE_API_KEYS (preferred)
        const multiKeys = process.env.YOUTUBE_API_KEYS?.replace(/^["']|["']$/g, "");
        if (multiKeys) {
            this.keys = multiKeys.split(",").map(k => k.trim()).filter(k => k.length > 0 && !k.includes("your-"));
        }
        // Fallback to single YOUTUBE_API_KEY
        if (this.keys.length === 0) {
            const singleKey = process.env.YOUTUBE_API_KEY?.replace(/^["']|["']$/g, "");
            if (singleKey && singleKey !== "AIzaSy..." && !singleKey.includes("your-")) {
                this.keys = [singleKey];
            }
        }
        if (this.keys.length > 0) {
            console.log(`[YouTubeKeyManager] Loaded ${this.keys.length} API key(s)`);
        }
    }
    hasKeys() {
        return this.keys.length > 0;
    }
    /**
     * Get the next available (non-exhausted) API key.
     * Returns null if all keys are exhausted.
     */
    getKey() {
        if (this.keys.length === 0)
            return null;
        const now = Date.now();
        // Try each key starting from currentIndex
        for (let i = 0; i < this.keys.length; i++) {
            const idx = (this.currentIndex + i) % this.keys.length;
            const key = this.keys[idx];
            const exhaustedUntil = this.exhaustedUntil.get(key) || 0;
            if (now >= exhaustedUntil) {
                this.currentIndex = idx;
                return key;
            }
        }
        return null; // all keys exhausted
    }
    /**
     * Mark a key as exhausted (rate-limited).
     * Cooldown: 1 hour (YouTube quota resets daily, but we retry sooner in case of transient limits).
     */
    markExhausted(key) {
        const cooldownMs = 60 * 60 * 1000; // 1 hour
        this.exhaustedUntil.set(key, Date.now() + cooldownMs);
        // Advance to next key
        this.currentIndex = (this.currentIndex + 1) % this.keys.length;
        const remaining = this.keys.filter(k => {
            const until = this.exhaustedUntil.get(k) || 0;
            return Date.now() >= until;
        }).length;
        console.warn(`[YouTubeKeyManager] Key exhausted (429). ${remaining}/${this.keys.length} keys still available.`);
    }
}
// Singleton key manager — persists across requests within the same server process
const keyManager = new YouTubeKeyManager();
class YouTubeProvider {
    name = "youtube";
    async search(query, options) {
        if (!keyManager.hasKeys()) {
            console.warn("YouTube API Key(s) not set. Falling back to DuckDuckGo scraper.");
            return this.searchViaDDG(query, options?.limit || 20);
        }
        try {
            const perPage = Math.min(options?.limit || 100, 50); // YouTube max is 50
            const allItems = [];
            let pageToken = options?.pageToken;
            const totalToFetch = options?.limit || 100;
            let fetched = 0;
            let activeKey = keyManager.getKey();
            if (!activeKey) {
                console.warn("All YouTube API keys are rate-limited. Falling back to DuckDuckGo scraper.");
                return this.searchViaDDG(query, options?.limit || 20);
            }
            // Use exact query unless an AI context/goal is provided
            let effectiveQuery = query;
            if (options?.aiContext) {
                effectiveQuery = `${query} tutorial full course comprehensive`;
            }
            // Resolve filter params with defaults
            const order = options?.order || 'relevance';
            const relevanceLanguage = options?.relevanceLanguage || 'en';
            const safeOrder = order === 'relevance' ? 'relevance' : order;
            // Fetch multiple pages if needed
            while (fetched < totalToFetch) {
                if (!activeKey) {
                    console.warn("All YouTube API keys exhausted mid-search. Returning partial results.");
                    break;
                }
                const batchSize = Math.min(perPage, totalToFetch - fetched);
                // Build optimized search URL with all YouTube Data API filters
                let searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet`
                    + `&q=${encodeURIComponent(effectiveQuery)}`
                    + `&type=video`
                    + `&videoEmbeddable=true`
                    + `&order=${safeOrder}`
                    + `&relevanceLanguage=${relevanceLanguage}`
                    + `&maxResults=${batchSize}`
                    + `&key=${activeKey}`;
                // Optional: Video duration filter (short/medium/long)
                if (options?.videoDuration && options.videoDuration !== 'any') {
                    searchUrl += `&videoDuration=${options.videoDuration}`;
                }
                // Optional: Video category filter
                if (options?.videoCategoryId) {
                    searchUrl += `&videoCategoryId=${options.videoCategoryId}`;
                }
                if (pageToken) {
                    searchUrl += `&pageToken=${pageToken}`;
                }
                const res = await fetch(searchUrl);
                // Handle rate limiting with key rotation
                if (res.status === 429 || res.status === 403) {
                    console.warn(`YouTube API returned ${res.status} for current key. Rotating...`);
                    keyManager.markExhausted(activeKey);
                    activeKey = keyManager.getKey();
                    // Retry this same page with the new key (don't increment fetched)
                    continue;
                }
                if (!res.ok) {
                    throw new Error(`YouTube API returned status ${res.status}`);
                }
                const data = await res.json();
                const items = (data.items || []);
                allItems.push(...items);
                fetched += items.length;
                pageToken = data.nextPageToken;
                if (!pageToken || items.length === 0)
                    break; // no more pages
            }
            const videoIds = allItems.map((item) => {
                const id = item.id;
                return id?.videoId;
            }).filter(Boolean);
            // Fetch durations & views in batches of 50, also with key rotation
            const detailsMap = {};
            for (let i = 0; i < videoIds.length; i += 50) {
                if (!activeKey) {
                    activeKey = keyManager.getKey();
                    if (!activeKey)
                        break;
                }
                const batch = videoIds.slice(i, i + 50);
                const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics&id=${batch.join(",")}&key=${activeKey}`;
                const detailsRes = await fetch(detailsUrl);
                if (detailsRes.status === 429 || detailsRes.status === 403) {
                    keyManager.markExhausted(activeKey);
                    activeKey = keyManager.getKey();
                    if (activeKey) {
                        i -= 50; // retry this batch with new key
                    }
                    continue;
                }
                if (detailsRes.ok) {
                    const detailsData = await detailsRes.json();
                    const detailItems = (detailsData.items || []);
                    detailItems.forEach((v) => {
                        const contentDetails = v.contentDetails;
                        const statistics = v.statistics;
                        detailsMap[v.id] = {
                            duration: this.parseISO8601Duration(contentDetails?.duration),
                            views: parseInt(statistics?.viewCount || "0", 10),
                        };
                    });
                }
            }
            return allItems.map((item) => {
                const id = item.id;
                const snippet = item.snippet;
                const thumbnails = snippet.thumbnails;
                const videoId = id.videoId;
                const details = detailsMap[videoId] || { duration: 0, views: 0 };
                return {
                    id: `youtube_${videoId}`,
                    title: snippet.title,
                    url: `https://www.youtube.com/watch?v=${videoId}`,
                    source: "youtube",
                    type: "video",
                    thumbnail: thumbnails?.high?.url || thumbnails?.default?.url,
                    description: snippet.description,
                    author: snippet.channelTitle,
                    duration: details.duration,
                    viewCount: details.views,
                    tags: [this.name, "learning"],
                    language: "en",
                    metadata: { channelId: snippet.channelId },
                    createdAt: new Date(snippet.publishedAt),
                };
            });
        }
        catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            console.error("YouTube search error:", message);
            return [];
        }
    }
    parseISO8601Duration(durationStr) {
        if (!durationStr)
            return 0;
        const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
        const matches = durationStr.match(regex);
        if (!matches)
            return 0;
        const hours = parseInt(matches[1] || "0", 10);
        const minutes = parseInt(matches[2] || "0", 10);
        const seconds = parseInt(matches[3] || "0", 10);
        return hours * 3600 + minutes * 60 + seconds;
    }
    /**
     * Fallback scraper using DuckDuckGo HTML for when YouTube API keys are exhausted.
     * Scopes search to site:youtube.com and filters for watch URLs.
     */
    async searchViaDDG(query, limit) {
        const results = [];
        try {
            const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query + " site:youtube.com")}`;
            const res = await fetch(url, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                },
                signal: AbortSignal.timeout(8000),
            });
            if (!res.ok)
                return results;
            const html = await res.text();
            const parts = html.split('<div class="result ');
            for (let i = 1; i < parts.length && results.length < limit; i++) {
                const part = parts[i];
                if (part.includes('class="badge--ad"') || part.includes("result--ad"))
                    continue;
                const titleMatch = part.match(/<a[^>]+class="result__a"[^>]*>([\s\S]*?)<\/a>/);
                const snippetMatch = part.match(/<a[^>]+class="result__snippet"[^>]*>([\s\S]*?)<\/a>/);
                if (!titleMatch)
                    continue;
                let title = titleMatch[1].replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
                // Clean up common " - YouTube" suffixes
                title = title.replace(/\s*-\s*YouTube$/i, "");
                const hrefMatch = titleMatch[0].match(/href="([^"]+)"/);
                if (!hrefMatch)
                    continue;
                let rawUrl = hrefMatch[1];
                if (rawUrl.startsWith("//"))
                    rawUrl = "https:" + rawUrl;
                let actualUrl = rawUrl;
                try {
                    const u = new URL(rawUrl);
                    actualUrl = decodeURIComponent(u.searchParams.get("uddg") || rawUrl);
                }
                catch {
                    /* keep rawUrl */
                }
                // Only accept actual youtube.com/watch URLs
                if (!actualUrl.includes("youtube.com/watch"))
                    continue;
                let videoId = "";
                try {
                    const u = new URL(actualUrl);
                    videoId = u.searchParams.get("v") || "";
                }
                catch { }
                if (!videoId)
                    continue;
                const description = snippetMatch
                    ? snippetMatch[1].replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim()
                    : "";
                results.push({
                    id: `youtube_${videoId}`,
                    title,
                    url: actualUrl,
                    source: "youtube",
                    type: "video",
                    thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
                    description: description || undefined,
                    author: "YouTube (Fallback)",
                    tags: ["youtube", "learning"],
                    language: "en",
                    metadata: {},
                    createdAt: new Date(),
                });
            }
        }
        catch (err) {
            console.warn("[YouTube] DDG fallback error:", err instanceof Error ? err.message : String(err));
        }
        return results;
    }
}
exports.YouTubeProvider = YouTubeProvider;
//# sourceMappingURL=index.js.map