import type { AnimationAction } from 'three';
import type { LocomotionState, SoldierActionId } from '@/modules/soldiers/types';

export type ClipKey = LocomotionState | SoldierActionId;

export const ONE_SHOT_KEYS = ['jump', 'kneel', 'dying', 'reloading', 'reloadingKneel', 'shooting', 'hitReaction'] as const;
export type OneShotKey = (typeof ONE_SHOT_KEYS)[number];

export interface SoldierActions {
  idle: AnimationAction;
  walk: AnimationAction;
  run: AnimationAction;
  crouchWalking: AnimationAction;
  jump: AnimationAction;
  kneel: AnimationAction;
  dying: AnimationAction;
  reloading?: AnimationAction;
  reloadingKneel?: AnimationAction;
  shooting?: AnimationAction;
  hitReaction?: AnimationAction;
}

export function isOneShotKey(key: ClipKey): key is OneShotKey {
  return (ONE_SHOT_KEYS as readonly string[]).includes(key);
}
