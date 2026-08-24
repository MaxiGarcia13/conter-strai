import type { Difficulty, HitZone } from './types';
import { DIFFICULTY_MULT } from './constants/difficulty';

export interface ApplyDamageInput {
  currentHp: number;
  maxHp: number;
  zone: HitZone;
  difficulty: Difficulty;
  /** Per-zone fractions of max HP, resolved from the weapon profile. */
  damageByZone: Record<HitZone, number>;
}

/** Pure zone/damage math — no Three.js, no store access. */
export function applyDamage({
  currentHp,
  maxHp,
  zone,
  difficulty,
  damageByZone,
}: ApplyDamageInput): number {
  const damage = maxHp * damageByZone[zone] * DIFFICULTY_MULT[difficulty];
  return Math.max(0, currentHp - damage);
}
