import { ContentProvider } from "../base.provider";
import { Content, SearchOptions } from "../../models/content.model";
import config from "../../config";
import { v4 as uuidv4 } from "uuid";

export class MediumProvider implements ContentProvider {
  name = "medium";

  async search(query: string, options?: SearchOptions): Promise<Content[]> {
    const apiKey = config.googleCseApiKey;
    const cx = config.googleCseCx;

    if (!apiKey || !cx) {
      console.warn("Google Custom Search Engine credentials not configured. Medium search is disabled.");
      return [];
    }

    try {
      const totalToFetch = Math.max(options?.limit || 70, 70);
      const targetQuery = `${query} site:medium.com`;
      let startIndex = 1;
      let allItems: any[] = [];

      while (allItems.length < totalToFetch) {
        const batchSize = Math.min(10, totalToFetch - allItems.length);
        const url = `https://www.googleapis.com/customsearch/v1?key=${encodeURIComponent(apiKey)}&cx=${encodeURIComponent(cx)}&q=${encodeURIComponent(targetQuery)}&num=${batchSize}&start=${startIndex}`;

        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`Google CSE API returned status ${res.status}`);
        }

        const data = await res.json();
        const items = data.items || [];
        if (items.length === 0) break;

        allItems.push(...items);
        startIndex += items.length;
        if (items.length < batchSize) break;
      }

      return allItems.slice(0, totalToFetch).map((item: any): Content => {
        const thumbnail = item.pagemap?.cse_thumbnail?.[0]?.src || item.pagemap?.metatags?.[0]?.["og:image"] || undefined;
        const author = item.pagemap?.metatags?.[0]?.["author"] || item.pagemap?.metatags?.[0]?.["twitter:creator"] || "Medium Author";
        const snippet = item.snippet || "";

        return {
          id: `medium_${uuidv4()}`,
          title: item.title || "Untitled Article",
          url: item.link,
          source: "medium",
          type: "article",
          thumbnail,
          description: snippet,
          author,
          tags: ["medium", "article"],
          language: "en",
          metadata: {
            displayLink: item.displayLink,
            formattedUrl: item.formattedUrl,
          },
          createdAt: new Date(),
        };
      });
    } catch (err: any) {
      console.error("Medium search error:", err.message);
      return [];
    }
  }
}

