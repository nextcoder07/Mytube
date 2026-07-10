// frontend/src/hooks/useFeed.ts
import { useInfiniteQuery } from '@tanstack/react-query';
import type { InfiniteData } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Content } from '../types/content';

interface FeedResponsePayload {
  content?: Content[];
  page?: number;
  hasMore?: boolean;
}

export function useFeed(
  recommended = false,
  providerIds: string[] = [],
  excludeIds: string[] = [],
  limit = 12,
  goalId?: string,
  refreshKey = 0
) {
  const endpoint = recommended ? '/feed/recommended' : '/feed';
  const providerKey = providerIds.slice().sort().join(',');
  const excludedKey = excludeIds.slice().sort().join(',');

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery<FeedResponsePayload, Error, InfiniteData<FeedResponsePayload>, readonly unknown[], number>({
    queryKey: ['feed', endpoint, providerKey, excludedKey, limit, goalId ?? 'all', refreshKey],
    queryFn: async (context) => {
      const pageParam = (context.pageParam ?? 1) as number;
      const params: Record<string, string | number | boolean> = { page: pageParam, limit };
      if (!recommended && providerIds.length > 0) {
        params.providers = providerIds.join(',');
      }
      if (goalId) {
        params.goalId = goalId;
      }
      if (excludeIds.length > 0) {
        params.excludeIds = excludeIds.join(',');
      }
      if (refreshKey > 0) {
        params.clearCache = true;
      }

      const res = await api.get(endpoint, { params });
      return res.data?.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (Array.isArray(lastPage)) return undefined;
      return lastPage.hasMore ? (lastPage.page || 1) + 1 : undefined;
    },
    staleTime: 1000 * 60 * 10, // 10 min
  });

  const items = data?.pages.flatMap((page) => {
    if (Array.isArray(page)) return page as Content[];
    return page?.content || [];
  }) || [];

  return {
    items,
    isLoading,
    error,
    refetch,
    loadMore: fetchNextPage,
    hasMore: !!hasNextPage,
    isFetchingNextPage,
  };
}
