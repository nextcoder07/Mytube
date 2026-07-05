// providers/medium/fetch.ts — Fetch Medium article metadata via Open Graph
import { Content } from '../../models/content.model';
import { normalizeArticle } from './normalize';

export async function fetchMediumArticle(url: string): Promise<Content | null> {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'MyTube-Personalized-Learning/1.0' } });
    if (!res.ok) return null;
    const html = await res.text();
    return normalizeArticle(html, url);
  } catch {
    return null;
  }
}
