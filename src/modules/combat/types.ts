import type { EntityId } from '@/modules/soldiers';
import type { Team } from '@/modules/teams';

// ---------------------------------------------------------------------------
// Hitbox
// ---------------------------------------------------------------------------

export type HitZone = 'head' | 'body' | 'limb';

export type HitboxPresetId = 'humanoid-standard';

export type HitboxPart = {
  zone: HitZone;
  /** Center offset from the soldier root, meters (ground at Y=0). */
  offset: [number, number, number];
} & (
  | { kind: 'sphere'; radius: number }
  | { kind: 'box'; size: [number, number, number] }
);

export interface HitboxPreset {
  id: HitboxPresetId;
  parts: HitboxPart[];
}

// ---------------------------------------------------------------------------
// Health
// ---------------------------------------------------------------------------

export interface DamageData {
  attackerId: EntityId;
  targetId: EntityId;
  zone: HitZone;
  /** Required for damage resolution — looks up weapon `damageByZone`. */
  weaponId: string;
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
