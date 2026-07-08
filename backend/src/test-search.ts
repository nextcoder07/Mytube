import dotenv from "dotenv";
dotenv.config({ path: ".env" });
import { YouTubeProvider } from "./providers/youtube";
import { RedditProvider } from "./providers/reddit";
import { GitHubProvider } from "./providers/github";

async function test() {
  console.log("YOUTUBE_API_KEY in env:", process.env.YOUTUBE_API_KEY);
  
  const yt = new YouTubeProvider();
  // Strip quotes for test
  if (process.env.YOUTUBE_API_KEY) {
    process.env.YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY.replace(/^["']|["']$/g, "");
  }
  console.log("Searching YouTube...");
  const ytResults = await yt.search("car", { limit: 100 });
  console.log("YouTube results count:", ytResults.length);

  // Test DuckDuckGo HTML search
  console.log("Searching DuckDuckGo...");
  try {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent("car")}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      }
    });
    const html = await res.text();
    const results: any[] = [];
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
        let url = "";
        if (hrefMatch) {
          let rawUrl = hrefMatch[1];
          if (rawUrl.startsWith("//")) {
            rawUrl = "https:" + rawUrl;
          } else if (rawUrl.startsWith("/")) {
            rawUrl = "https://duckduckgo.com" + rawUrl;
          }
          try {
            const u = new URL(rawUrl);
            url = u.searchParams.get("uddg") || rawUrl;
          } catch (e) {
            url = rawUrl;
          }
        }
        let description = "";
        if (snippetMatch) {
          description = snippetMatch[1].replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
        }
        if (url && title) {
          results.push({ title, url, description });
        }
      }
    }
    console.log("Parsed DDG results count:", results.length);
    if (results.length > 0) {
      console.log("First DDG result:", results[0]);
    }
  } catch (err: any) {
    console.error("DDG search failed:", err.message);
  }

  const github = new GitHubProvider();
  console.log("Searching GitHub...");
  const githubResults = await github.search("car", { limit: 100 });
  console.log("GitHub results count:", githubResults.length);
}

test().catch(err => console.error("Test failed:", err));
