import type { AnimationAction } from 'three';
import type { SoldierActions } from './types';

export interface OneShotFinishedCallbacks {
  onJumpFinished?: () => void;
  onReloadingFinished?: () => void;
  onShootingFinished?: () => void;
  onHitReactionFinished?: () => void;
}

/** Map mixer `finished` events to pose-owner one-shot callbacks. */
export function createOneShotFinishedHandler(
  actions: SoldierActions,
  callbacks: OneShotFinishedCallbacks,
): (event: { action: AnimationAction }) => void {
  const {
    onJumpFinished,
    onReloadingFinished,
    onShootingFinished,
    onHitReactionFinished,
  } = callbacks;

  return (event: { action: AnimationAction }) => {
    if (event.action === actions.jump) {
      onJumpFinished?.();
    } else if (event.action === actions.reloading) {
      onReloadingFinished?.();
    } else if (event.action === actions.reloadingKneel) {
      onReloadingFinished?.();
    } else if (event.action === actions.shooting) {
      onShootingFinished?.();
    } else if (event.action === actions.hitReaction) {
      onHitReactionFinished?.();
    }
  };
}
