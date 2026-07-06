"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeRepo = normalizeRepo;
function normalizeRepo(item) {
    return {
        id: `github_${item.id}`,
        title: item.full_name,
        url: item.html_url,
        source: 'github',
        type: 'repo',
        thumbnail: item.owner?.avatar_url,
        description: item.description ?? '',
        author: item.owner?.login,
        tags: [item.language, 'github'].filter(Boolean),
        language: item.language ?? 'en',
        metadata: {
            stars: item.stargazers_count,
            forks: item.forks_count,
            openIssues: item.open_issues_count,
        },
        createdAt: new Date(item.created_at),
    };
}
//# sourceMappingURL=normalize.js.map