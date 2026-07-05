// src/providers/github/index.ts
import { ContentProvider } from "../base.provider";
import { Content, SearchOptions } from "../../models/content.model";

export class GitHubProvider implements ContentProvider {
  name = "github";

  async search(query: string, options?: SearchOptions): Promise<Content[]> {
    const token = process.env.GITHUB_TOKEN;
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "MyTube-Personalized-Learning",
    };

    if (token && token !== "ghp_..." && !token.includes("your-")) {
      headers["Authorization"] = `token ${token}`;
    }

    try {
      const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(
        query
      )}&per_page=${options?.limit || 10}`;

      const res = await fetch(url, { headers });
      if (!res.ok) {
        throw new Error(`GitHub API returned status ${res.status}`);
      }
      const data: any = await res.json();
      const items = data.items || [];

      return items.map((item: any): Content => {
        return {
          id: `github_${item.id}`,
          title: item.full_name,
          url: item.html_url,
          source: "github",
          type: "repo",
          thumbnail: item.owner?.avatar_url || "https://images.unsplash.com/photo-1618401471353-b98aedd07871?w=500&auto=format&fit=crop&q=60",
          description: item.description,
          author: item.owner?.login,
          viewCount: item.stargazers_count, // map stars to viewCount
          tags: [this.name, item.language].filter(Boolean),
          language: item.language || "en",
          metadata: {
            forks: item.forks_count,
            stars: item.stargazers_count,
            openIssues: item.open_issues_count,
          },
          createdAt: new Date(item.created_at),
        };
      });
    } catch (err: any) {
      console.error("GitHub search error:", err.message);
      return this.getMockResults(query);
    }
  }

  private getMockResults(query: string): Content[] {
    return [
      {
        id: "github_mock1",
        title: `developer-roadmap/${query || "awesome-learning"}`,
        url: `https://github.com/developer-roadmap/${query || "awesome-learning"}`,
        source: "github",
        type: "repo",
        thumbnail: "https://images.unsplash.com/photo-1618401471353-b98aedd07871?w=500&auto=format&fit=crop&q=60",
        description: `Curated learning paths, resources, and project ideas for learning ${query || "web development"}.`,
        author: "developer-roadmap",
        viewCount: 23500,
        tags: ["github", "roadmap", "curated-list"],
        language: "TypeScript",
        metadata: { stars: 23500, forks: 4200 },
        createdAt: new Date(),
      },
    ];
  }
}
