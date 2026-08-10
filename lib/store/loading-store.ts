import { create } from "zustand";

interface LoadingState {
  message: string | null;
  show: (message: string) => void;
  hide: () => void;
}

export const useLoadingStore = create<LoadingState>((set) => ({
  message: null,
  show: (message) => set({ message }),
  hide: () => set({ message: null }),
}));
