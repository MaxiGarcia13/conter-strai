import type { AnimationMixer } from 'three';
import type { SoldierActions } from './types';
import type { ResolvedSoldierClips } from '@/modules/soldiers/utils/resolve-soldier-clips';
import { LoopOnce, LoopRepeat } from 'three';
import { ONE_SHOT_KEYS } from './types';

/** Build the action map from a mixer and resolved clips. */
export function createSoldierActions(
  mixer: AnimationMixer,
  resolved: ResolvedSoldierClips,
): SoldierActions {
  const actions: SoldierActions = {
    idle: mixer.clipAction(resolved.idle),
    walk: mixer.clipAction(resolved.walk),
    run: mixer.clipAction(resolved.run),
    crouchWalking: mixer.clipAction(resolved.crouchWalking),
    walkBackward: mixer.clipAction(resolved.walkBackward),
    runBackward: mixer.clipAction(resolved.runBackward),
    jump: mixer.clipAction(resolved.jump),
    jumpIdle: mixer.clipAction(resolved.jumpIdle),
    kneel: mixer.clipAction(resolved.kneel),
    dying: mixer.clipAction(resolved.dying),
  };
  if (resolved.reloading) {
    actions.reloading = mixer.clipAction(resolved.reloading);
  }
  if (resolved.reloadingKneel) {
    actions.reloadingKneel = mixer.clipAction(resolved.reloadingKneel);
  }
  if (resolved.shooting) {
    actions.shooting = mixer.clipAction(resolved.shooting);
  }
  if (resolved.hitReaction) {
    actions.hitReaction = mixer.clipAction(resolved.hitReaction);
  }
  return actions;
}

/** Set loop modes: locomotion clips repeat, one-shots play once and hold. */
export function configureActionLoops(actions: SoldierActions): void {
  for (const key of ['idle', 'walk', 'run', 'crouchWalking', 'walkBackward', 'runBackward'] as const) {
    actions[key].loop = LoopRepeat;
  }
  for (const key of ONE_SHOT_KEYS) {
    const action = actions[key];
    if (action) {
      action.loop = LoopOnce;
      action.clampWhenFinished = true;
    }
  }
}

/** Death must fully own the skeleton — crossfades can leave idle weighted on. */
export function playDyingHard(mixer: AnimationMixer, actions: SoldierActions): void {
  mixer.stopAllAction();
  const dying = actions.dying;
  dying.reset();
  dying.setLoop(LoopOnce, 1);
  dying.clampWhenFinished = true;
  dying.setEffectiveWeight(1);
  dying.play();
}
