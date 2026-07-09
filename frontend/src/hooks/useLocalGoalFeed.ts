import { useMemo } from 'react';
import { usePlayerStore } from '../store/player.store';
import type { Content } from '../types/content';

export function useLocalGoalFeed(): { items: Content[] } {
  const { goalHistory } = usePlayerStore();

  const items = useMemo(() => {
    if (!goalHistory || goalHistory.length === 0) return [];
    // Sort by watchedAt desc and deduplicate by content id
    const sorted = [...goalHistory].sort((a, b) => new Date(b.watchedAt).getTime() - new Date(a.watchedAt).getTime());
    const seen = new Set<string>();
    const unique: Content[] = [];
    for (const entry of sorted) {
      if (!entry?.content) continue;
      if (seen.has(entry.content.id)) continue;
      seen.add(entry.content.id);
      unique.push(entry.content);
    }
    return unique;
  }, [goalHistory]);

  return { items };
}
