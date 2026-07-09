// src/providers/devto/index.ts
import { ContentProvider } from "../base.provider";
import { Content, SearchOptions } from "../../models/content.model";

/**
 * Dev.to provider — searches via the free Dev.to Forem API.
 * High-quality developer articles and tutorials.
 */
export class DevToProvider implements ContentProvider {
  name = "devto";

  async search(query: string, options?: SearchOptions): Promise<Content[]> {
    const results: Content[] = [];
    const limit = options?.limit || 30;

    try {
      const limit = options?.limit || 100;
      // Free public endpoint without API key, rate limit is generous but we should still respect reasonable limits.
      const url = `https://dev.to/api/articles?search=${encodeURIComponent(query)}&per_page=${limit}`;
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; MyTube-Learning-Bot/1.0)",
        },
        signal: AbortSignal.timeout(8000),
      });

      if (!res.ok) {
        throw new Error(`Dev.to API returned status ${res.status}`);
      }

      const items = await res.json() as Record<string, any>[];

      for (const item of items) {
        results.push({
          id: `devto_${item.id}`,
          title: item.title,
          url: item.url,
          source: "devto",
          type: "article",
          thumbnail: item.cover_image || item.social_image,
          description: item.description,
          author: item.user?.name || item.user?.username,
          tags: ["devto", "article", ...(item.tag_list || [])],
          language: "en",
          metadata: {
            reactions: item.public_reactions_count,
            comments: item.comments_count,
            readingTime: item.reading_time_minutes,
          },
          viewCount: item.public_reactions_count, // Use reactions as a proxy for popularity
          createdAt: new Date(item.published_at),
        });
      }

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("Dev.to search error:", message);
    }

    return results;
  }
}
