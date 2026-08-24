import type { RefObject } from 'react';
import type { AnimationAction, AnimationClip, Object3D } from 'three';
import type { LocomotionState, SoldierActionId, SoldierAnimationClips } from '../types';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { AnimationMixer, LoopOnce, LoopRepeat } from 'three';

import { resolveSoldierClips } from '../utils/resolve-soldier-clips';

const CROSSFADE_SECONDS = 0.2;

const activeMixers = new Set<AnimationMixer>();

/** Number of soldiers with a live locomotion mixer (e2e diagnostics). */
export function countActiveSoldierMixers(): number {
  return activeMixers.size;
}

interface UseSoldierLocomotionOptions {
  /** Fixed locomotion state (world soldiers default to idle). */
  state?: LocomotionState;
  /** Per-frame state source (local player); wins over `state` when set. */
  getLocomotionState?: () => LocomotionState;
  /** Active jump/kneel pose; wins over locomotion while set. */
  getPose?: () => SoldierActionId | null;
  /** Pose owner clears its jump request when the one-shot mixer finishes. */
  onJumpFinished?: () => void;
  enabled?: boolean;
}

type ClipKey = LocomotionState | SoldierActionId;

interface SoldierActions {
  idle: AnimationAction;
  walk: AnimationAction;
  run: AnimationAction;
  jump: AnimationAction;
  kneel: AnimationAction;
}

/** Drives idle / walk / run crossfades plus one-shot jump and kneel poses on a skinned soldier root. */
export function useSoldierLocomotion(
  modelRef: RefObject<Object3D | null>,
  clips: AnimationClip[],
  animationConfig: SoldierAnimationClips,
  options: UseSoldierLocomotionOptions = {},
): void {
  const { enabled = true, state = 'idle', getLocomotionState, getPose, onJumpFinished } = options;
  const mixerRef = useRef<AnimationMixer | null>(null);
  const actionsRef = useRef<SoldierActions | null>(null);
  const clipsRef = useRef(clips);
  const prevKeyRef = useRef<ClipKey>('idle');
  clipsRef.current = clips;
  const clipsKey = useMemo(
    () => clips.map((clip) => clip.name).join('|'),
    [clips],
  );

  useEffect(() => {
    prevKeyRef.current = 'idle';

    for (const action of Object.values(actionsRef.current ?? {})) {
      action.stop();
    }
    actionsRef.current = null;

    if (mixerRef.current) {
      activeMixers.delete(mixerRef.current);
      mixerRef.current.stopAllAction();
      mixerRef.current = null;
    }

    if (!enabled || !modelRef.current) {
      return;
    }

    const resolved = resolveSoldierClips(clipsRef.current, animationConfig);
    if (!resolved) {
      return;
    }

    const mixer = new AnimationMixer(modelRef.current);
    const actions: SoldierActions = {
      idle: mixer.clipAction(resolved.idle),
      walk: mixer.clipAction(resolved.walk),
      run: mixer.clipAction(resolved.run),
      jump: mixer.clipAction(resolved.jump),
      kneel: mixer.clipAction(resolved.kneel),
    };
    for (const key of ['idle', 'walk', 'run'] as const) {
      actions[key].loop = LoopRepeat;
    }
    // One-shots hold their final frame until the pose owner lets them go.
    for (const key of ['jump', 'kneel'] as const) {
      actions[key].loop = LoopOnce;
      actions[key].clampWhenFinished = true;
    }
    actions.idle.reset().setEffectiveWeight(1).play();

    const onFinished = (event: { action: AnimationAction }) => {
      if (event.action === actions.jump) {
        onJumpFinished?.();
      }
    };
    mixer.addEventListener('finished', onFinished);

    mixerRef.current = mixer;
    actionsRef.current = actions;
    activeMixers.add(mixer);

    return () => {
      for (const action of Object.values(actions)) {
        action.stop();
      }
      mixer.removeEventListener('finished', onFinished);
      activeMixers.delete(mixer);
      mixer.stopAllAction();
      if (mixerRef.current === mixer) {
        mixerRef.current = null;
        actionsRef.current = null;
      }
    };
  }, [
    animationConfig.idle,
    animationConfig.jump,
    animationConfig.kneel,
    animationConfig.run,
    animationConfig.walk,
    clipsKey,
    enabled,
    modelRef,
    onJumpFinished,
  ]);

  useFrame((_, delta) => {
    if (!enabled) {
      return;
    }

    const model = modelRef.current;
    if (!model) {
      return;
    }

    const mixer = mixerRef.current;
    const actions = actionsRef.current;
    if (!mixer || !actions) {
      return;
    }

    const targetKey = getPose?.() ?? getLocomotionState?.() ?? state;

    if (targetKey !== prevKeyRef.current) {
      const from = actions[prevKeyRef.current];
      const to = actions[targetKey];

      to.reset().setEffectiveWeight(1).play();
      from.crossFadeTo(to, CROSSFADE_SECONDS, false);
      prevKeyRef.current = targetKey;
    }

    mixer.update(delta);
  });
}
