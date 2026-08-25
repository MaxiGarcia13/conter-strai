import type { PistolWeaponConfig } from './types';

export const DEFAULT_WEAPON_ID = 'pistol';

/**
 * Per-zone fractions of max HP; combat multiplies by difficulty.
 */
export const weapons: Record<string, PistolWeaponConfig> = {
  [DEFAULT_WEAPON_ID]: {
    id: 'pistol',
    name: 'Pistol',
    fireCooldownSeconds: 0.35,
    damageByZone: { head: 0.4, body: 0.2, limb: 0.15 },
    modelUrl: '/assets/weapons/pistol_a.glb',
  },
};
