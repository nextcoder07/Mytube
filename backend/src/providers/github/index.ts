// src/providers/github/index.ts
import { ContentProvider } from "../base.provider";
import { Content, SearchOptions } from "../../models/content.model";
import { supabase } from "../../config/supabase";
import { userKeyRotationManager } from "../../utils/userKeyManager";

export class GitHubProvider implements ContentProvider {
  name = "github";

  async search(query: string, options?: SearchOptions): Promise<Content[]> {
    const limit = Math.max(options?.limit || 70, 70);

    // 1. Resolve custom user GitHub tokens and fallback env tokens
    let userGithubKeysString = "";
    if (options?.userId && options.userId !== "anonymous") {
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("user_github_api_keys")
          .eq("id", options.userId)
          .single();
        if (profile?.user_github_api_keys) {
          userGithubKeysString = profile.user_github_api_keys;
        }
      } catch (err: any) {
        console.error("[GitHubProvider] Failed to fetch user GitHub API keys:", err.message);
      }
    }

    // Load backend/env fallback token(s) — supports comma-separated GITHUB_TOKENS or single GITHUB_TOKEN
    const envKeys: string[] = [];
    const rawMultiTokens = process.env.MYTUBE_GITHUB_TOKENS || process.env.GITHUB_TOKENS;
    if (rawMultiTokens) {
      const cleaned = rawMultiTokens
        .trim()
        .replace(/^['"]|['"]$/g, "")
        .split(/[,;\n\r]+/)
        .map((k) => k.trim().replace(/^['"]|['"]$/g, ""))
        .filter((k) => k.length > 0 && !k.includes("your-") && k !== "ghp_...");
      envKeys.push(...cleaned);
    }
    const singleToken = (process.env.MYTUBE_GITHUB_TOKEN || process.env.GITHUB_TOKEN)?.trim().replace(/^['"]|['"]$/g, "");
    if (singleToken && singleToken !== "ghp_..." && !singleToken.includes("your-") && !envKeys.includes(singleToken)) {
      envKeys.push(singleToken);
    }

    const userId = options?.userId || "anonymous";

    // 2. Build headers using rotated key
    const headers = this.buildHeaders(userId, userGithubKeysString, envKeys);

    try {
      // Detect if searching for a GitHub user
      const isUserSearch = this.isGitHubUserQuery(query);

      if (isUserSearch) {
        return await this.searchUser(query, headers, limit, userId, userGithubKeysString, envKeys);
      }

      // Otherwise, search for repositories
      return await this.searchRepos(query, limit, userId, userGithubKeysString, envKeys);
    } catch (err: any) {
      console.error("GitHub search error:", err.message);
      return [];
    }
  }

  /**
   * Build request headers with the next available rotated API token
   */
  private buildHeaders(
    userId: string,
    userKeysString: string,
    envKeys: string[]
  ): Record<string, string> {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "MyTube-Personalized-Learning",
    };

    const token = userKeyRotationManager.getKey("github", userId, userKeysString, envKeys);
    if (token) {
      headers["Authorization"] = `token ${token}`;
      // Stash the active token in a custom header for downstream rate-limit handling
      headers["X-Active-Token"] = token;
    }

    return headers;
  }

  /**
   * Handle a rate-limited response: mark the current key as exhausted, rotate, and retry
   */
  private async handleRateLimit(
    userId: string,
    activeToken: string,
    userKeysString: string,
    envKeys: string[]
  ): Promise<Record<string, string> | null> {
    console.warn(`[GitHubProvider] Token ${activeToken.substring(0, 8)}... hit rate limit. Rotating...`);
    userKeyRotationManager.markExhausted("github", userId, activeToken);

    // Check if another key is available
    const nextToken = userKeyRotationManager.getKey("github", userId, userKeysString, envKeys);
    if (!nextToken) {
      console.warn("[GitHubProvider] All GitHub tokens exhausted. Proceeding unauthenticated.");
      return {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "MyTube-Personalized-Learning",
      };
    }

    return {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "MyTube-Personalized-Learning",
      Authorization: `token ${nextToken}`,
      "X-Active-Token": nextToken,
    };
  }

  /**
   * Execute a fetch with automatic rate-limit retry
   */
  private async fetchWithRetry(
    url: string,
    headers: Record<string, string>,
    userId: string,
    userKeysString: string,
    envKeys: string[],
    maxRetries = 3
  ): Promise<Response> {
    let currentHeaders = { ...headers };

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const res = await fetch(url, { headers: currentHeaders });

      if (res.status === 403 || res.status === 429) {
        const activeToken = currentHeaders["X-Active-Token"];
        if (activeToken) {
          const retryHeaders = await this.handleRateLimit(userId, activeToken, userKeysString, envKeys);
          if (retryHeaders) {
            currentHeaders = retryHeaders;
            continue; // retry with next token
          }
        }
        // No more tokens — return the failed response
        return res;
      }

      return res;
    }

    // Exhausted retries, make one final attempt
    return fetch(url, { headers: currentHeaders });
  }

  /**
   * Search repositories with rate-limit rotation
   */
  private async searchRepos(
    query: string,
    limit: number,
    userId: string,
    userKeysString: string,
    envKeys: string[]
  ): Promise<Content[]> {
    let allItems: any[] = [];
    let page = 1;
    let fetched = 0;
    const headers = this.buildHeaders(userId, userKeysString, envKeys);

    while (fetched < limit) {
      const perPage = Math.min(100, limit - fetched);
      const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(
        query
      )}&sort=best-match&per_page=${perPage}&page=${page}`;

      const res = await this.fetchWithRetry(url, headers, userId, userKeysString, envKeys);
      if (!res.ok) {
        throw new Error(`GitHub API returned status ${res.status}`);
      }
      const data: any = await res.json();
      const items = data.items || [];
      allItems.push(...items);
      fetched += items.length;

      if (items.length < perPage) break;
      page++;
    }

    return allItems.map((item: any): Content => {
      return {
        id: `github_${item.id}`,
        title: item.full_name,
        url: item.html_url,
        source: "github",
        type: "repo",
        thumbnail: item.owner?.avatar_url,
        description: item.description,
        author: item.owner?.login,
        viewCount: item.stargazers_count,
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
  }

  /**
   * Detect if query is for a GitHub user profile
   */
  private isGitHubUserQuery(query: string): boolean {
    return (
      /^@[a-zA-Z0-9\-]+$/.test(query) ||
      /github user|github profile|github repositories|github\s+[a-z0-9\-]+\s+profile/i.test(query) ||
      /^[a-zA-Z0-9\-]+\s+github\s+profile|^user:\s*[a-zA-Z0-9\-]+/i.test(query)
    );
  }

  /**
   * Extract username from query
   */
  private extractUsername(query: string): string {
    const atMatch = query.match(/^@([a-zA-Z0-9\-]+)/);
    if (atMatch) return atMatch[1];

    const userMatch = query.match(/user:\s*([a-zA-Z0-9\-]+)/i);
    if (userMatch) return userMatch[1];

    const profileMatch = query.match(/github\s+([a-z0-9\-]+)\s+profile/i);
    if (profileMatch) return profileMatch[1];

    // For "user github profile" format
    const words = query.split(/\s+/);
    if (words.length > 0 && !words[0].match(/github|user|profile/i)) {
      return words[0];
    }

    return query.replace(/[@\s]/g, "").substring(0, 20);
  }

  /**
   * Search for a GitHub user and their repositories, with rate-limit rotation
   */
  private async searchUser(
    query: string,
    headers: Record<string, string>,
    limit: number,
    userId: string,
    userKeysString: string,
    envKeys: string[]
  ): Promise<Content[]> {
    const username = this.extractUsername(query);
    const results: Content[] = [];

    try {
      // 1. Fetch user profile
      const userRes = await this.fetchWithRetry(
        `https://api.github.com/users/${encodeURIComponent(username)}`,
        headers,
        userId,
        userKeysString,
        envKeys
      );

      if (!userRes.ok) {
        console.warn(`GitHub user not found: ${username}`);
        return [];
      }

      const user: any = await userRes.json();

      // Add user profile as a result
      results.push({
        id: `github_user_${user.id}`,
        title: `${user.name || user.login} - GitHub Profile`,
        url: user.html_url,
        source: "github",
        type: "profile",
        thumbnail: user.avatar_url,
        description: user.bio || "GitHub user profile",
        author: user.login,
        viewCount: user.followers,
        tags: ["github", "profile", user.login],
        language: "en",
        metadata: {
          login: user.login,
          followers: user.followers,
          following: user.following,
          publicRepos: user.public_repos,
          location: user.location,
          company: user.company,
        },
        createdAt: new Date(user.created_at),
      });

      // 2. Fetch user's top repositories
      const reposRes = await this.fetchWithRetry(
        `https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=stars&per_page=${Math.min(limit - 1, 10)}&type=all`,
        headers,
        userId,
        userKeysString,
        envKeys
      );

      if (reposRes.ok) {
        const repos: any[] = await reposRes.json();
        const repoResults = repos.map((repo): Content => {
          return {
            id: `github_${repo.id}`,
            title: repo.name,
            url: repo.html_url,
            source: "github",
            type: "repo",
            thumbnail: user.avatar_url,
            description: repo.description,
            author: repo.owner?.login,
            viewCount: repo.stargazers_count,
            tags: ["github", "repo", repo.language].filter(Boolean),
            language: repo.language || "en",
            metadata: {
              forks: repo.forks_count,
              stars: repo.stargazers_count,
              openIssues: repo.open_issues_count,
              userProfile: username,
            },
            createdAt: new Date(repo.created_at),
          };
        });

        results.push(...repoResults);
      }

      return results.slice(0, limit);
    } catch (err: any) {
      console.error("GitHub user search error:", err.message);
      return [];
    }
  }
}
