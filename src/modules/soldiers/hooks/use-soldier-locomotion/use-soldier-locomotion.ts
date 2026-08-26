import type { RefObject } from 'react';
import type { AnimationClip, Object3D } from 'three';
import type { ClipKey } from './types';
import type { LocomotionState, SoldierActionId, SoldierAnimationClips } from '@/modules/soldiers/types';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { acknowledgeHitReaction } from '@/modules/soldiers/state/hit-reaction-state';
import { applyClipTransition } from './apply-clip-transition';
import { resolvePlayableClipKey } from './resolve-playable-clip-key';
import { countActiveSoldierMixers, useSoldierMixer } from './use-soldier-mixer';

export { countActiveSoldierMixers };

interface UseSoldierLocomotionOptions {
  /** Fixed locomotion state (world soldiers default to idle). */
  state?: LocomotionState;
  /** Per-frame state source (local player); wins over `state` when set. */
  getLocomotionState?: () => LocomotionState;
  /** Active jump/kneel/dying pose; wins over locomotion while set. */
  getPose?: () => SoldierActionId | null;
  /** Entity id for hit-reaction acknowledge (local player + NPCs). */
  entityId?: string;
  /** Pose owner clears its jump request when the one-shot mixer finishes. */
  onJumpFinished?: () => void;
  onReloadingFinished?: () => void;
  onShootingFinished?: () => void;
  onHitReactionStarted?: () => void;
  onHitReactionFinished?: () => void;
  enabled?: boolean;
}

/** Drives idle / walk / run crossfades plus one-shot jump, kneel, and dying poses. */
export function useSoldierLocomotion(
  modelRef: RefObject<Object3D | null>,
  clips: AnimationClip[],
  animationConfig: SoldierAnimationClips,
  options: UseSoldierLocomotionOptions = {},
): void {
  const {
    enabled = true,
    state = 'idle',
    getLocomotionState,
    getPose,
    entityId,
    onJumpFinished,
    onReloadingFinished,
    onShootingFinished,
    onHitReactionStarted,
    onHitReactionFinished,
  } = options;

  const prevKeyRef = useRef<ClipKey>('idle');
  const getPoseRef = useRef(getPose);
  const getLocomotionStateRef = useRef(getLocomotionState);
  const stateRef = useRef(state);
  const entityIdRef = useRef(entityId);
  const onHitReactionStartedRef = useRef(onHitReactionStarted);
  getPoseRef.current = getPose;
  getLocomotionStateRef.current = getLocomotionState;
  stateRef.current = state;
  entityIdRef.current = entityId;
  onHitReactionStartedRef.current = onHitReactionStarted;

  const { mixerRef, actionsRef } = useSoldierMixer({
    modelRef,
    clips,
    animationConfig,
    enabled,
    prevKeyRef,
    onJumpFinished,
    onReloadingFinished,
    onShootingFinished,
    onHitReactionFinished,
  });

  useFrame((_, delta) => {
    if (!enabled) {
      return;
    }

    if (!modelRef.current) {
      return;
    }

    const mixer = mixerRef.current;
    const actions = actionsRef.current;
    if (!mixer || !actions) {
      return;
    }

    const pose = getPoseRef.current?.() ?? null;
    const locomotion = getLocomotionStateRef.current?.() ?? stateRef.current;
    const targetKey = resolvePlayableClipKey(pose, locomotion, actions);

    if (targetKey !== prevKeyRef.current) {
      const enteredHitReaction = applyClipTransition(
        mixer,
        actions,
        prevKeyRef.current,
        targetKey,
      );
      if (enteredHitReaction && entityIdRef.current) {
        acknowledgeHitReaction(entityIdRef.current);
        onHitReactionStartedRef.current?.();
      }
      prevKeyRef.current = targetKey;
    }

    mixer.update(delta);
  });
}
