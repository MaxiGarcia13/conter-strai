import type { PlayersUpdatePayload } from '../adapters/colyseus-adapter';
import type { HealthState } from '@/modules/combat';
import type { EntityId } from '@/modules/soldiers';
import { DEFAULT_MAX_HP } from '@/modules/combat/constants/health';

export interface ServerHealthEffects {
  /** Local player's freshly-synced health when the snapshot includes them. */
  localHealth: HealthState | null;
  /** Players who lost HP and are still alive (flinch) — session ids. */
  hitReactions: EntityId[];
  /** Players who lost HP, including lethal hits — session ids. Local injury SFX. */
  injuredIds: EntityId[];
  /** Next prev-HP cache, pruned of players no longer present. */
  nextById: Map<EntityId, number>;
}

/**
 * Pure server-snapshot → client health side effects. A player flinches when
 * their HP drops while still alive; elimination is handled by the dying pose.
 * Injury SFX fires on any HP drop (including lethal). First sighting never
 * flinches or grunts.
 */
export function resolveServerHealthEffects(
  payload: PlayersUpdatePayload,
  prevById: ReadonlyMap<EntityId, number>,
): ServerHealthEffects {
  const nextById = new Map<EntityId, number>();
  const hitReactions: EntityId[] = [];
  const injuredIds: EntityId[] = [];
  let localHealth: HealthState | null = null;

  for (const snapshot of payload.players) {
    const id = snapshot.sessionId;
    const prev = prevById.get(id);
    nextById.set(id, snapshot.hp);

    if (prev !== undefined && snapshot.hp < prev) {
      injuredIds.push(id);
      if (!snapshot.eliminated) {
        hitReactions.push(id);
      }
    }

    if (id === payload.localSessionId) {
      localHealth = {
        currentHp: snapshot.hp,
        maxHp: DEFAULT_MAX_HP,
        isEliminated: snapshot.eliminated,
      };
    }
  }

  return {
    localHealth,
    hitReactions,
    injuredIds,
    nextById,
  };
}
