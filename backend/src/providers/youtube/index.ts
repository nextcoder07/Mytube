// src/providers/youtube/index.ts
import { ContentProvider } from "../base.provider";
import { Content, SearchOptions } from "../../models/content.model";

/**
 * Manages multiple YouTube API keys with automatic rotation.
 * When a key hits 429 (quota exceeded), it's marked as exhausted
 * and the next available key is used automatically.
 */
class YouTubeKeyManager {
  private keys: string[] = [];
  private exhaustedUntil: Map<string, number> = new Map(); // key -> timestamp when it can be retried
  private currentIndex = 0;

  constructor() {
    this.loadKeys();
  }

  private loadKeys() {
    const rawMultiKeys = process.env.YOUTUBE_API_KEYS;
    if (rawMultiKeys) {
      const cleaned = rawMultiKeys
        .trim()
        .replace(/^['"]|['"]$/g, "")
        .split(/[,;\n\r]+/)
        .map((k) => k.trim().replace(/^['"]|['"]$/g, ""))
        .filter((k) => k.length > 0 && !k.includes("your-"));

      if (cleaned.length > 0) {
        this.keys = cleaned;
      }
    }

    // Fallback to single YOUTUBE_API_KEY
    if (this.keys.length === 0) {
      const singleKey = process.env.YOUTUBE_API_KEY?.trim().replace(/^['"]|['"]$/g, "");
      if (singleKey && singleKey !== "AIzaSy..." && !singleKey.includes("your-")) {
        this.keys = [singleKey];
      }
    }

    if (this.keys.length > 0) {
      console.log(`[YouTubeKeyManager] Loaded ${this.keys.length} API key(s)`);
    }
  }

  hasKeys(): boolean {
    return this.keys.length > 0;
  }

  /**
   * Returns true when every configured key is currently marked exhausted.
   */
  isAllExhausted(): boolean {
    if (this.keys.length === 0) return true;
    const now = Date.now();
    return this.keys.every((key) => {
      const exhaustedUntil = this.exhaustedUntil.get(key) || 0;
      return now < exhaustedUntil;
    });
  }

  /**
   * Get the next available (non-exhausted) API key.
   * Returns null if all keys are exhausted.
   */
  getKey(): string | null {
    if (this.keys.length === 0) return null;

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
  markExhausted(key: string) {
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

export class YouTubeProvider implements ContentProvider {
  name = "youtube";
  private quotaExhausted = false;

  getStatus() {
    return {
      limitReached: this.quotaExhausted,
      message: this.quotaExhausted ? "YouTube API quota exhausted for all configured keys." : undefined,
    };
  }

  async search(query: string, options?: SearchOptions): Promise<Content[]> {
    this.quotaExhausted = false;
    // Detect if searching for a YouTube channel
    const isChannelSearch = this.isChannelQuery(query);
    
    if (isChannelSearch) {
      const results = await this.searchChannel(query, Math.max(options?.limit || 70, 70));
      console.debug(`[YouTube] Channel search for "${query}" returned ${results.length} results`);
      return results;
    }

    // Try API first, fallback to DDG if needed
    if (!keyManager.hasKeys()) {
      console.warn("[YouTube] No API keys configured. Using DDG fallback scraper for generic search.");
      return await this.searchViaDDG(query, Math.max(options?.limit || 70, 70));
    }

    try {
      const perPage = Math.min(Math.max(options?.limit || 70, 70), 50); // YouTube max is 50
      const allItems: Record<string, unknown>[] = [];
      let pageToken: string | undefined = options?.pageToken as string | undefined;
      const totalToFetch = Math.max(options?.limit || 70, 70);
      let fetched = 0;
      let activeKey = keyManager.getKey();

      if (!activeKey) {
        this.quotaExhausted = keyManager.isAllExhausted();
        if (this.quotaExhausted) {
          console.warn("[YouTube] All YouTube API keys are rate-limited. Using DDG fallback.");
        }
        return await this.searchViaDDG(query, Math.max(options?.limit || 70, 70));
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

      // Enforce minimum 70 results
      const effectiveTotal = Math.max(totalToFetch, 70);

      // Fetch multiple pages if needed
      while (fetched < effectiveTotal) {
        if (!activeKey) {
          this.quotaExhausted = keyManager.isAllExhausted();
          console.warn("All YouTube API keys exhausted mid-search. Returning partial results.");
          break;
        }

        const batchSize = Math.min(perPage, effectiveTotal - fetched);

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
        const data = await res.json() as Record<string, unknown>;
        const items = (data.items || []) as Record<string, unknown>[];
        allItems.push(...items);
        fetched += items.length;

        pageToken = data.nextPageToken as string | undefined;
        if (!pageToken || items.length === 0) break; // no more pages
      }

      const videoIds = allItems.map((item: Record<string, unknown>) => {
        const id = item.id as Record<string, unknown>;
        return id?.videoId as string;
      }).filter(Boolean);

      // Fetch durations & views in batches of 50, also with key rotation
      const detailsMap: Record<string, { duration: number; views: number }> = {};
      for (let i = 0; i < videoIds.length; i += 50) {
        if (!activeKey) {
          activeKey = keyManager.getKey();
          if (!activeKey) break;
        }

        const batch = videoIds.slice(i, i + 50);
        const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics&id=${batch.join(
          ","
        )}&key=${activeKey}`;
        const detailsRes = await fetch(detailsUrl);

        if (detailsRes.status === 429 || detailsRes.status === 403) {
          keyManager.markExhausted(activeKey);
          activeKey = keyManager.getKey();
          this.quotaExhausted = keyManager.isAllExhausted();
          if (activeKey) {
            i -= 50; // retry this batch with new key
          }
          continue;
        }

        if (detailsRes.ok) {
          const detailsData = await detailsRes.json() as Record<string, unknown>;
          const detailItems = (detailsData.items || []) as Record<string, unknown>[];
          detailItems.forEach((v: Record<string, unknown>) => {
            const contentDetails = v.contentDetails as Record<string, unknown> | undefined;
            const statistics = v.statistics as Record<string, unknown> | undefined;
            detailsMap[v.id as string] = {
              duration: this.parseISO8601Duration(contentDetails?.duration as string),
              views: parseInt((statistics?.viewCount as string) || "0", 10),
            };
          });
        }
      }

      return allItems.map((item: Record<string, unknown>): Content => {
        const id = item.id as Record<string, unknown>;
        const snippet = item.snippet as Record<string, unknown>;
        const thumbnails = snippet.thumbnails as Record<string, Record<string, string>> | undefined;
        const videoId = id.videoId as string;
        const details = detailsMap[videoId] || { duration: 0, views: 0 };
        return {
          id: `youtube_${videoId}`,
          title: snippet.title as string,
          url: `https://www.youtube.com/watch?v=${videoId}`,
          source: "youtube",
          type: "video",
          thumbnail: thumbnails?.high?.url || thumbnails?.default?.url,
          description: snippet.description as string,
          author: snippet.channelTitle as string,
          duration: details.duration,
          viewCount: details.views,
          tags: [this.name, "learning"],
          language: "en",
          metadata: { channelId: (snippet.channelId as string) },
          createdAt: new Date(snippet.publishedAt as string),
        };
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("[YouTube] API search error:", message, "Falling back to DDG scraper");
      // Graceful fallback to DDG scraper on error
      return await this.searchViaDDG(query, Math.max(options?.limit || 70, 70));
    }
  }

  private parseISO8601Duration(durationStr: string): number {
    if (!durationStr) return 0;
    const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
    const matches = durationStr.match(regex);
    if (!matches) return 0;
    const hours = parseInt(matches[1] || "0", 10);
    const minutes = parseInt(matches[2] || "0", 10);
    const seconds = parseInt(matches[3] || "0", 10);
    return hours * 3600 + minutes * 60 + seconds;
  }

  /**
   * Fallback scraper using DuckDuckGo HTML for when YouTube API keys are exhausted.
   * Scopes search to site:youtube.com and filters for watch URLs.
   * Always fetches at least 70 results.
   */
  private async searchViaDDG(query: string, limit: number = 70): Promise<Content[]> {
    limit = Math.max(limit, 70); // Enforce minimum 70 results
    const results: Content[] = [];
    try {
      const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query + " site:youtube.com")}`;
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
        signal: AbortSignal.timeout(8000),
      });

      if (!res.ok) return results;

      const html = await res.text();
      const parts = html.split('<div class="result ');

      for (let i = 1; i < parts.length && results.length < limit; i++) {
        const part = parts[i];
        if (part.includes('class="badge--ad"') || part.includes("result--ad")) continue;

        const titleMatch = part.match(/<a[^>]+class="result__a"[^>]*>([\s\S]*?)<\/a>/);
        const snippetMatch = part.match(/<a[^>]+class="result__snippet"[^>]*>([\s\S]*?)<\/a>/);

        if (!titleMatch) continue;

        let title = titleMatch[1].replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
        // Clean up common " - YouTube" suffixes
        title = title.replace(/\s*-\s*YouTube$/i, "");
        
        const hrefMatch = titleMatch[0].match(/href="([^"]+)"/);
        if (!hrefMatch) continue;

        let rawUrl = hrefMatch[1];
        if (rawUrl.startsWith("//")) rawUrl = "https:" + rawUrl;
        let actualUrl = rawUrl;
        try {
          const u = new URL(rawUrl);
          actualUrl = decodeURIComponent(u.searchParams.get("uddg") || rawUrl);
        } catch {
          /* keep rawUrl */
        }

        // Only accept actual youtube.com/watch URLs
        if (!actualUrl.includes("youtube.com/watch")) continue;

        let videoId = "";
        try {
          const u = new URL(actualUrl);
          videoId = u.searchParams.get("v") || "";
        } catch { }

        if (!videoId) continue;

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
    } catch (err: unknown) {
      console.warn("[YouTube] DDG fallback error:", err instanceof Error ? err.message : String(err));
    }
    return results;
  }

  /**
   * Detect if query is for a YouTube channel
   */
  private isChannelQuery(query: string): boolean {
    return (
      /^@[a-zA-Z0-9_]+$/.test(query) ||
      /youtube\.com\/@[a-zA-Z0-9_]+\/?$/.test(query) ||
      /youtube\s+channel|yt\s+channel|channel\s+@/i.test(query) ||
      /channel:\s*@?[a-zA-Z0-9_]+/i.test(query)
    );
  }

  /**
   * Extract channel handle from query
   */
  private extractChannelHandle(query: string): string {
    const atMatch = query.match(/^@([a-zA-Z0-9_]+)/);
    if (atMatch) return atMatch[1];

    const urlMatch = query.match(/youtube\.com\/@([a-zA-Z0-9_]+)/);
    if (urlMatch) return urlMatch[1];

    const channelMatch = query.match(/channel:\s*@?([a-zA-Z0-9_]+)/i);
    if (channelMatch) return channelMatch[1];

    const descMatch = query.match(/channel\s+@?([a-zA-Z0-9_]+)/i);
    if (descMatch) return descMatch[1];

    return query.replace(/[@\s]/g, "").substring(0, 30);
  }

  /**
   * Search for a YouTube channel and its videos
   */
  private async searchChannel(query: string, limit: number): Promise<Content[]> {
    const channelHandle = this.extractChannelHandle(query);
    const results: Content[] = [];

    try {
      const activeKey = keyManager.getKey();
      if (!activeKey) {
        console.warn("No YouTube API keys available for channel search");
        return [];
      }

      // 1. Search for the channel by handle
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(channelHandle)}&maxResults=1&key=${activeKey}`;
      const searchRes = await fetch(searchUrl);

      if (!searchRes.ok) {
        console.warn(`YouTube channel search failed: ${searchRes.status}`);
        return [];
      }

      const searchData = await searchRes.json() as Record<string, unknown>;
      const channelItems = (searchData.items || []) as Record<string, unknown>[];

      if (channelItems.length === 0) {
        console.warn(`YouTube channel not found: ${channelHandle}`);
        return [];
      }

      const channelItem = channelItems[0];
      const snippet = channelItem.snippet as Record<string, unknown>;
      const channelId = (channelItem.id as Record<string, unknown>)?.channelId as string;

      // 2. Add channel info as first result
      results.push({
        id: `youtube_channel_${channelId}`,
        title: `${snippet.title} - YouTube Channel`,
        url: `https://www.youtube.com/channel/${channelId}`,
        source: "youtube",
        type: "channel",
        thumbnail: (snippet.thumbnails as Record<string, Record<string, string>> | undefined)?.high?.url,
        description: snippet.description as string,
        author: snippet.title as string,
        tags: ["youtube", "channel", channelHandle],
        language: "en",
        metadata: {
          channelId,
          handle: channelHandle,
        },
        createdAt: new Date(snippet.publishedAt as string),
      });

      // 3. Fetch channel's latest videos
      const videosUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${encodeURIComponent(channelId)}&order=date&type=video&maxResults=${Math.min(limit - 1, 25)}&key=${activeKey}`;
      const videosRes = await fetch(videosUrl);

      if (videosRes.ok) {
        const videosData = await videosRes.json() as Record<string, unknown>;
        const videoItems = (videosData.items || []) as Record<string, unknown>[];
        const videoIds = videoItems
          .map(item => {
            const id = item.id as Record<string, unknown>;
            return id?.videoId as string;
          })
          .filter(Boolean);

        // Fetch video details (duration, views)
        if (videoIds.length > 0) {
          const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics&id=${videoIds.join(",")}&key=${activeKey}`;
          const detailsRes = await fetch(detailsUrl);

          const detailsMap: Record<string, { duration: number; views: number }> = {};
          if (detailsRes.ok) {
            const detailsData = await detailsRes.json() as Record<string, unknown>;
            const detailItems = (detailsData.items || []) as Record<string, unknown>[];
            detailItems.forEach(item => {
              const contentDetails = item.contentDetails as Record<string, unknown> | undefined;
              const statistics = item.statistics as Record<string, unknown> | undefined;
              detailsMap[item.id as string] = {
                duration: this.parseISO8601Duration(contentDetails?.duration as string),
                views: parseInt((statistics?.viewCount as string) || "0", 10),
              };
            });
          }

          // Add videos to results
          videoItems.forEach(item => {
            const itemSnippet = item.snippet as Record<string, unknown>;
            const videoId = (item.id as Record<string, unknown>)?.videoId as string;
            const details = detailsMap[videoId] || { duration: 0, views: 0 };

            results.push({
              id: `youtube_${videoId}`,
              title: itemSnippet.title as string,
              url: `https://www.youtube.com/watch?v=${videoId}`,
              source: "youtube",
              type: "video",
              thumbnail: (itemSnippet.thumbnails as Record<string, Record<string, string>> | undefined)?.high?.url,
              description: itemSnippet.description as string,
              author: channelHandle,
              duration: details.duration,
              viewCount: details.views,
              tags: ["youtube", "video", channelHandle],
              language: "en",
              metadata: {
                channelId,
                channel: channelHandle,
              },
              createdAt: new Date(itemSnippet.publishedAt as string),
            });
          });
        }
      }

      return results.slice(0, limit);
    } catch (err: any) {
      console.error("YouTube channel search error:", err.message);
      return [];
    }
  }
}


