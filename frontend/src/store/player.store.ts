// src/store/player.store.ts
import { create } from "zustand";
import { Content } from "../types/content";

interface PlayerState {
  activeContent: Content | null;
  isMinimized: boolean;
  queue: Content[];
  play: (content: Content, queue?: Content[]) => void;
  minimize: () => void;
  maximize: () => void;
  closePlayer: () => void;
  next: () => void;
  previous: () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  activeContent: null,
  isMinimized: false,
  queue: [],

  play: (content, queue) =>
    set((state) => ({
      activeContent: content,
      isMinimized: false,
      queue: queue || state.queue,
    })),

  minimize: () => set({ isMinimized: true }),

  maximize: () => set({ isMinimized: false }),

  closePlayer: () => set({ activeContent: null, isMinimized: false }),

  next: () => {
    const { activeContent, queue } = get();
    if (!activeContent || queue.length === 0) return;
    
    const currentIndex = queue.findIndex((c) => c.id === activeContent.id);
    if (currentIndex !== -1 && currentIndex < queue.length - 1) {
      set({ activeContent: queue[currentIndex + 1], isMinimized: false });
    }
  },

  previous: () => {
    const { activeContent, queue } = get();
    if (!activeContent || queue.length === 0) return;

    const currentIndex = queue.findIndex((c) => c.id === activeContent.id);
    if (currentIndex > 0) {
      set({ activeContent: queue[currentIndex - 1], isMinimized: false });
    }
  },
}));

export default usePlayerStore;
