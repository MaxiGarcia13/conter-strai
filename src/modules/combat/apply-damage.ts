import type { Difficulty, HitZone } from './types';
import { DAMAGE_ZONE_PCT } from './constants/damage-zones';
import { DIFFICULTY_MULT } from './constants/difficulty';

export interface ApplyDamageInput {
  currentHp: number;
  maxHp: number;
  zone: HitZone;
  difficulty: Difficulty;
}

/** Pure zone/damage math — no Three.js, no store access. */
export function applyDamage({ currentHp, maxHp, zone, difficulty }: ApplyDamageInput): number {
  const damage = maxHp * DAMAGE_ZONE_PCT[zone] * DIFFICULTY_MULT[difficulty];
  return Math.max(0, currentHp - damage);
}
