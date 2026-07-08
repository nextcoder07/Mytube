// src/providers/reddit/index.ts
import { ContentProvider } from "../base.provider";
import { Content, SearchOptions } from "../../models/content.model";

export class RedditProvider implements ContentProvider {
  name = "reddit";

  async search(query: string, options?: SearchOptions): Promise<Content[]> {
    try {
      const totalToFetch = options?.limit || 100;
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
        });

        if (!res.ok) {
          throw new Error(`Reddit API returned status ${res.status}`);
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
      console.error("Reddit search error:", err.message);
      return [];
    }
  }
}

