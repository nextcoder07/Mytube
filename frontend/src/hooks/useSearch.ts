// frontend/src/hooks/useSearch.ts
import { useCallback, useRef, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Content } from '../types/content';
import { useSearchStore, SearchParams } from '../store/search.store';

const BATCH_SIZE = 70; // load 70 results per page

export function useSearch() {
  const { params, setParams, queryHistory, setQueryHistory, hasMore, setHasMore } = useSearchStore();
  const prevResultCountRef = useRef(0);

  // Accumulated results across all load-more pages (keyed by URL to deduplicate)
  const [accumulatedResults, setAccumulatedResults] = useState<Content[]>([]);
  // Track which query the accumulated results belong to so we can reset on new search
  const accumulatedQueryRef = useRef<string>('');

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
      // Remove undefined/empty values
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
  const freshResults: Content[] = (data as any)?.data ?? [];

  // Accumulate results: when a new batch arrives, merge into accumulated (dedup by URL)
  useEffect(() => {
    if (!params?.q) return;
    if (freshResults.length === 0) return;

    const currentQuery = params.q;

    // If the query changed, reset accumulation
    if (accumulatedQueryRef.current !== currentQuery) {
      accumulatedQueryRef.current = currentQuery;
      setAccumulatedResults(freshResults);
      return;
    }

    // Same query — append only truly new items (dedup by URL)
    setAccumulatedResults((prev) => {
      const existingUrls = new Set(prev.map((r) => r.url));
      const newItems = freshResults.filter((r) => !existingUrls.has(r.url));
      if (newItems.length === 0) return prev; // nothing new
      return [...prev, ...newItems];
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [freshResults]);

  // After each fetch, check if we have more (backend returned exactly limit items → likely more)
  useEffect(() => {
    if (freshResults.length > 0 && freshResults.length !== prevResultCountRef.current) {
      prevResultCountRef.current = freshResults.length;
      const currentLimit = params?.limit || BATCH_SIZE;
      if (freshResults.length < currentLimit) {
        if (hasMore) setHasMore(false);
      } else {
        if (!hasMore) setHasMore(true);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [freshResults]);

  const search = useCallback((newParams: SearchParams) => {
    prevResultCountRef.current = 0;
    setHasMore(true);
    // Reset accumulation immediately for new query
    accumulatedQueryRef.current = newParams.q || '';
    setAccumulatedResults([]);
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
    // Increase limit — backend returns top N of ALL results
    // New items will be appended by the useEffect accumulator above
    setParams({ ...params, limit: currentLimit + BATCH_SIZE });
  }, [params, hasMore, isFetching, setParams]);

  const loadPrevious = useCallback(() => {
    if (!params || isFetching) return;
    const currentLimit = params.limit || BATCH_SIZE;
    if (currentLimit > BATCH_SIZE) {
      setParams({ ...params, limit: currentLimit - BATCH_SIZE });
      setHasMore(true);
    }
  }, [params, isFetching, setHasMore, setParams]);

  const goBackQuery = useCallback(() => {
    if (queryHistory.length === 0) return;
    const previous = queryHistory[queryHistory.length - 1];
    setQueryHistory((prevHistory) => prevHistory.slice(0, -1));
    prevResultCountRef.current = 0;
    setHasMore(true);
    // Reset accumulation for the previous query
    accumulatedQueryRef.current = previous.q || '';
    setAccumulatedResults([]);
    setParams(previous);
  }, [queryHistory, setHasMore, setParams, setQueryHistory]);

  // Reset the search to initial empty state
  const resetSearch = useCallback(() => {
    setQueryHistory([]);
    prevResultCountRef.current = 0;
    setHasMore(false);
    accumulatedQueryRef.current = '';
    setAccumulatedResults([]);
    setParams({ q: '', limit: BATCH_SIZE });
  }, [setQueryHistory, setHasMore, setParams]);

  return {
    results: accumulatedResults,   // Always the full accumulated list
    freshResults,                   // Only the latest batch (for internal use)
    isLoading,
    isFetching,
    error,
    search,
    loadMore,
    loadPrevious,
    goBackQuery,
    resetSearch,
    hasMore,
    hasHistory: queryHistory.length > 0,
    currentQuery: params?.q || '',
    limit: params?.limit || BATCH_SIZE
  };
}
