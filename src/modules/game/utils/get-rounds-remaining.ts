import { useWeaponAmmoStore } from '@/modules/game/stores/weapon-ammo-store';
import { PISTOL_MAGAZINE_SIZE } from '@/modules/weapons/constants/pistol';

/** Shots left in the current magazine; 0 once the mag is empty. */
export function getRoundsRemaining(): number {
  return PISTOL_MAGAZINE_SIZE - useWeaponAmmoStore.getState().shotsInMag;
}
