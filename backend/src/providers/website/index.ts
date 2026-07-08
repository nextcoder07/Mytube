// src/providers/website/index.ts
import { ContentProvider } from "../base.provider";
import { Content, SearchOptions } from "../../models/content.model";

export class WebsiteProvider implements ContentProvider {
  name = "website";

  async search(query: string, options?: SearchOptions): Promise<Content[]> {
    try {
      const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        }
      });
      if (!res.ok) {
        throw new Error(`DuckDuckGo returned status ${res.status}`);
      }
      const html = await res.text();
      const results: Content[] = [];
      const parts = html.split('<div class="result ');
      
      for (let i = 1; i < parts.length; i++) {
        const part = parts[i];
        if (part.includes('class="badge--ad"') || part.includes('result--ad')) {
          continue;
        }
        
        const titleMatch = part.match(/<a[^>]+class="result__a"[^>]*>([\s\S]*?)<\/a>/);
        const snippetMatch = part.match(/<a[^>]+class="result__snippet"[^>]*>([\s\S]*?)<\/a>/);
        
        if (titleMatch) {
          const titleHtml = titleMatch[1];
          const title = titleHtml.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
          const hrefMatch = titleMatch[0].match(/href="([^"]+)"/);
          
          let actualUrl = "";
          if (hrefMatch) {
            let rawUrl = hrefMatch[1];
            if (rawUrl.startsWith("//")) {
              rawUrl = "https:" + rawUrl;
            } else if (rawUrl.startsWith("/")) {
              rawUrl = "https://duckduckgo.com" + rawUrl;
            }
            try {
              const u = new URL(rawUrl);
              actualUrl = u.searchParams.get("uddg") || rawUrl;
            } catch (e) {
              actualUrl = rawUrl;
            }
          }
          
          let description = "";
          if (snippetMatch) {
            description = snippetMatch[1].replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
          }
          
          if (actualUrl && title) {
            let author = "Website";
            try {
              author = new URL(actualUrl).hostname;
            } catch (e) {}

            results.push({
              id: `website_${Buffer.from(actualUrl).toString('base64').substring(0, 16)}`,
              title,
              url: actualUrl,
              source: "website",
              type: "article",
              description,
              author,
              tags: ["website", "docs"],
              language: "en",
              metadata: {},
              createdAt: new Date(),
            });
          }
        }
      }
      return results;
    } catch (err: any) {
      console.error("Website search error:", err.message);
      return [];
    }
  }
}
