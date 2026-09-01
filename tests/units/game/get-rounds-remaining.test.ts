import { beforeEach, describe, expect, it } from 'vitest';
import { useWeaponAmmoStore } from '@/modules/game/stores/weapon-ammo-store';
import { getRoundsRemaining } from '@/modules/game/utils/get-rounds-remaining';
import { PISTOL_MAGAZINE_SIZE } from '@/modules/weapons/constants/pistol';

describe('getRoundsRemaining', () => {
  beforeEach(() => {
    useWeaponAmmoStore.getState().reset();
  });

  it('returns a full magazine before any shot', () => {
    expect(getRoundsRemaining()).toBe(PISTOL_MAGAZINE_SIZE);
  });

  it('decreases by one per recorded shot', () => {
    useWeaponAmmoStore.getState().recordShot();
    useWeaponAmmoStore.getState().recordShot();
    expect(getRoundsRemaining()).toBe(PISTOL_MAGAZINE_SIZE - 2);
  });

  it('reports 0 when the magazine is empty', () => {
    for (let i = 0; i < PISTOL_MAGAZINE_SIZE; i++) {
      useWeaponAmmoStore.getState().recordShot();
    }
    expect(getRoundsRemaining()).toBe(0);
  });

  it('returns a full magazine again after a reload completes', () => {
    useWeaponAmmoStore.getState().recordShot();
    useWeaponAmmoStore.getState().onReloadComplete();
    expect(getRoundsRemaining()).toBe(PISTOL_MAGAZINE_SIZE);
  });
});
