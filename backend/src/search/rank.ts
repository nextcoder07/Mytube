// src/search/rank.ts — Score and sort content results
import { Content } from '../models/content.model';

interface RankOptions {
  query: string;
  userGoals?: string[];
}

function queryRelevance(content: Content, query: string): number {
  const q = query.toLowerCase();
  const title = content.title.toLowerCase();
  const desc = (content.description ?? '').toLowerCase();
  const tags = content.tags.join(' ').toLowerCase();

  let score = 0;
  if (title.includes(q)) score += 3;
  if (desc.includes(q)) score += 1;
  if (tags.includes(q)) score += 2;
  return score;
}

function freshnessScore(content: Content): number {
  const ageMs = Date.now() - new Date(content.createdAt).getTime();
  const ageDays = ageMs / (1000 * 60 * 60 * 24);
  return Math.max(0, 10 - Math.floor(ageDays / 30)); // decay monthly
}

function goalMatch(content: Content, goals: string[]): number {
  if (!goals.length) return 0;
  const text = `${content.title} ${content.description ?? ''} ${content.tags.join(' ')}`.toLowerCase();
  return goals.reduce((acc, g) => acc + (text.includes(g.toLowerCase()) ? 2 : 0), 0);
}

export function rankResults(results: Content[], options: RankOptions): Content[] {
  return results
    .map((item) => ({
      item,
      score:
        queryRelevance(item, options.query) +
        freshnessScore(item) +
        goalMatch(item, options.userGoals ?? []),
    }))
    .sort((a, b) => b.score - a.score)
    .map(({ item }) => item);
}
