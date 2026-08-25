import type { Difficulty, HitZone } from '@/modules/combat';
import { describe, expect, it } from 'vitest';
import { applyDamage } from '@/modules/combat';
import { DEFAULT_WEAPON_ID, weapons } from '@/modules/weapons/weapon-registry';

const MAX_HP = 100;

const pistolDamage = weapons[DEFAULT_WEAPON_ID].damageByZone;

/** Test-only stand-in for a future loadout weapon (no registry entry yet). */
const KNIFE_DAMAGE_BY_ZONE: Record<HitZone, number> = { head: 0.25, body: 0.1, limb: 0.05 };

describe('applyDamage', () => {
  describe('zone × weapon × difficulty', () => {
    it('head > body > limb for the same weapon and difficulty', () => {
      const baseInput = { currentHp: MAX_HP, maxHp: MAX_HP, difficulty: 'normal' as Difficulty };

      const headHp = applyDamage({ ...baseInput, zone: 'head', damageByZone: pistolDamage });
      const bodyHp = applyDamage({ ...baseInput, zone: 'body', damageByZone: pistolDamage });
      const limbHp = applyDamage({ ...baseInput, zone: 'limb', damageByZone: pistolDamage });

      expect(headHp).toBeLessThan(bodyHp);
      expect(bodyHp).toBeLessThan(limbHp);
    });

    it('different weapons deal different damage for the same zone and difficulty', () => {
      const baseInput = {
        currentHp: MAX_HP,
        maxHp: MAX_HP,
        zone: 'body' as HitZone,
        difficulty: 'normal' as Difficulty,
      };

      const pistolHp = applyDamage({ ...baseInput, damageByZone: pistolDamage });
      const knifeHp = applyDamage({ ...baseInput, damageByZone: KNIFE_DAMAGE_BY_ZONE });

      expect(pistolHp).not.toBe(knifeHp);
    });

    it('difficulty scales damage correctly', () => {
      const baseInput = {
        currentHp: MAX_HP,
        maxHp: MAX_HP,
        zone: 'head' as HitZone,
        damageByZone: pistolDamage,
      };

      const easyHp = applyDamage({ ...baseInput, difficulty: 'easy' });
      const normalHp = applyDamage({ ...baseInput, difficulty: 'normal' });
      const hardHp = applyDamage({ ...baseInput, difficulty: 'hard' });

      expect(easyHp).toBeGreaterThan(normalHp);
      expect(normalHp).toBeGreaterThan(hardHp);
    });
  });

  describe('hp floor at 0', () => {
    it('floors at 0 when damage exceeds current HP', () => {
      const result = applyDamage({
        currentHp: 10,
        maxHp: MAX_HP,
        zone: 'head',
        difficulty: 'normal',
        damageByZone: pistolDamage,
      });

      expect(result).toBe(0);
    });

    it('never returns a negative HP value', () => {
      const result = applyDamage({
        currentHp: 0,
        maxHp: MAX_HP,
        zone: 'head',
        difficulty: 'normal',
        damageByZone: pistolDamage,
      });

      expect(result).toBe(0);
    });
  });

  describe('elimination', () => {
    it('eliminates when HP reaches 0', () => {
      const hp = applyDamage({
        currentHp: 40,
        maxHp: MAX_HP,
        zone: 'head',
        difficulty: 'normal',
        damageByZone: pistolDamage,
      });

      expect(hp).toBe(0);
    });

    it('accumulates damage across multiple hits toward elimination', () => {
      let hp = MAX_HP;
      hp = applyDamage({
        currentHp: hp,
        maxHp: MAX_HP,
        zone: 'body',
        difficulty: 'normal',
        damageByZone: pistolDamage,
      });
      expect(hp).toBe(80);

      hp = applyDamage({
        currentHp: hp,
        maxHp: MAX_HP,
        zone: 'body',
        difficulty: 'normal',
        damageByZone: pistolDamage,
      });
      expect(hp).toBe(60);

      hp = applyDamage({
        currentHp: hp,
        maxHp: MAX_HP,
        zone: 'head',
        difficulty: 'normal',
        damageByZone: pistolDamage,
      });
      expect(hp).toBe(20);

      hp = applyDamage({
        currentHp: hp,
        maxHp: MAX_HP,
        zone: 'body',
        difficulty: 'normal',
        damageByZone: pistolDamage,
      });
      expect(hp).toBe(0);
    });
  });

  it('resolves pistol profile from the weapon registry', () => {
    expect(DEFAULT_WEAPON_ID).toBe('pistol');
    expect(pistolDamage).toEqual({ head: 0.4, body: 0.2, limb: 0.15 });
  });
});
