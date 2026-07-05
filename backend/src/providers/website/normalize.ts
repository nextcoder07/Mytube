// providers/website/normalize.ts — Extract Open Graph metadata from arbitrary webpage
import { Content } from '../../models/content.model';
import { v4 as uuidv4 } from 'uuid';

function extractMeta(html: string, property: string): string {
  const match = html.match(new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i'))
    ?? html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`, 'i'));
  return match?.[1] ?? '';
}

function extractTitle(html: string): string {
  const og = extractMeta(html, 'og:title');
  if (og) return og;
  const match = html.match(/<title>([^<]+)<\/title>/i);
  return match?.[1] ?? 'Untitled';
}

export function normalizePage(html: string, url: string): Content {
  return {
    id: `website_${uuidv4()}`,
    title: extractTitle(html),
    url,
    source: 'website',
    type: 'article',
    thumbnail: extractMeta(html, 'og:image') || undefined,
    description: extractMeta(html, 'og:description'),
    author: extractMeta(html, 'article:author') || undefined,
    tags: ['website'],
    language: 'en',
    metadata: {},
    createdAt: new Date(),
  };
}
