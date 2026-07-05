// src/store/ui.store.ts
import { create } from "zustand";

interface UIState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  activeNoteId: string | null;
  setActiveNoteId: (id: string | null) => void;
  isNotesSplitView: boolean;
  toggleNotesSplitView: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  activeNoteId: null,
  isNotesSplitView: true,

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setActiveNoteId: (activeNoteId) => set({ activeNoteId }),
  toggleNotesSplitView: () => set((state) => ({ isNotesSplitView: !state.isNotesSplitView })),
}));

export default useUIStore;
