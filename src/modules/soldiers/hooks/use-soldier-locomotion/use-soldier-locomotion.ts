import type { RefObject } from 'react';
import type { AnimationClip, Object3D } from 'three';
import type { ClipKey } from './types';
import type { LocomotionState, SoldierActionId, SoldierAnimationClips } from '@/modules/soldiers/types';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { acknowledgeHitReaction } from '@/modules/soldiers/state/hit-reaction-state';
import { applyClipTransition, resolveCrossfadeSeconds } from './apply-clip-transition';
import { resolvePlayableClipKey } from './resolve-playable-clip-key';
import { isOneShotKey } from './types';
import { countActiveSoldierMixers, useSoldierMixer } from './use-soldier-mixer';

export { countActiveSoldierMixers };

interface UseSoldierLocomotionOptions {
  /** Fixed locomotion state (world soldiers default to idle). */
  state?: LocomotionState;
  /** Per-frame state source (local player); wins over `state` when set. */
  getLocomotionState?: () => LocomotionState;
  /** Active jump/kneel/dying pose; wins over locomotion while set. */
  getPose?: () => SoldierActionId | null;
  /**
   * Bumps when a peer retriggers the same one-shot (second jump). Mixer restarts
   * the clip even if the key did not change.
   */
  getPoseEpoch?: () => number;
  /** Entity id for hit-reaction acknowledge (local player + NPCs). */
  entityId?: string;
  /** Pose owner clears its jump request when the one-shot mixer finishes. */
  onJumpFinished?: () => void;
  onReloadingFinished?: () => void;
  onShootingFinished?: () => void;
  onHitReactionStarted?: () => void;
  onHitReactionFinished?: () => void;
  /** Override locomotion crossfade (remote peers use a longer blend). */
  locomotionCrossfadeSeconds?: number;
  /** Scales locomotion clip playback to match rendered world speed (remote peers). */
  getLocomotionTimeScale?: () => number;
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
    getPoseEpoch,
    entityId,
    onJumpFinished,
    onReloadingFinished,
    onShootingFinished,
    onHitReactionStarted,
    onHitReactionFinished,
    locomotionCrossfadeSeconds,
    getLocomotionTimeScale,
  } = options;

  const prevKeyRef = useRef<ClipKey>('idle');
  const prevEpochRef = useRef(0);
  const getPoseRef = useRef(getPose);
  const getPoseEpochRef = useRef(getPoseEpoch);
  const getLocomotionStateRef = useRef(getLocomotionState);
  const getLocomotionTimeScaleRef = useRef(getLocomotionTimeScale);
  const stateRef = useRef(state);
  const entityIdRef = useRef(entityId);
  const onHitReactionStartedRef = useRef(onHitReactionStarted);
  const locomotionCrossfadeRef = useRef(locomotionCrossfadeSeconds);
  getPoseRef.current = getPose;
  getPoseEpochRef.current = getPoseEpoch;
  getLocomotionStateRef.current = getLocomotionState;
  getLocomotionTimeScaleRef.current = getLocomotionTimeScale;
  stateRef.current = state;
  entityIdRef.current = entityId;
  onHitReactionStartedRef.current = onHitReactionStarted;
  locomotionCrossfadeRef.current = locomotionCrossfadeSeconds;

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
    const epoch = getPoseEpochRef.current?.() ?? 0;
    const keyChanged = targetKey !== prevKeyRef.current;
    const epochChanged = epoch !== prevEpochRef.current;

    if (keyChanged || epochChanged) {
      const crossfade = isOneShotKey(targetKey)
        ? resolveCrossfadeSeconds(targetKey)
        : locomotionCrossfadeRef.current ?? resolveCrossfadeSeconds(targetKey);
      const enteredHitReaction = applyClipTransition(
        mixer,
        actions,
        prevKeyRef.current,
        targetKey,
        crossfade,
      );
      if (enteredHitReaction && entityIdRef.current) {
        acknowledgeHitReaction(entityIdRef.current);
        onHitReactionStartedRef.current?.();
      }
      prevKeyRef.current = targetKey;
      prevEpochRef.current = epoch;
    }

    const locomotionScale = getLocomotionTimeScaleRef.current?.() ?? 1;
    for (const [key, action] of Object.entries(actions)) {
      if (!action) {
        continue;
      }
      action.setEffectiveTimeScale(isOneShotKey(key as ClipKey) ? 1 : locomotionScale);
    }

    mixer.update(delta);
  });
}
