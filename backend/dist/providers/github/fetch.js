"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchGitHubRepo = fetchGitHubRepo;
const normalize_1 = require("./normalize");
async function fetchGitHubRepo(owner, repo) {
    const token = process.env.MYTUBE_GITHUB_TOKEN || process.env.GITHUB_TOKEN;
    const headers = {
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'MyTube-Personalized-Learning',
    };
    if (token && !token.includes('your-') && token !== 'ghp_...') {
        headers['Authorization'] = `token ${token}`;
    }
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
    if (!res.ok)
        return null;
    const data = await res.json();
    return (0, normalize_1.normalizeRepo)(data);
}
//# sourceMappingURL=fetch.js.map