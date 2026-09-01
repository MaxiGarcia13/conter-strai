import { create } from 'zustand';
import { PISTOL_MAGAZINE_SIZE } from '@/modules/weapons/constants/pistol';

export interface WeaponAmmoState {
  shotsInMag: number;

  recordShot: () => void;
  needsReload: () => boolean;
  onReloadComplete: () => void;
  reset: () => void;
}

export const useWeaponAmmoStore = create<WeaponAmmoState>()((set, get) => ({
  shotsInMag: PISTOL_MAGAZINE_SIZE,

  recordShot: () => set((s) => ({ shotsInMag: s.shotsInMag + 1 })),

  needsReload: () => get().shotsInMag >= PISTOL_MAGAZINE_SIZE,

  onReloadComplete: () => set({ shotsInMag: 0 }),

  reset: () => set({ shotsInMag: PISTOL_MAGAZINE_SIZE }),
}));
