"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitHubProvider = void 0;
class GitHubProvider {
    name = "github";
    async search(query, options) {
        const token = process.env.GITHUB_TOKEN;
        const headers = {
            Accept: "application/vnd.github.v3+json",
            "User-Agent": "MyTube-Personalized-Learning",
        };
        if (token && token !== "ghp_..." && !token.includes("your-")) {
            headers["Authorization"] = `token ${token}`;
        }
        try {
            // Detect if searching for a GitHub user
            const isUserSearch = this.isGitHubUserQuery(query);
            if (isUserSearch) {
                return await this.searchUser(query, headers, Math.max(options?.limit || 70, 70));
            }
            // Otherwise, search for repositories
            const totalToFetch = Math.max(options?.limit || 70, 70);
            let allItems = [];
            let page = 1;
            let fetched = 0;
            while (fetched < totalToFetch) {
                const perPage = Math.min(100, totalToFetch - fetched); // GitHub max is 100
                const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=best-match&per_page=${perPage}&page=${page}`;
                const res = await fetch(url, { headers });
                if (!res.ok) {
                    throw new Error(`GitHub API returned status ${res.status}`);
                }
                const data = await res.json();
                const items = data.items || [];
                allItems.push(...items);
                fetched += items.length;
                // If we got fewer than requested, there are no more pages
                if (items.length < perPage)
                    break;
                page++;
            }
            return allItems.map((item) => {
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
        catch (err) {
            console.error("GitHub search error:", err.message);
            return [];
        }
    }
    /**
     * Detect if query is for a GitHub user profile
     */
    isGitHubUserQuery(query) {
        return (/^@[a-zA-Z0-9\-]+$/.test(query) ||
            /github user|github profile|github repositories|github\s+[a-z0-9\-]+\s+profile/i.test(query) ||
            /^[a-zA-Z0-9\-]+\s+github\s+profile|^user:\s*[a-zA-Z0-9\-]+/i.test(query));
    }
    /**
     * Extract username from query
     */
    extractUsername(query) {
        const atMatch = query.match(/^@([a-zA-Z0-9\-]+)/);
        if (atMatch)
            return atMatch[1];
        const userMatch = query.match(/user:\s*([a-zA-Z0-9\-]+)/i);
        if (userMatch)
            return userMatch[1];
        const profileMatch = query.match(/github\s+([a-z0-9\-]+)\s+profile/i);
        if (profileMatch)
            return profileMatch[1];
        // For "user github profile" format
        const words = query.split(/\s+/);
        if (words.length > 0 && !words[0].match(/github|user|profile/i)) {
            return words[0];
        }
        return query.replace(/[@\s]/g, "").substring(0, 20);
    }
    /**
     * Search for a GitHub user and their repositories
     */
    async searchUser(query, headers, limit) {
        const username = this.extractUsername(query);
        const results = [];
        try {
            // 1. Fetch user profile
            const userRes = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, {
                headers,
            });
            if (!userRes.ok) {
                console.warn(`GitHub user not found: ${username}`);
                return [];
            }
            const user = await userRes.json();
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
            const reposRes = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=stars&per_page=${Math.min(limit - 1, 10)}&type=all`, { headers });
            if (reposRes.ok) {
                const repos = await reposRes.json();
                const repoResults = repos.map((repo) => {
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
        }
        catch (err) {
            console.error("GitHub user search error:", err.message);
            return [];
        }
    }
}
exports.GitHubProvider = GitHubProvider;
//# sourceMappingURL=index.js.map