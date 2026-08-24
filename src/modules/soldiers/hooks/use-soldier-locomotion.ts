import type { RefObject } from 'react';
import type { AnimationAction, AnimationClip, Object3D } from 'three';
import type { LocomotionState, SoldierAnimationClips } from '../types';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { AnimationMixer, LoopRepeat } from 'three';

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
  enabled?: boolean;
}

interface LocomotionActions {
  idle: AnimationAction;
  walk: AnimationAction;
  run: AnimationAction;
}

function actionForState(actions: LocomotionActions, state: LocomotionState): AnimationAction {
  return actions[state];
}

/** Drives idle / walk / run crossfades on a skinned soldier root. */
export function useSoldierLocomotion(
  modelRef: RefObject<Object3D | null>,
  clips: AnimationClip[],
  animationConfig: SoldierAnimationClips,
  options: UseSoldierLocomotionOptions = {},
): void {
  const { enabled = true, state = 'idle', getLocomotionState } = options;
  const mixerRef = useRef<AnimationMixer | null>(null);
  const actionsRef = useRef<LocomotionActions | null>(null);
  const clipsRef = useRef(clips);
  const prevStateRef = useRef<LocomotionState>('idle');
  clipsRef.current = clips;
  const clipsKey = useMemo(
    () => clips.map((clip) => clip.name).join('|'),
    [clips],
  );

  useEffect(() => {
    prevStateRef.current = 'idle';

    actionsRef.current?.idle.stop();
    actionsRef.current?.walk.stop();
    actionsRef.current?.run.stop();
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
    const idle = mixer.clipAction(resolved.idle);
    const walk = mixer.clipAction(resolved.walk);
    const run = mixer.clipAction(resolved.run);
    idle.loop = LoopRepeat;
    walk.loop = LoopRepeat;
    run.loop = LoopRepeat;
    idle.reset().setEffectiveWeight(1).play();

    mixerRef.current = mixer;
    actionsRef.current = { idle, walk, run };
    activeMixers.add(mixer);

    return () => {
      actionsRef.current?.idle.stop();
      actionsRef.current?.walk.stop();
      actionsRef.current?.run.stop();
      activeMixers.delete(mixer);
      mixer.stopAllAction();
      if (mixerRef.current === mixer) {
        mixerRef.current = null;
        actionsRef.current = null;
      }
    };
  }, [animationConfig.idle, animationConfig.run, animationConfig.walk, clipsKey, enabled, modelRef]);

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

    const currentState = getLocomotionState?.() ?? state;

    if (currentState !== prevStateRef.current) {
      const from = actionForState(actions, prevStateRef.current);
      const to = actionForState(actions, currentState);

      to.reset().setEffectiveWeight(1).play();
      from.crossFadeTo(to, CROSSFADE_SECONDS, false);
      prevStateRef.current = currentState;
    }

    mixer.update(delta);
  });
}
