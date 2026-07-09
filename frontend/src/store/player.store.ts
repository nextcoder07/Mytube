// src/store/player.store.ts
import { create } from "zustand";
import { Content } from "../types/content";

interface PlayerState {
  activeContent: Content | null;
  isMinimized: boolean;
  queue: Content[];
  history: Content[];
  play: (content: Content, queue?: Content[]) => void;
  minimize: () => void;
  maximize: () => void;
  closePlayer: () => void;
  next: () => void;
  previous: () => void;
  goBackVideo: () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  activeContent: null,
  isMinimized: false,
  queue: [],
  history: [],

  play: (content, queue) =>
    set((state) => {
      const history = [...state.history];
      // Only push if there's active content and it's not the same video
      if (state.activeContent && state.activeContent.id !== content.id) {
        history.push(state.activeContent);
      }
      return {
        activeContent: content,
        isMinimized: false,
        queue: queue || state.queue,
        history,
      };
    }),

  minimize: () => set({ isMinimized: true }),

  maximize: () => set({ isMinimized: false }),

  closePlayer: () => set({ activeContent: null, isMinimized: false, history: [] }),

  goBackVideo: () => {
    const { history } = get();
    if (history.length === 0) {
      set({ activeContent: null, isMinimized: false });
    } else {
      const previousContent = history[history.length - 1];
      set({
        activeContent: previousContent,
        isMinimized: false,
        history: history.slice(0, -1),
      });
    }
  },

  next: () => {
    const { activeContent, queue } = get();
    if (!activeContent || queue.length === 0) return;
    
    const currentIndex = queue.findIndex((c) => c.id === activeContent.id);
    if (currentIndex !== -1 && currentIndex < queue.length - 1) {
      set((state) => {
        const history = [...state.history];
        if (state.activeContent) {
          history.push(state.activeContent);
        }
        return {
          activeContent: queue[currentIndex + 1],
          isMinimized: false,
          history,
        };
      });
    }
  },

  previous: () => {
    const { activeContent, queue } = get();
    if (!activeContent || queue.length === 0) return;

    const currentIndex = queue.findIndex((c) => c.id === activeContent.id);
    if (currentIndex > 0) {
      set((state) => {
        const history = [...state.history];
        if (state.activeContent) {
          history.push(state.activeContent);
        }
        return {
          activeContent: queue[currentIndex - 1],
          isMinimized: false,
          history,
        };
      });
    }
  },
}));

export default usePlayerStore;
