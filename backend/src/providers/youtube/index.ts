// src/providers/youtube/index.ts
import { ContentProvider } from "../base.provider";
import { Content, SearchOptions } from "../../models/content.model";
import cheerio from "cheerio";
import { supabase } from "../../config/supabase";
import { userKeyRotationManager } from "../../utils/userKeyManager";

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
    const limit = Math.max(options?.limit || 70, 70);

    // 1. Resolve custom user YouTube keys and fallback env keys
    let userYoutubeKeysString = "";
    if (options?.userId && options.userId !== "anonymous") {
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("user_youtube_api_keys")
          .eq("id", options.userId)
          .single();
        if (profile?.user_youtube_api_keys) {
          userYoutubeKeysString = profile.user_youtube_api_keys;
        }
      } catch (err: any) {
        console.error("[YouTubeProvider] Failed to fetch user YouTube API keys:", err.message);
      }
    }

    // Load backend/env fallback keys
    const envKeys: string[] = [];
    const rawMultiKeys = process.env.YOUTUBE_API_KEYS;
    if (rawMultiKeys) {
      const cleaned = rawMultiKeys
        .trim()
        .replace(/^['"]|['"]$/g, "")
        .split(/[,;\n\r]+/)
        .map((k) => k.trim().replace(/^['"]|['"]$/g, ""))
        .filter((k) => k.length > 0 && !k.includes("your-"));
      envKeys.push(...cleaned);
    }
    const singleKey = process.env.YOUTUBE_API_KEY?.trim().replace(/^['"]|['"]$/g, "");
    if (singleKey && singleKey !== "AIzaSy..." && !singleKey.includes("your-") && !envKeys.includes(singleKey)) {
      envKeys.push(singleKey);
    }

    const userId = options?.userId || "anonymous";

    // 2. Perform API search if keys are available
    const hasKeysAvailable = !!userYoutubeKeysString || envKeys.length > 0;
    if (hasKeysAvailable) {
      try {
        const results = await this.searchViaYouTubeAPI(query, limit, userId, userYoutubeKeysString, envKeys);
        if (results && results.length > 0) {
          return results;
        }
      } catch (apiErr: any) {
        console.warn(`[YouTubeProvider] API search failed, falling back to scraping:`, apiErr.message);
      }
    }

    // 3. Fallback to scraping
    if (this.isChannelQuery(query)) {
      const results = await this.searchChannel(query, limit);
      console.debug(`[YouTube Scrape] Channel search for "${query}" returned ${results.length} results`);
      return results;
    }

    return await this.searchViaYouTubeHTML(query, limit);
  }

  private async searchViaYouTubeAPI(
    query: string,
    limit: number,
    userId: string,
    userKeysString: string,
    envKeys: string[]
  ): Promise<Content[]> {
    const apiKey = userKeyRotationManager.getKey("youtube", userId, userKeysString, envKeys);
    if (!apiKey) {
      this.quotaExhausted = true;
      throw new Error("No active YouTube API keys available (all exhausted or empty)");
    }

    try {
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(
        query
      )}&maxResults=${Math.min(limit, 50)}&key=${apiKey}`;

      const res = await fetch(url);
      if (res.status === 403 || res.status === 429) {
        console.warn(`[YouTubeProvider] Key ${apiKey.substring(0, 8)}... hit rate limit/quota (status ${res.status}). Rotating...`);
        userKeyRotationManager.markExhausted("youtube", userId, apiKey);
        
        // Remove the exhausted key from candidates list and retry
        let updatedUserKeysString = userKeysString;
        let updatedEnvKeys = envKeys;
        if (userKeysString.includes(apiKey)) {
          updatedUserKeysString = userKeysString
            .split(",")
            .map(k => k.trim())
            .filter(k => k !== apiKey)
            .join(",");
        } else {
          updatedEnvKeys = envKeys.filter(k => k !== apiKey);
        }
        return this.searchViaYouTubeAPI(query, limit, userId, updatedUserKeysString, updatedEnvKeys);
      }

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`YouTube API returned ${res.status}: ${errorText}`);
      }

      const data: any = await res.json();
      const items = data.items || [];

      // Fetch detail (durations/views) for parsed video ids
      const videoIds = items.map((item: any) => item.id?.videoId).filter(Boolean);
      let detailsMap = new Map<string, { duration: number; viewCount?: number }>();
      
      if (videoIds.length > 0) {
        try {
          const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics&id=${videoIds.join(
            ","
          )}&key=${apiKey}`;
          const detailsRes = await fetch(detailsUrl);
          if (detailsRes.ok) {
            const detailsData: any = await detailsRes.json();
            (detailsData.items || []).forEach((vItem: any) => {
              detailsMap.set(vItem.id, {
                duration: this.parseISO8601Duration(vItem.contentDetails?.duration),
                viewCount: parseInt(vItem.statistics?.viewCount ?? "0", 10),
              });
            });
          }
        } catch (detailErr) {
          console.warn("[YouTubeProvider] Failed to fetch video details:", detailErr);
        }
      }

      return items.map((item: any): Content => {
        const videoId = item.id?.videoId;
        const details = detailsMap.get(videoId);
        return {
          id: `youtube_${videoId}`,
          title: item.snippet.title,
          url: `https://www.youtube.com/watch?v=${videoId}`,
          source: "youtube",
          type: "video",
          thumbnail: item.snippet.thumbnails?.high?.url ?? item.snippet.thumbnails?.default?.url,
          description: item.snippet.description,
          author: item.snippet.channelTitle,
          duration: details ? details.duration : 0,
          viewCount: details ? details.viewCount : undefined,
          tags: [this.name, "youtube"],
          language: "en",
          metadata: {
            channelId: item.snippet.channelId,
          },
          createdAt: new Date(item.snippet.publishedAt),
        };
      });
    } catch (err: any) {
      console.error(`[YouTubeProvider] Error using key ${apiKey.substring(0, 8)}...:`, err.message);
      // Fallback: mark as exhausted and retry
      userKeyRotationManager.markExhausted("youtube", userId, apiKey);
      let updatedUserKeysString = userKeysString;
      let updatedEnvKeys = envKeys;
      if (userKeysString.includes(apiKey)) {
        updatedUserKeysString = userKeysString
          .split(",")
          .map(k => k.trim())
          .filter(k => k !== apiKey)
          .join(",");
      } else {
        updatedEnvKeys = envKeys.filter(k => k !== apiKey);
      }
      if (updatedUserKeysString || updatedEnvKeys.length > 0) {
        return this.searchViaYouTubeAPI(query, limit, userId, updatedUserKeysString, updatedEnvKeys);
      }
      throw err;
    }
  }

  private async searchViaYouTubeHTML(query: string, limit: number): Promise<Content[]> {
    limit = Math.max(limit, 70);
    const results: Content[] = [];

    try {
      const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
      const res = await fetch(searchUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept-Language": "en-US,en;q=0.9",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        },
        signal: AbortSignal.timeout(10000),
      });

      if (!res.ok) {
        throw new Error(`YouTube HTML search returned ${res.status}`);
      }

      const html = await res.text();
      const $ = cheerio.load(html);
      const scripts = $("script").toArray();
      let initialData: any = null;
      let innerTubeConfig: any = null;
      let apiKey: string | undefined;

      for (const script of scripts) {
        const scriptText = $(script).html() || "";
        if (!scriptText) continue;

        if (!initialData) {
          const match = scriptText.match(/ytInitialData\s*=\s*(\{.+?\})\s*;/s);
          if (match) {
            try {
              initialData = JSON.parse(match[1]);
            } catch {
              /* ignore invalid JSON */
            }
          }
        }

        if (!innerTubeConfig) {
          const configMatch = scriptText.match(/ytcfg\.set\((\{.+?\})\);/s);
          if (configMatch) {
            try {
              innerTubeConfig = JSON.parse(configMatch[1]);
            } catch {
              /* ignore invalid JSON */
            }
          }
        }

        if (!apiKey && /INNERTUBE_API_KEY/.test(scriptText)) {
          const keyMatch = scriptText.match(/"INNERTUBE_API_KEY"\s*:\s*"([^"]+)"/);
          if (keyMatch) {
            apiKey = keyMatch[1];
          }
        }

        if (initialData && innerTubeConfig && apiKey) break;
      }

      if (!initialData) {
        throw new Error("Unable to parse ytInitialData from YouTube search page");
      }

      const initialVideos = this.extractVideosFromSearchData(initialData);
      results.push(...initialVideos.slice(0, limit));

      let continuationToken = this.extractContinuationToken(initialData);
      const context = innerTubeConfig?.INNERTUBE_CONTEXT || innerTubeConfig?.INNERTUBE_CONTEXT || undefined;

      while (results.length < limit && continuationToken && apiKey && context) {
        const continuationItems = await this.fetchSearchContinuation(apiKey, context, continuationToken);
        if (!continuationItems) break;

        const pageVideos = this.extractVideosFromSearchData(continuationItems);
        results.push(...pageVideos);
        results.splice(limit);

        continuationToken = this.extractContinuationToken(continuationItems);
      }

      return results.slice(0, limit);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn("[YouTube] HTML scrape fallback error:", message);
      return await this.searchViaDDG(query, limit);
    }
  }

  private extractVideosFromSearchData(data: any): Content[] {
    const videoRenderers: any[] = [];
    const collect = (node: any) => {
      if (!node || typeof node !== "object") return;
      const renderer = node.videoRenderer || node.gridVideoRenderer || node.compactVideoRenderer;
      if (renderer) {
        videoRenderers.push(renderer);
        return;
      }
      for (const value of Object.values(node)) {
        collect(value);
      }
    };
    collect(data);

    return videoRenderers.map((video: any) => {
      const videoId = video.videoId as string;
      if (!videoId) return null;

      const title = this.renderText(video.title) || "YouTube Video";
      const description = this.renderText(video.descriptionSnippet) || undefined;
      const thumbnail = (video.thumbnail?.thumbnails || []).slice(-1)[0]?.url;
      const durationText = this.renderText(video.lengthText) || undefined;
      const viewCountText = this.renderText(video.viewCountText) || undefined;
      const publishedTimeText = this.renderText(video.publishedTimeText) || undefined;
      const channelTitle = this.renderText(video.ownerText) || undefined;
      const channelId = video.ownerText?.runs?.[0]?.navigationEndpoint?.browseEndpoint?.browseId as string | undefined;

      return {
        id: `youtube_${videoId}`,
        title: title.replace(/\s*-\s*YouTube$/i, ""),
        url: `https://www.youtube.com/watch?v=${videoId}`,
        source: "youtube",
        type: "video",
        thumbnail,
        description,
        author: channelTitle,
        duration: durationText ? this.parseDurationString(durationText) : 0,
        viewCount: viewCountText ? this.parseViewCount(viewCountText) : undefined,
        tags: [this.name, "youtube"],
        language: "en",
        metadata: {
          channelId,
          publishedTimeText,
        },
        createdAt: new Date(),
      } as Content;
    }).filter(Boolean) as Content[];
  }

  private renderText(node: any): string {
    if (!node) return "";
    if (typeof node === "string") return node;
    if (typeof node === "object") {
      if (Array.isArray(node?.runs)) {
        return node.runs.map((run: any) => run.text).join("");
      }
      if (typeof node.simpleText === "string") {
        return node.simpleText;
      }
      if (Array.isArray(node?.contents)) {
        return node.contents.map((item: any) => this.renderText(item)).join("");
      }
    }
    return "";
  }

  private parseDurationString(durationText: string): number {
    const parts = durationText.split(":").map((part) => parseInt(part.trim(), 10));
    if (parts.some(isNaN)) return 0;
    if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    }
    if (parts.length === 1) {
      return parts[0];
    }
    return 0;
  }

  private parseViewCount(text: string): number {
    const countText = text.replace(/[^0-9\.\,]/g, "").replace(/,/g, "");
    const parsed = parseFloat(countText);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  private extractContinuationToken(data: any): string | undefined {
    let token: string | undefined;
    const collect = (node: any) => {
      if (!node || typeof node !== "object") return;
      if (node.continuationEndpoint) {
        const command = node.continuationEndpoint.continuationCommand || node.continuationEndpoint;
        if (typeof command?.token === "string") {
          token = command.token;
          return;
        }
      }
      if (node.continuationItemRenderer?.continuationEndpoint) {
        const command = node.continuationItemRenderer.continuationEndpoint.continuationCommand || node.continuationItemRenderer.continuationEndpoint;
        if (typeof command?.token === "string") {
          token = command.token;
          return;
        }
      }
      for (const value of Object.values(node)) {
        if (token) break;
        collect(value);
      }
    };
    collect(data);
    return token;
  }

  private async fetchSearchContinuation(apiKey: string, context: any, continuation: string): Promise<any> {
    const url = `https://www.youtube.com/youtubei/v1/search?key=${apiKey}`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json, text/javascript, */*; q=0.01",
        "Referer": `https://www.youtube.com/results?search_query=${encodeURIComponent(context?.query || "")}`,
      },
      body: JSON.stringify({ context, continuation }),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      throw new Error(`YouTube continuation request failed ${res.status}`);
    }
    return await res.json();
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
      const channelUrl = this.buildChannelVideosUrl(query, channelHandle);
      const res = await fetch(channelUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept-Language": "en-US,en;q=0.9",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        },
        signal: AbortSignal.timeout(10000),
      });

      if (!res.ok) {
        console.warn(`YouTube channel page request failed: ${res.status}`);
        return [];
      }

      const html = await res.text();
      const $ = cheerio.load(html);
      let initialData: any = null;
      let innerTubeConfig: any = null;
      let apiKey: string | undefined;

      for (const script of $("script").toArray()) {
        const scriptText = $(script).html() || "";
        if (!scriptText) continue;

        if (!initialData) {
          const match = scriptText.match(/ytInitialData\s*=\s*(\{.+?\})\s*;/s);
          if (match) {
            try {
              initialData = JSON.parse(match[1]);
            } catch {
              /* ignore invalid JSON */
            }
          }
        }

        if (!innerTubeConfig) {
          const configMatch = scriptText.match(/ytcfg\.set\((\{.+?\})\);/s);
          if (configMatch) {
            try {
              innerTubeConfig = JSON.parse(configMatch[1]);
            } catch {
              /* ignore invalid JSON */
            }
          }
        }

        if (!apiKey && /INNERTUBE_API_KEY/.test(scriptText)) {
          const keyMatch = scriptText.match(/"INNERTUBE_API_KEY"\s*:\s*"([^\"]+)"/);
          if (keyMatch) {
            apiKey = keyMatch[1];
          }
        }

        if (initialData && innerTubeConfig && apiKey) break;
      }

      if (!initialData) {
        throw new Error("Unable to parse channel page data from YouTube");
      }

      const headerData = this.extractChannelHeaderData(initialData, channelHandle);
      if (headerData?.channelId) {
        results.push({
          id: `youtube_channel_${headerData.channelId}`,
          title: `${headerData.title} - YouTube Channel`,
          url: headerData.channelUrl,
          source: "youtube",
          type: "channel",
          thumbnail: headerData.thumbnail,
          description: headerData.description,
          author: headerData.title,
          tags: ["youtube", "channel", channelHandle],
          language: "en",
          metadata: {
            channelId: headerData.channelId,
            handle: channelHandle,
            subscriberText: headerData.subscriberText,
          },
          createdAt: new Date(),
        });
      }

      const videos = this.extractVideosFromSearchData(initialData);
      results.push(...videos.slice(0, Math.max(limit - results.length, 0)));

      let continuationToken = this.extractContinuationToken(initialData);
      const context = innerTubeConfig?.INNERTUBE_CONTEXT;

      while (results.length < limit && continuationToken && apiKey && context) {
        const continuationItems = await this.fetchSearchContinuation(apiKey, context, continuationToken);
        if (!continuationItems) break;

        const pageVideos = this.extractVideosFromSearchData(continuationItems);
        results.push(...pageVideos);
        results.splice(limit);
        continuationToken = this.extractContinuationToken(continuationItems);
      }

      return results.slice(0, limit);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn("[YouTube] Channel scrape error:", message);
      return [];
    }
  }

  private buildChannelVideosUrl(query: string, channelHandle: string): string {
    const lower = query.toLowerCase();
    if (/youtube\.com\/channel\//.test(lower)) {
      return query.includes("/videos") ? query : `${query.replace(/\/+$/, "")}/videos`;
    }
    if (/youtube\.com\/@/.test(lower)) {
      return query.includes("/videos") ? query : `${query.replace(/\/+$/, "")}/videos`;
    }
    return `https://www.youtube.com/@${channelHandle}/videos`;
  }

  private extractChannelHeaderData(data: any, channelHandle: string) {
    let header: any = null;
    const collect = (node: any) => {
      if (!node || typeof node !== "object") return;
      if (node.c4TabbedHeaderRenderer || node.channelMetadataRenderer || node.header?.c4TabbedHeaderRenderer) {
        header = node.c4TabbedHeaderRenderer || node.channelMetadataRenderer || node.header?.c4TabbedHeaderRenderer;
        return;
      }
      for (const value of Object.values(node)) {
        collect(value);
      }
    };
    collect(data);

    if (!header) return null;

    const title = this.renderText(header.title || header.channelTitle) || channelHandle;
    const thumbnails = header?.avatar?.thumbnails || header?.thumbnail?.thumbnails || [];
    const thumbnail = thumbnails.slice(-1)[0]?.url;
    const channelId = header?.channelId || header?.externalId || header?.ownerProfileUrl?.replace?.("/channel/", "") || undefined;
    const channelUrl = channelId ? `https://www.youtube.com/channel/${channelId}` : `https://www.youtube.com/@${channelHandle}`;
    const description = this.renderText(header.description) || undefined;
    const subscriberText = this.renderText(header.subscriberCountText) || undefined;

    return { title, thumbnail, channelId, channelUrl, description, subscriberText };
  }
}


