import { create } from 'zustand';
import type { SearchFiltersState } from '../types/content';

export interface SearchParams {
  q: string;
  providers?: string;
  type?: string;
  page?: number;
  limit?: number;
  order?: string;
  videoDuration?: string;
  videoCategoryId?: string;
  relevanceLanguage?: string;
  aiMode?: boolean;
  aiContext?: string;
  goalId?: string;
}

interface SearchState {
  params: SearchParams | null;
  queryHistory: SearchParams[];
  hasMore: boolean;
  inputValue: string;
  query: string;
  aiMode: boolean;
  aiContext: string;
  selectedProviders: string[];
  filters: SearchFiltersState;
  setParams: (params: SearchParams | null | ((prev: SearchParams | null) => SearchParams | null)) => void;
  setQueryHistory: (history: SearchParams[] | ((prev: SearchParams[]) => SearchParams[])) => void;
  setHasMore: (hasMore: boolean) => void;
  setInputValue: (value: string) => void;
  setQuery: (value: string) => void;
  setAiMode: (enabled: boolean) => void;
  setAiContext: (value: string) => void;
  setSelectedProviders: (providers: string[]) => void;
  setFilters: (filters: SearchFiltersState) => void;
}

export const useSearchStore = create<SearchState>()((set) => ({
  params: null,
  queryHistory: [],
  hasMore: true,
  inputValue: '',
  query: '',
  aiMode: false,
  aiContext: '',
  selectedProviders: ['youtube'],
  filters: {
    order: 'relevance',
    videoDuration: 'any',
    videoCategoryId: '',
    relevanceLanguage: 'en',
  },
  setParams: (newParams) => set((state) => ({
    params: typeof newParams === 'function' ? newParams(state.params) : newParams
  })),
  setQueryHistory: (newHistory) => set((state) => ({
    queryHistory: typeof newHistory === 'function' ? newHistory(state.queryHistory) : newHistory
  })),
  setHasMore: (hasMore) => set({ hasMore }),
  setInputValue: (value) => set({ inputValue: value }),
  setQuery: (value) => set({ query: value }),
  setAiMode: (enabled) => set({ aiMode: enabled }),
  setAiContext: (value) => set({ aiContext: value }),
  setSelectedProviders: (providers) => set({ selectedProviders: providers }),
  setFilters: (filters) => set({ filters }),
}));
