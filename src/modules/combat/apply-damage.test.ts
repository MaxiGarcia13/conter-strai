import { describe, expect, it } from 'vitest';

import { applyDamage } from './apply-damage';

const MAX_HP = 100;

const pistolDamage = { head: 0.4, body: 0.2, limb: 0.15 } as const;
const knifeDamage = { head: 0.25, body: 0.1, limb: 0.05 } as const;

describe('applyDamage', () => {
  describe('zone × weapon × difficulty', () => {
    it('head > body > limb for the same weapon and difficulty', () => {
      const headHp = applyDamage({
        currentHp: MAX_HP,
        maxHp: MAX_HP,
        zone: 'head',
        difficulty: 'normal',
        damageByZone: pistolDamage,
      });
      const bodyHp = applyDamage({
        currentHp: MAX_HP,
        maxHp: MAX_HP,
        zone: 'body',
        difficulty: 'normal',
        damageByZone: pistolDamage,
      });
      const limbHp = applyDamage({
        currentHp: MAX_HP,
        maxHp: MAX_HP,
        zone: 'limb',
        difficulty: 'normal',
        damageByZone: pistolDamage,
      });

      expect(headHp).toBeLessThan(bodyHp);
      expect(bodyHp).toBeLessThan(limbHp);
    });

    it('different weapons deal different damage for the same zone and difficulty', () => {
      const pistolHp = applyDamage({
        currentHp: MAX_HP,
        maxHp: MAX_HP,
        zone: 'body',
        difficulty: 'normal',
        damageByZone: pistolDamage,
      });
      const knifeHp = applyDamage({
        currentHp: MAX_HP,
        maxHp: MAX_HP,
        zone: 'body',
        difficulty: 'normal',
        damageByZone: knifeDamage,
      });

      expect(pistolHp).not.toBe(knifeHp);
    });

    it('difficulty scales damage correctly', () => {
      const easyHp = applyDamage({
        currentHp: MAX_HP,
        maxHp: MAX_HP,
        zone: 'head',
        difficulty: 'easy',
        damageByZone: pistolDamage,
      });
      const normalHp = applyDamage({
        currentHp: MAX_HP,
        maxHp: MAX_HP,
        zone: 'head',
        difficulty: 'normal',
        damageByZone: pistolDamage,
      });
      const hardHp = applyDamage({
        currentHp: MAX_HP,
        maxHp: MAX_HP,
        zone: 'head',
        difficulty: 'hard',
        damageByZone: pistolDamage,
      });

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
});
