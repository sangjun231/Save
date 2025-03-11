import { create } from 'zustand';

interface WebState {
  isWeb: boolean;
  setIsWeb: (value: boolean) => void;
}

export const useWebStore = create<WebState>((set) => ({
  isWeb: false, 
  setIsWeb: (value) => set({ isWeb: value }),
}));
