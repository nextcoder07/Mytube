// frontend/src/hooks/useFeed.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Content } from '../types/content';

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

  const items: Content[] = data?.data ?? [];
  return { items, isLoading, error, refetch };
}
