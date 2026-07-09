// src/providers/reddit/index.ts
import { ContentProvider } from "../base.provider";
import { Content, SearchOptions } from "../../models/content.model";

export class RedditProvider implements ContentProvider {
  name = "reddit";

  async search(query: string, options?: SearchOptions): Promise<Content[]> {
    const limit = options?.limit || 50; // Increased from 25 to 50
    
    try {
      const totalToFetch = limit;
      let allChildren: any[] = [];
      let after: string | null = null;
      let fetched = 0;

      while (fetched < totalToFetch) {
        const batchSize = Math.min(100, totalToFetch - fetched); // Reddit max per request is 100
        let url = `https://www.reddit.com/search.json?q=${encodeURIComponent(
          query
        )}&sort=relevance&limit=${batchSize}`;

        if (after) {
          url += `&after=${after}`;
        }

        const res = await fetch(url, {
          headers: {
            "User-Agent": "MyTube-Personalized-Learning/0.1.0 (by /u/mytube_bot)",
          },
          signal: AbortSignal.timeout(8000),
        });

        if (!res.ok) {
          console.warn(`[Reddit] API returned status ${res.status}. Using DuckDuckGo fallback.`);
          return await this.searchViaDDG(query, limit);
        }
        const data: any = await res.json();
        const children = data.data?.children || [];
        allChildren.push(...children);
        fetched += children.length;

        after = data.data?.after || null;
        if (!after || children.length === 0) break;
      }

      return allChildren.map((child: any): Content => {
        const item = child.data;
        return {
          id: `reddit_${item.id}`,
          title: item.title,
          url: `https://www.reddit.com${item.permalink}`,
          source: "reddit",
          type: "post",
          thumbnail: item.thumbnail && item.thumbnail.startsWith("http") ? item.thumbnail : undefined,
          description: item.selftext?.substring(0, 300) || `Discussion in r/${item.subreddit}`,
          author: `u/${item.author}`,
          viewCount: item.score,
          tags: [this.name, item.subreddit].filter(Boolean),
          language: "en",
          metadata: {
            subreddit: item.subreddit,
            ups: item.ups,
            numComments: item.num_comments,
          },
          createdAt: new Date(item.created_utc * 1000),
        };
      });
    } catch (err: any) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn(`[Reddit] Search failed: ${message}. Using DuckDuckGo fallback.`);
      return await this.searchViaDDG(query, limit);
    }
  }

  /**
   * Fallback: Use DuckDuckGo to search Reddit content
   */
  private async searchViaDDG(query: string, limit: number): Promise<Content[]> {
    const results: Content[] = [];
    try {
      const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query + " site:reddit.com")}`;
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        signal: AbortSignal.timeout(8000),
      });

      if (!res.ok) return results;

      const html = await res.text();
      const parts = html.split('<div class="result ');

      for (let i = 1; i < parts.length && results.length < limit; i++) {
        const part = parts[i];
        if (part.includes('class="badge--ad"') || part.includes("result--ad")) continue;

        const titleMatch = part.match(/<a[^>]+class="result__a"[^>]*>([\/\s\S]*?)<\/a>/);
        const hrefMatch = titleMatch?.[0].match(/href="([^"]+)"/);

        if (!titleMatch || !hrefMatch) continue;

        const title = titleMatch[1].replace(/<[^>]*>/g, "").trim();
        const url = hrefMatch[1];

        results.push({
          id: `reddit_ddg_${i}`,
          title,
          url,
          source: "reddit",
          type: "post",
          description: "",
          author: "Reddit User",
          tags: ["reddit", "discussion"],
          language: "en",
          metadata: { viaFallback: true },
          createdAt: new Date(),
        });
      }
    } catch (err) {
      console.error("[Reddit] DDG fallback error:", err instanceof Error ? err.message : String(err));
    }
    return results;
  }
}

