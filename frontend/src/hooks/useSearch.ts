// frontend/src/hooks/useSearch.ts
import { useCallback, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Content } from '../types/content';
import { useSearchStore, SearchParams } from '../store/search.store';

const BATCH_SIZE = 100; // fetch up to 100 items per batch for relevance‑first loading

export function useSearch() {
  const { params, setParams, queryHistory, setQueryHistory, hasMore, setHasMore } = useSearchStore();
  const prevResultCountRef = useRef(0);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const queryOptions: any = {
    queryKey: ['search', params],
    queryFn: async () => {
      if (!params?.q) return { data: [] };

      // When AI mode is active, use POST /search/ai with body params
      if (params.aiMode) {
        const res = await api.post('/search/ai', {
          query: params.q,
          providers: params.providers ? params.providers.split(',') : undefined,
          aiContext: params.aiContext || undefined,
          order: params.order,
          videoDuration: params.videoDuration,
          videoCategoryId: params.videoCategoryId,
          relevanceLanguage: params.relevanceLanguage,
        }, {
          params: { limit: params.limit },
        });
        return res.data;
      }

      // Standard search with filter query params
      const queryParams: Record<string, string | number | undefined> = {
        q: params.q,
        providers: params.providers,
        limit: params.limit,
        order: params.order,
        videoDuration: params.videoDuration,
        videoCategoryId: params.videoCategoryId || undefined,
        relevanceLanguage: params.relevanceLanguage,
      };
      // Remove undefined values
      Object.keys(queryParams).forEach((key) => {
        if (queryParams[key] === undefined || queryParams[key] === '') {
          delete queryParams[key];
        }
      });

      const res = await api.get('/search', { params: queryParams });
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
  }, [setHasMore, setParams, setQueryHistory]);

  const loadMore = useCallback(() => {
    if (!params || !hasMore || isFetching) return;
    const currentLimit = params.limit || BATCH_SIZE;
    setParams({ ...params, limit: currentLimit + BATCH_SIZE });
  }, [params, hasMore, isFetching, setParams]);

  const loadPrevious = useCallback(() => {
    if (!params || isFetching) return;
    const currentLimit = params.limit || BATCH_SIZE;
    if (currentLimit > BATCH_SIZE) {
      setParams({ ...params, limit: currentLimit - BATCH_SIZE });
      setHasMore(true); // Since we stepped back, we definitely have more to load ahead
    }
  }, [params, isFetching, setHasMore, setParams]);

  const goBackQuery = useCallback(() => {
    if (queryHistory.length === 0) return;
    const previous = queryHistory[queryHistory.length - 1];
    setQueryHistory((prevHistory) => prevHistory.slice(0, -1));
    prevResultCountRef.current = 0;
    setHasMore(true);
    setParams(previous);
  }, [queryHistory, setHasMore, setParams, setQueryHistory]);

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
