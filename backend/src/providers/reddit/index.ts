// src/providers/reddit/index.ts
import { ContentProvider } from "../base.provider";
import { Content, SearchOptions } from "../../models/content.model";

export class RedditProvider implements ContentProvider {
  name = "reddit";

  async search(query: string, options?: SearchOptions): Promise<Content[]> {
    try {
      const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(
        query
      )}&limit=${options?.limit || 10}`;

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

      return children.map((child: any): Content => {
        const item = child.data;
        return {
          id: `reddit_${item.id}`,
          title: item.title,
          url: `https://www.reddit.com${item.permalink}`,
          source: "reddit",
          type: "post",
          thumbnail: item.thumbnail && item.thumbnail.startsWith("http") ? item.thumbnail : "https://images.unsplash.com/photo-1614332287897-cdc485fa562d?w=500&auto=format&fit=crop&q=60",
          description: item.selftext,
          author: `u/${item.author}`,
          viewCount: item.score, // map score to viewCount
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
      return this.getMockResults(query);
    }
  }

  private getMockResults(query: string): Content[] {
    return [
      {
        id: "reddit_mock1",
        title: `What is the best way to learn ${query || "Data Science"} in 2026?`,
        url: "https://www.reddit.com/r/learnprogramming/comments/mockreddit",
        source: "reddit",
        type: "post",
        thumbnail: "https://images.unsplash.com/photo-1614332287897-cdc485fa562d?w=500&auto=format&fit=crop&q=60",
        description: "Hey everyone! I want to start my journey into data science. What are the best tutorials, websites, or courses to use?",
        author: "u/eager_learner",
        viewCount: 432,
        tags: ["reddit", "learnprogramming"],
        language: "en",
        metadata: { subreddit: "learnprogramming", ups: 432, numComments: 89 },
        createdAt: new Date(),
      },
    ];
  }
}
