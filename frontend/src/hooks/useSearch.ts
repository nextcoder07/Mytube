// frontend/src/hooks/useSearch.ts
import { useState, useCallback, useRef } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Content } from '../types/content';

const BATCH_SIZE = 70; // fetch at least 70 items per source initially (minimum extendable size)
const LOAD_MORE_STEP = 70; // subsequent batches fetch another 70 results to maintain consistency


interface SearchParams {
  q: string;
  providers?: string;
  type?: string;
  page?: number;
  limit?: number;
  // YouTube-optimized filters
  order?: string;
  videoDuration?: string;
  videoCategoryId?: string;
  relevanceLanguage?: string;
  // AI search mode
  aiMode?: boolean;
  aiContext?: string;
  goalId?: string;
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
          goalId: params.goalId,
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
        goalId: params.goalId,
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
    placeholderData: keepPreviousData,
  };

  const { data, isLoading, isFetching, error } = useQuery(queryOptions);

  const responseMeta = (data as any)?.meta ?? null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const results: Content[] = (data as any)?.data ?? [];

  const clearCacheForQuery = useCallback(async (q: string) => {
    try {
      await api.delete('/search/cache', { params: { q } });
    } catch (err) {
      console.warn('[useSearch] Failed to clear cache for query', q, err);
    }
  }, []);

  const trimCacheForQuery = useCallback(async (q: string, limit: number) => {
    try {
      await api.delete('/search/cache', { params: { q, limit } });
    } catch (err) {
      console.warn('[useSearch] Failed to trim cache for query', q, 'to', limit, err);
    }
  }, []);

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
    setParams({ ...params, limit: currentLimit + LOAD_MORE_STEP });
  }, [params, hasMore, isFetching]);

  const loadPrevious = useCallback(() => {
    if (!params || isFetching) return;
    const currentLimit = params.limit || BATCH_SIZE;
    if (currentLimit > BATCH_SIZE) {
      const newLimit = currentLimit - LOAD_MORE_STEP;
      setParams({ ...params, limit: newLimit });
      setHasMore(true); // Since we stepped back, we definitely have more to load ahead
      if (params.q) {
        trimCacheForQuery(params.q, newLimit);
      }
    }
  }, [params, isFetching, trimCacheForQuery]);

  const goBackQuery = useCallback(() => {
    if (queryHistory.length === 0) return;
    const previous = queryHistory[queryHistory.length - 1];
    setQueryHistory((prevHistory) => prevHistory.slice(0, -1));
    prevResultCountRef.current = 0;
    setHasMore(true);
    setParams(previous);
  }, [queryHistory]);

  const resetSearch = useCallback(() => {
    prevResultCountRef.current = 0;
    setHasMore(true);
    if (params?.q) {
      clearCacheForQuery(params.q);
    }
    setParams(null);
    setQueryHistory([]);
  }, [params?.q, clearCacheForQuery]);

  return { 
    results, 
    isLoading, 
    isFetching, 
    error, 
    responseMeta, 
    search, 
    loadMore, 
    loadPrevious, 
    goBackQuery, 
    resetSearch,
    hasMore, 
    hasHistory: queryHistory.length > 0,
    currentQuery: params?.q || '',
    currentGoalId: params?.goalId || '',
    limit: params?.limit || BATCH_SIZE 
  };
}
