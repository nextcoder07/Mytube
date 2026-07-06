// frontend/src/hooks/useSearch.ts
import { useState, useCallback, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Content } from '../types/content';

const BATCH_SIZE = 100; // fetch up to 100 items per batch for relevance‑first loading


interface SearchParams {
  q: string;
  providers?: string;
  type?: string;
  page?: number;
  limit?: number;
}

export function useSearch() {
  const [params, setParams] = useState<SearchParams | null>(null);
  const [queryHistory, setQueryHistory] = useState<SearchParams[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const prevResultCountRef = useRef(0);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const queryOptions: any = {
    queryKey: ['search', params],
    queryFn: async () => {
      if (!params?.q) return { data: [] };
      const res = await api.get('/search', { params });
      return res.data;
    },
    enabled: !!params?.q,
    staleTime: 15 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    placeholderData: { data: [] },
    keepPreviousData: true,
  };

  const { data, isLoading, isFetching, error } = useQuery(queryOptions);


  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const results: Content[] = (data as any)?.data ?? [];

  // After each fetch, check if we got fewer results than the limit (meaning no more to load)
  if (results.length > 0 && results.length !== prevResultCountRef.current) {
    prevResultCountRef.current = results.length;
    const currentLimit = params?.limit || BATCH_SIZE;
    if (results.length < currentLimit) {
      if (hasMore) setHasMore(false);
    } else {
      if (!hasMore) setHasMore(true);
    }
  }

  const search = useCallback((newParams: SearchParams) => {
    prevResultCountRef.current = 0;
    setHasMore(true);
    setParams((prevParams) => {
      if (prevParams && prevParams.q && prevParams.q !== newParams.q) {
        setQueryHistory((prevHistory) => [...prevHistory, prevParams]);
      }
      return { ...newParams, limit: BATCH_SIZE };
    });
  }, []);

  const loadMore = useCallback(() => {
    if (!params || !hasMore || isFetching) return;
    const currentLimit = params.limit || BATCH_SIZE;
    setParams({ ...params, limit: currentLimit + BATCH_SIZE });
  }, [params, hasMore, isFetching]);

  const loadPrevious = useCallback(() => {
    if (!params || isFetching) return;
    const currentLimit = params.limit || BATCH_SIZE;
    if (currentLimit > BATCH_SIZE) {
      setParams({ ...params, limit: currentLimit - BATCH_SIZE });
      setHasMore(true); // Since we stepped back, we definitely have more to load ahead
    }
  }, [params, isFetching]);

  const goBackQuery = useCallback(() => {
    if (queryHistory.length === 0) return;
    const previous = queryHistory[queryHistory.length - 1];
    setQueryHistory((prevHistory) => prevHistory.slice(0, -1));
    prevResultCountRef.current = 0;
    setHasMore(true);
    setParams(previous);
  }, [queryHistory]);

  return { 
    results, 
    isLoading, 
    isFetching, 
    error, 
    search, 
    loadMore, 
    loadPrevious, 
    goBackQuery, 
    hasMore, 
    hasHistory: queryHistory.length > 0,
    currentQuery: params?.q || '',
    limit: params?.limit || BATCH_SIZE 
  };
}
