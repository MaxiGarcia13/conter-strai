import type { EntityId, HitZone } from '@/modules/soldiers';
import type { Team } from '@/modules/teams';

// ---------------------------------------------------------------------------
// Health
// ---------------------------------------------------------------------------

export interface DamageData {
  attackerId: EntityId;
  targetId: EntityId;
  zone: HitZone;
  weaponId?: string;
  /** Attacker's team; used to reject friendly fire. */
  team?: Team;
}

export interface HealthState {
  currentHp: number;
  maxHp: number;
  isEliminated: boolean;
}

/** Per-entity health contract backed by the health store. */
export interface HealthSystem {
  getHealth: (entityId: EntityId) => HealthState | undefined;
  /** Applies damage and returns the target's next HP. */
  applyDamage: (damage: DamageData) => number;
  resetAll: () => void;
}

// ---------------------------------------------------------------------------
// Difficulty
// ---------------------------------------------------------------------------

export type Difficulty = 'easy' | 'normal' | 'hard';
