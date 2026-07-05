// providers/medium/normalize.ts — Extract Open Graph metadata from Medium HTML → Content
import { Content } from '../../models/content.model';
import { v4 as uuidv4 } from 'uuid';

function extractMeta(html: string, property: string): string {
  const match = html.match(new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i'))
    ?? html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`, 'i'));
  return match?.[1] ?? '';
}

export function normalizeArticle(html: string, url: string): Content {
  const title       = extractMeta(html, 'og:title') || 'Untitled Article';
  const description = extractMeta(html, 'og:description');
  const thumbnail   = extractMeta(html, 'og:image');
  const author      = extractMeta(html, 'article:author');

  return {
    id: `medium_${uuidv4()}`,
    title,
    url,
    source: 'medium',
    type: 'article',
    thumbnail: thumbnail || undefined,
    description,
    author: author || undefined,
    tags: ['medium', 'article'],
    language: 'en',
    metadata: {},
    createdAt: new Date(),
  };
}
