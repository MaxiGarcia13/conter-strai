import type { EntityId, SoldierActionId } from '../types';

import { peekHitReaction } from '../state/hit-reaction-state';

/**
 * Merges explicit player poses with queued hit reactions.
 * Priority: dying → reloading/jump → hit-reaction → other poses.
 */
export function resolveLocalPlayerPose(
  playerPose: SoldierActionId | null,
  entityId: EntityId,
): SoldierActionId | null {
  if (playerPose === 'dying') {
    return 'dying';
  }
  if (playerPose === 'reloading' || playerPose === 'jump') {
    return playerPose;
  }
  if (peekHitReaction(entityId)) {
    return 'hitReaction';
  }
  return playerPose;
}

/** NPC pose: elimination death, then queued hit reaction. */
export function resolveNpcPose(entityId: EntityId, isEliminated: boolean): SoldierActionId | null {
  if (isEliminated) {
    return 'dying';
  }
  if (peekHitReaction(entityId)) {
    return 'hitReaction';
  }
  return null;
}
