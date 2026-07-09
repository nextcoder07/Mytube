// frontend/src/hooks/useSearch.ts
import { useState, useCallback, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Content } from '../types/content';

const BATCH_SIZE = 70; // visible page size
const INITIAL_YT = 100; // initial YouTube seed size
const LOAD_MORE_STEP = 70; // normal subsequent batch size
const FALLBACK_LOAD_MORE_STEP = 50; // reduced batch when token/quota constraints

export type SearchResponseMeta = {
  youtubeStatus?: {
    limitReached: boolean;
    message?: string;
  };
};

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error: unknown;
  meta?: SearchResponseMeta | null;
}

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

  const queryOptions = {
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
    cacheTime: 60 * 60 * 1000,
    keepPreviousData: true,
  };

  const { data, isLoading, isFetching, error } = useQuery(queryOptions);

  const responseMeta = (data as ApiResponse<Content[]>)?.meta ?? null;
  const results: Content[] = (data as ApiResponse<Content[]>)?.data ?? [];

  // Removed: clearing the full search cache on mount was previously performed here.

  // Keep "Load more" available by default. Only stop when zero results are returned.
  if (results.length >= 0 && results.length !== prevResultCountRef.current) {
    prevResultCountRef.current = results.length;
    if (results.length === 0) {
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
      // If this is a YouTube-only search, seed with 100 results first
      const providers = newParams.providers || '';
      const isYouTubeOnly = providers && providers.split(',').map(p => p.trim().toLowerCase()).length === 1 && providers.toLowerCase().includes('youtube');
      const initialLimit = isYouTubeOnly ? INITIAL_YT : BATCH_SIZE;
      return { ...newParams, limit: initialLimit };
    });
  }, []);

  const loadMore = useCallback(() => {
    if (!params || isFetching) return;
    const providers = params.providers || '';
    const isYouTubeOnly = providers && providers.split(',').map(p => p.trim().toLowerCase()).length === 1 && providers.toLowerCase().includes('youtube');
    const currentLimit = params.limit || BATCH_SIZE;
    // If YouTube keys are exhausted (quota), reduce next batch size to save tokens
    const step = (isYouTubeOnly && (responseMeta?.youtubeStatus?.limitReached)) ? FALLBACK_LOAD_MORE_STEP : LOAD_MORE_STEP;
    setParams({ ...params, limit: currentLimit + step });
  }, [params, isFetching, responseMeta]);

  const loadPrevious = useCallback(() => {
    if (!params || isFetching) return;
    const currentLimit = params.limit || BATCH_SIZE;
    if (currentLimit > BATCH_SIZE) {
      const newLimit = currentLimit - LOAD_MORE_STEP;
      if (params.q) {
        api.delete('/search/cache', { params: { q: params.q, limit: newLimit } }).catch((err) => {
          console.warn('[useSearch] Failed to trim cache for query', params.q, 'to', newLimit, err);
        });
      }
      setParams({ ...params, limit: newLimit });
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

  const resetSearch = useCallback(() => {
    prevResultCountRef.current = 0;
    setHasMore(true);
    if (params?.q) {
      api.delete('/search/cache', { params: { q: params.q } }).catch((err) => {
        console.warn('[useSearch] Failed to clear cache for query', params.q, err);
      });
    }
    setParams(null);
    setQueryHistory([]);
  }, [params?.q]);

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
