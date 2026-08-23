import type { Difficulty } from '../types';

/** Incoming-damage multipliers per difficulty preset. */
export const DIFFICULTY_MULT = {
  easy: 0.75,
  normal: 1,
  hard: 1.25,
} as const satisfies Record<Difficulty, number>;
