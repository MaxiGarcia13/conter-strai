import type { EntityId } from '@/modules/soldiers';

/** Wait so the grunt sits after the gunshot peak instead of under it. */
export const INJURY_SOUND_DELAY_MS = 150;

const pendingByEntity = new Map<EntityId, number>();

/**
 * Local-only injury SFX queue. HP drops already arrive via the match snapshot
 * or `applyDamage` — do not relay this over the network (unlike `fire`).
 * Queued like hit-reaction so a hit before the canvas hook mounts is not lost.
 */
export function requestInjurySound(entityId: EntityId, nowMs = performance.now()): void {
  if (!pendingByEntity.has(entityId)) {
    pendingByEntity.set(entityId, nowMs);
  }
}

/** Entity ids whose delay has elapsed; removes them from the queue. */
export function drainDueInjurySounds(nowMs = performance.now()): EntityId[] {
  const due: EntityId[] = [];
  for (const [entityId, atMs] of pendingByEntity) {
    if (nowMs - atMs >= INJURY_SOUND_DELAY_MS) {
      due.push(entityId);
      pendingByEntity.delete(entityId);
    }
  }
  return due;
}

/** Test helper — drops queued injuries so cases cannot leak into each other. */
export function resetInjurySoundForTests(): void {
  pendingByEntity.clear();
}
