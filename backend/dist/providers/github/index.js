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
            const totalToFetch = options?.limit || 100;
            let allItems = [];
            let page = 1;
            let fetched = 0;
            // Build query: optionally scope to a language from relevanceLanguage
            // (GitHub uses language filter for code language, not spoken language, 
            //  so only apply for major programming languages)
            let ghQuery = query;
            const progLangs = {
                en: '', es: '', hi: '', fr: '', de: '', ja: 'language:Java',
                ko: '', pt: '', zh: '', ar: '',
            };
            // Sort by stars for higher quality repos, unless date order is requested
            const ghSort = options?.order === 'date' ? 'updated' : 'stars';
            while (fetched < totalToFetch) {
                const perPage = Math.min(100, totalToFetch - fetched); // GitHub max is 100
                const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(ghQuery)}&sort=${ghSort}&order=desc&per_page=${perPage}&page=${page}`;
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
}
exports.GitHubProvider = GitHubProvider;
//# sourceMappingURL=index.js.map