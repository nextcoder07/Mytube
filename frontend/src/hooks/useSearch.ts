// frontend/src/hooks/useSearch.ts
import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Content } from '../types/content';

interface SearchParams {
  q: string;
  providers?: string;
  type?: string;
  page?: number;
  limit?: number;
}

export function useSearch() {
  const [params, setParams] = useState<SearchParams | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['search', params],
    queryFn: async () => {
      if (!params?.q) return { data: [] };
      const res = await api.get('/search', { params });
      return res.data;
    },
    enabled: !!params?.q,
  });

  const search = useCallback((newParams: SearchParams) => {
    setParams(newParams);
  }, []);

  const results: Content[] = data?.data ?? [];
  return { results, isLoading, error, search };
}
