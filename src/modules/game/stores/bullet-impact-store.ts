import type { CloseWorldImpact } from '../utils/pick-close-world-impact';

import { create } from 'zustand';

export interface BulletImpact extends CloseWorldImpact {
  id: number;
}

const MAX_IMPACTS = 40;

export interface BulletImpactState {
  impacts: BulletImpact[];
  addImpact: (impact: CloseWorldImpact) => void;
  reset: () => void;
}

let nextId = 0;

export const useBulletImpactStore = create<BulletImpactState>()((set) => ({
  impacts: [],

  addImpact: (impact) =>
    set((s) => {
      const next = [...s.impacts, { ...impact, id: nextId++ }];
      return { impacts: next.length > MAX_IMPACTS ? next.slice(-MAX_IMPACTS) : next };
    }),

  reset: () => set({ impacts: [] }),
}));
