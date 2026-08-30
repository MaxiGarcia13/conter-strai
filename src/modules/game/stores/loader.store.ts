import { create } from 'zustand';

export interface LoaderStoreState {
  label: string;
  /** `null` = indeterminate pulse bar (engine boot). */
  progress: number | null;
}

interface LoaderStore {
  loader: LoaderStoreState | null;
  setLoader: (loader: LoaderStoreState | null) => void;
}

export const useLoaderStore = create<LoaderStore>()((set) => ({
  loader: { label: 'Loading engine', progress: null },
  setLoader: (loader) => {
    if (loader !== null && loader.progress !== 100) {
      set({ loader });
    } else {
      // Wait one second before removing the loader to avoid flickering
      setTimeout(() => {
        set({ loader: null });
      }, 1000);
    }
  },
}));
