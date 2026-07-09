// src/store/player.store.ts
import { create } from "zustand";
import { persist } from 'zustand/middleware';
import { Content } from "../types/content";
import { useSearchStore } from './search.store';

interface PlayerState {
  activeContent: Content | null;
  isMinimized: boolean;
  queue: Content[];
  /** Full viewing history — used for "Previously Watched" suggestions */
  history: Content[];
  /** Watch Later list — user-curated */
  watchLater: Content[];
  /** Timestamped watch history (pruned to last 2 months) */
  watchHistory: { content: Content; watchedAt: string; goalId?: string }[];
  /** Goal-oriented history (kept indefinitely) */
  goalHistory: { content: Content; watchedAt: string; goalId?: string }[];
  /**
   * Stable instance id for the currently-playing content.
   * Changes ONLY when a *different* piece of content starts playing.
   * Stays the same across minimize ↔ maximize, so the iframe is never remounted.
   */
  instanceId: string | null;

  play: (content: Content, queue?: Content[], opts?: { goalId?: string }) => void;
  recordWatch: (content: Content, opts?: { goalId?: string }) => void;
  minimize: () => void;
  maximize: () => void;
  closePlayer: () => void;
  next: () => void;
  previous: () => void;
  goBackVideo: () => void;
  addToWatchLater: (content: Content) => void;
  removeFromWatchLater: (contentId: string) => void;
  toggleWatchLater: (content: Content) => void;
  isInWatchLater: (contentId: string) => boolean;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      activeContent: null,
      isMinimized: false,
      queue: [],
      history: [],
      watchHistory: [],
      goalHistory: [],
      watchLater: [],
      instanceId: null,

      // Record play and track history. opts.goalId overrides current search goal.
      play: (content, queue, opts) =>
        set((state) => {
          const history = [...state.history];
          if (state.activeContent && state.activeContent.id !== content.id) {
            const idx = history.findIndex((h) => h.id === state.activeContent!.id);
            if (idx !== -1) history.splice(idx, 1);
            history.push(state.activeContent);
          }
          const newInstanceId =
            state.activeContent?.id === content.id
              ? state.instanceId
              : `player-${content.id}-${Date.now()}`;

          // Record watch entry (reads current goalId from search store if not provided)
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const searchState: any = useSearchStore.getState();
            const currentGoalId = (opts && opts.goalId) || searchState?.params?.goalId || null;
            // call recordWatch via set to access latest state
            const watchedAt = new Date().toISOString();
            const watchEntry = { content, watchedAt, goalId: currentGoalId || undefined };
            const twoMonthsAgo = Date.now() - 60 * 24 * 60 * 60 * 1000; // ~60 days
            const updatedWatchHistory = [...(state.watchHistory || []), watchEntry]
              .filter((e) => new Date(e.watchedAt).getTime() >= twoMonthsAgo);

            const updatedGoalHistory = [...(state.goalHistory || [])];
            if (currentGoalId) {
              updatedGoalHistory.push(watchEntry);
            }

            return {
              activeContent: content,
              isMinimized: false,
              queue: queue || state.queue,
              history,
              instanceId: newInstanceId,
              watchHistory: updatedWatchHistory,
              goalHistory: updatedGoalHistory,
            };
          } catch (error) {
            console.warn('record watch failed', error);
            return {
              activeContent: content,
              isMinimized: false,
              queue: queue || state.queue,
              history,
              instanceId: newInstanceId,
            };
          }
        }),

      // Also expose a direct recorder if other code wants to add without playing
      recordWatch: (content, opts) =>
        set((state) => {
          const watchedAt = new Date().toISOString();
          const searchState = useSearchStore.getState() as { params?: { goalId?: string } } | undefined;
          const currentGoalId = (opts && opts.goalId) || searchState?.params?.goalId || null;
          const watchEntry = { content, watchedAt, goalId: currentGoalId || undefined };
          const twoMonthsAgo = Date.now() - 60 * 24 * 60 * 60 * 1000;
          const updatedWatchHistory = [...(state.watchHistory || []), watchEntry]
            .filter((e) => new Date(e.watchedAt).getTime() >= twoMonthsAgo);
          const updatedGoalHistory = [...(state.goalHistory || [])];
          if (currentGoalId) updatedGoalHistory.push(watchEntry);
          return { watchHistory: updatedWatchHistory, goalHistory: updatedGoalHistory } as unknown as PlayerState;
        }),

  // Minimize & maximize do NOT touch instanceId — iframe stays alive
  minimize: () => set({ isMinimized: true }),
  maximize: () => set({ isMinimized: false }),

  closePlayer: () =>
    set({ activeContent: null, isMinimized: false, instanceId: null }),

  goBackVideo: () => {
    const { history } = get();
    if (history.length === 0) {
      set({ activeContent: null, isMinimized: false, instanceId: null });
    } else {
      const previousContent = history[history.length - 1];
      set({
        activeContent: previousContent,
        isMinimized: false,
        history: history.slice(0, -1),
        instanceId: `player-${previousContent.id}-${Date.now()}`,
      });
    }
  },

  next: () => {
    const { activeContent, queue } = get();
    if (!activeContent || queue.length === 0) return;
    const currentIndex = queue.findIndex((c) => c.id === activeContent.id);
    if (currentIndex !== -1 && currentIndex < queue.length - 1) {
      const nextContent = queue[currentIndex + 1];
      set((state) => {
        const history = [...state.history];
        if (state.activeContent) {
          const idx = history.findIndex(
            (h) => h.id === state.activeContent!.id
          );
          if (idx !== -1) history.splice(idx, 1);
          history.push(state.activeContent);
        }
        return {
          activeContent: nextContent,
          isMinimized: false,
          history,
          instanceId: `player-${nextContent.id}-${Date.now()}`,
        };
      });
    }
  },

  previous: () => {
    const { activeContent, queue } = get();
    if (!activeContent || queue.length === 0) return;
    const currentIndex = queue.findIndex((c) => c.id === activeContent.id);
    if (currentIndex > 0) {
      const prevContent = queue[currentIndex - 1];
      set((state) => {
        const history = [...state.history];
        if (state.activeContent) {
          const idx = history.findIndex(
            (h) => h.id === state.activeContent!.id
          );
          if (idx !== -1) history.splice(idx, 1);
          history.push(state.activeContent);
        }
        return {
          activeContent: prevContent,
          isMinimized: false,
          history,
          instanceId: `player-${prevContent.id}-${Date.now()}`,
        };
      });
    }
  },

  // ── Watch Later ──────────────────────────────────────────────────────
  addToWatchLater: (content) =>
    set((state) => {
      if (state.watchLater.some((c) => c.id === content.id)) return state;
      return { watchLater: [...state.watchLater, content] };
    }),

  removeFromWatchLater: (contentId) =>
    set((state) => ({
      watchLater: state.watchLater.filter((c) => c.id !== contentId),
    })),

  toggleWatchLater: (content) => {
    const { watchLater } = get();
    if (watchLater.some((c) => c.id === content.id)) {
      set({ watchLater: watchLater.filter((c) => c.id !== content.id) });
    } else {
      set({ watchLater: [...watchLater, content] });
    }
  },

  isInWatchLater: (contentId) => {
    return get().watchLater.some((c) => c.id === contentId);
  },
    }),
    {
      name: 'mytube-player-store',
      partialize: (state) => ({
        activeContent: state.activeContent,
        queue: state.queue,
        history: state.history,
        watchLater: state.watchLater,
        isMinimized: state.isMinimized,
        watchHistory: state.watchHistory,
        goalHistory: state.goalHistory,
      }),
    }
  )
);

export default usePlayerStore;
