// src/search/merge.ts — Deduplicate search results by URL
import { Content } from '../models/content.model';

export function mergeResults(resultSets: Content[][]): Content[] {
  const seen = new Set<string>();
  const merged: Content[] = [];

  for (const results of resultSets) {
    for (const item of results) {
      if (!seen.has(item.url)) {
        seen.add(item.url);
        merged.push(item);
      }
    }
  }

  return merged;
}
