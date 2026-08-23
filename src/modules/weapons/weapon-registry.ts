import type { PistolWeaponConfig } from './types';

export const DEFAULT_WEAPON_ID = 'pistol';

/**
 * Damage lives in combat (`DAMAGE_ZONE_PCT` × max HP), not per weapon.
 * Cooldown and identity are the weapon's own concern.
 */
export const weapons: Record<string, PistolWeaponConfig> = {
  [DEFAULT_WEAPON_ID]: {
    id: 'pistol',
    name: 'Pistol',
    fireCooldownSeconds: 0.35,
  },
};
