// providers/github/normalize.ts — Normalize raw GitHub API repo → Content
import { Content } from '../../models/content.model';

export function normalizeRepo(item: any): Content {
  return {
    id: `github_${item.id}`,
    title: item.full_name,
    url: item.html_url,
    source: 'github',
    type: 'repo',
    thumbnail: item.owner?.avatar_url,
    description: item.description ?? '',
    author: item.owner?.login,
    tags: [item.language, 'github'].filter(Boolean) as string[],
    language: item.language ?? 'en',
    metadata: {
      stars: item.stargazers_count,
      forks: item.forks_count,
      openIssues: item.open_issues_count,
    },
    createdAt: new Date(item.created_at),
  };
}
