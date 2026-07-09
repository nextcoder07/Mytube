// src/providers/wikipedia/index.ts
import { ContentProvider } from "../base.provider";
import { Content, SearchOptions } from "../../models/content.model";

/**
 * Wikipedia provider — searches Wikipedia via the standard REST API.
 */
export class WikipediaProvider implements ContentProvider {
  name = "wikipedia";

  async search(query: string, options?: SearchOptions): Promise<Content[]> {
    const results: Content[] = [];
    const limit = Math.min(options?.limit || 50, 50);

    try {
      const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
        query
      )}&utf8=&format=json&origin=*&srlimit=${limit}`;

      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; MyTube-Learning-Bot/1.0)",
        },
        signal: AbortSignal.timeout(8000),
      });

      if (!res.ok) {
        throw new Error(`Wikipedia API returned status ${res.status}`);
      }

      const data = await res.json() as Record<string, any>;
      const items = data.query?.search || [];

      for (const item of items) {
        // Remove HTML tags from snippet
        const description = item.snippet.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();

        results.push({
          id: `wiki_${item.pageid}`,
          title: item.title,
          url: `https://en.wikipedia.org/?curid=${item.pageid}`,
          source: "wikipedia",
          type: "article",
          description: description,
          author: "Wikipedia",
          tags: ["wikipedia", "article"],
          language: "en",
          metadata: {
            wordCount: item.wordcount,
          },
          createdAt: new Date(item.timestamp),
        });
      }

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("Wikipedia search error:", message);
    }

    return results;
  }
}
