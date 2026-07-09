// src/store/player.store.ts
import { create } from "zustand";
import { Content } from "../types/content";

interface PlayerState {
  activeContent: Content | null;
  isMinimized: boolean;
  queue: Content[];
  /** Full viewing history — used for "Previously Watched" suggestions */
  history: Content[];
  /** Watch Later list — user-curated */
  watchLater: Content[];
  /**
   * Stable instance id for the currently-playing content.
   * Changes ONLY when a *different* piece of content starts playing.
   * Stays the same across minimize ↔ maximize, so the iframe is never remounted.
   */
  instanceId: string | null;

  play: (content: Content, queue?: Content[]) => void;
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

export const usePlayerStore = create<PlayerState>((set, get) => ({
  activeContent: null,
  isMinimized: false,
  queue: [],
  history: [],
  watchLater: [],
  instanceId: null,

  play: (content, queue) =>
    set((state) => {
      const history = [...state.history];
      // Push current item into history (deduplicated)
      if (state.activeContent && state.activeContent.id !== content.id) {
        // Remove if already in history to avoid duplicates, then push
        const idx = history.findIndex((h) => h.id === state.activeContent!.id);
        if (idx !== -1) history.splice(idx, 1);
        history.push(state.activeContent);
      }
      // Only change instanceId if actually switching content
      const newInstanceId =
        state.activeContent?.id === content.id
          ? state.instanceId
          : `player-${content.id}-${Date.now()}`;
      return {
        activeContent: content,
        isMinimized: false,
        queue: queue || state.queue,
        history,
        instanceId: newInstanceId,
      };
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
}));

export default usePlayerStore;
