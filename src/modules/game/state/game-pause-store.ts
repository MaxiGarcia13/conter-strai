import { create } from 'zustand';

export interface GamePauseState {
  isPaused: boolean;
  showCommands: boolean;
  togglePause: () => void;
  setPaused: (value: boolean) => void;
  setShowCommands: (value: boolean) => void;
  reset: () => void;
}

export const useGamePauseStore = create<GamePauseState>()((set) => ({
  isPaused: false,
  showCommands: false,

  togglePause: () =>
    set((s) => {
      const isPaused = !s.isPaused;
      return { isPaused, ...(isPaused ? {} : { showCommands: false }) };
    }),

  setPaused: (value) => set({ isPaused: value, ...(value ? {} : { showCommands: false }) }),

  setShowCommands: (value) => set({ showCommands: value }),

  reset: () => set({ isPaused: false, showCommands: false }),
}));
