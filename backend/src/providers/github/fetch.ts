// providers/github/fetch.ts — Fetch a single GitHub repo by owner/repo
import { Content } from '../../models/content.model';
import { normalizeRepo } from './normalize';

export async function fetchGitHubRepo(owner: string, repo: string): Promise<Content | null> {
  const token = process.env.GITHUB_TOKEN;
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'MyTube-Personalized-Learning',
  };
  if (token && !token.includes('your-') && token !== 'ghp_...') {
    headers['Authorization'] = `token ${token}`;
  }

  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
  if (!res.ok) return null;

  const data = await res.json();
  return normalizeRepo(data);
}
