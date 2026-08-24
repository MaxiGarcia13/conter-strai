import type { Difficulty, HitZone } from '@/modules/combat';
import { describe, expect, it } from 'vitest';
import { applyDamage } from '@/modules/combat';
import { DEFAULT_WEAPON_ID, weapons } from '@/modules/weapons/weapon-registry';

/** Test-only stand-in for a future loadout weapon (no registry entry yet). */
const KNIFE_DAMAGE_BY_ZONE: Record<HitZone, number> = { head: 0.9, body: 0.45, limb: 0.3 };

describe('apply-damage', () => {
  it('same weapon and difficulty: head drops HP more than body, body more than limb', () => {
    const pistolProfile = weapons[DEFAULT_WEAPON_ID];
    const baseInput = { currentHp: 100, maxHp: 100, difficulty: 'normal' as Difficulty };

    const headHp = applyDamage({ ...baseInput, zone: 'head', damageByZone: pistolProfile.damageByZone });
    const bodyHp = applyDamage({ ...baseInput, zone: 'body', damageByZone: pistolProfile.damageByZone });
    const limbHp = applyDamage({ ...baseInput, zone: 'limb', damageByZone: pistolProfile.damageByZone });

    expect(headHp).toBeLessThan(bodyHp);
    expect(bodyHp).toBeLessThan(limbHp);
  });

  it('same zone and difficulty: different weapons drop HP differently', () => {
    const pistolProfile = weapons[DEFAULT_WEAPON_ID];
    const baseInput = {
      currentHp: 100,
      maxHp: 100,
      zone: 'body' as HitZone,
      difficulty: 'normal' as Difficulty,
    };

    const pistolHp = applyDamage({ ...baseInput, damageByZone: pistolProfile.damageByZone });
    const knifeHp = applyDamage({ ...baseInput, damageByZone: KNIFE_DAMAGE_BY_ZONE });

    expect(knifeHp).toBeLessThan(pistolHp);
  });
});
