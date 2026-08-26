import type { ClipKey, SoldierActions } from './types';
import type { LocomotionState, SoldierActionId } from '@/modules/soldiers/types';
import { resolveAnimationClipKey } from '@/modules/soldiers/utils/resolve-animation-clip-key';
import { isOneShotKey } from './types';

/**
 * Resolves the clip to play, falling back to locomotion when an optional
 * one-shot is requested but not loaded for this skin.
 */
export function resolvePlayableClipKey(
  pose: SoldierActionId | null,
  locomotion: LocomotionState,
  actions: SoldierActions,
): ClipKey {
  const targetKey = resolveAnimationClipKey(pose, locomotion);
  if (isOneShotKey(targetKey) && !actions[targetKey]) {
    return locomotion;
  }
  return targetKey;
}
