import type { EntityId } from '../types';

/** NPC hit-reaction requests (local player uses player-state pose instead). */
const pendingByEntity = new Set<EntityId>();

export function requestHitReaction(entityId: EntityId): void {
  pendingByEntity.add(entityId);
}

/** True while a hit-reaction one-shot is queued for this entity. */
export function peekHitReaction(entityId: EntityId): boolean {
  return pendingByEntity.has(entityId);
}

/** Mixer claimed the queued reaction; do not re-trigger until the clip finishes. */
export function acknowledgeHitReaction(entityId: EntityId): void {
  pendingByEntity.delete(entityId);
}
