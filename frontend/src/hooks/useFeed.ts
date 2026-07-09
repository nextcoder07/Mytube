// frontend/src/hooks/useFeed.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Content } from '../types/content';

interface FeedResponsePayload {
  content?: Content[];
  page?: number;
  hasMore?: boolean;
}

type RawFeedItem = Content | { content: Content };

function isRecommendationItem(item: unknown): item is { content: Content } {
  return (
    typeof item === 'object' &&
    item !== null &&
    'content' in item &&
    typeof (item as any).content === 'object' &&
    (item as any).content !== null
  );
}

export function useFeed(recommended = false) {
  const endpoint = recommended ? '/feed/recommended' : '/feed';

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['feed', endpoint],
    queryFn: async () => {
      const res = await api.get(endpoint);
      return res.data;
    },
    staleTime: 1000 * 60 * 10, // 10 min
  });

  let items: Content[] = [];
  const payload = data?.data as unknown;

  if (Array.isArray(payload)) {
    items = payload.map((item) =>
      isRecommendationItem(item) ? item.content : (item as Content)
    );
  } else if (typeof payload === 'object' && payload !== null && 'content' in payload) {
    items = (payload as FeedResponsePayload).content || [];
  }

  return { items, isLoading, error, refetch };
}
