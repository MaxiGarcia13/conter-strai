import type { DamageData, Difficulty, HealthState, HealthSystem } from './types';

import type { EntityId } from '@/modules/soldiers';
import { create } from 'zustand';
import { requestHitReaction } from '@/modules/soldiers/state/hit-reaction-state';
import { weapons } from '@/modules/weapons/weapon-registry';
import { applyDamage as computeNextHp } from './apply-damage';
import { DEFAULT_MAX_HP } from './constants/health';
import { requestInjurySound } from './injury-sound-events';
import { isEliminated } from './is-eliminated';

export interface HealthStoreState extends HealthSystem {
  /** Incoming-damage preset; scales every applied hit. */
  difficulty: Difficulty;
  setDifficulty: (difficulty: Difficulty) => void;
  healthById: Record<EntityId, HealthState>;
  /** Server-authoritative write (multiplayer snapshots); no hit reaction. */
  syncHealth: (entityId: EntityId, health: HealthState) => void;
}

/** First damage on an unknown target enters it at full HP. */
export const useHealthStore = create<HealthStoreState>()((set, get) => ({
  difficulty: 'normal',
  setDifficulty: (difficulty) => set({ difficulty }),
  healthById: {},
  getHealth: (entityId) => get().healthById[entityId],
  applyDamage: ({ targetId, zone, weaponId }: DamageData) => {
    const weapon = weapons[weaponId];
    if (!weapon) {
      throw new Error(`Unknown weapon id: ${weaponId}`);
    }
    const { difficulty, healthById } = get();
    const existing = healthById[targetId];
    const maxHp = existing?.maxHp ?? DEFAULT_MAX_HP;
    const nextHp = computeNextHp({
      currentHp: existing?.currentHp ?? maxHp,
      maxHp,
      zone,
      difficulty,
      damageByZone: weapon.damageByZone,
    });
    const nextState: HealthState = {
      currentHp: nextHp,
      maxHp,
      isEliminated: isEliminated(nextHp),
    };
    set((state) => ({ healthById: { ...state.healthById, [targetId]: nextState } }));
    if (nextHp < (existing?.currentHp ?? maxHp)) {
      requestInjurySound(targetId);
    }
    if (!nextState.isEliminated) {
      requestHitReaction(targetId);
    }
    return nextHp;
  },
  syncHealth: (entityId, health) =>
    set((state) => ({ healthById: { ...state.healthById, [entityId]: health } })),
  resetAll: () => set({ healthById: {} }),
}));
