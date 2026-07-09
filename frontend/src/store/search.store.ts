import { create } from 'zustand';

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
}

interface SearchState {
  params: SearchParams | null;
  queryHistory: SearchParams[];
  hasMore: boolean;
  setParams: (params: SearchParams | null | ((prev: SearchParams | null) => SearchParams | null)) => void;
  setQueryHistory: (history: SearchParams[] | ((prev: SearchParams[]) => SearchParams[])) => void;
  setHasMore: (hasMore: boolean) => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  params: null,
  queryHistory: [],
  hasMore: true,
  setParams: (newParams) => set((state) => ({
    params: typeof newParams === 'function' ? newParams(state.params) : newParams
  })),
  setQueryHistory: (newHistory) => set((state) => ({
    queryHistory: typeof newHistory === 'function' ? newHistory(state.queryHistory) : newHistory
  })),
  setHasMore: (hasMore) => set({ hasMore }),
}));
