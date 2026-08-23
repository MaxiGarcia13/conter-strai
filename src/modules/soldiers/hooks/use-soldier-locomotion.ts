import type { RefObject } from 'react';
import type { AnimationAction, AnimationClip, Object3D } from 'three';
import type { LocomotionState, SoldierAnimationClips } from '../types';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { AnimationMixer, LoopRepeat } from 'three';

import { resolveSoldierClips } from '../utils/resolve-soldier-clips';
import { cacheHipsBindPosition, lockHipsBindPosition } from '../utils/strip-root-motion';

const CROSSFADE_SECONDS = 0.2;

interface UseSoldierLocomotionOptions {
  /** Fixed locomotion state (world soldiers default to idle). */
  state?: LocomotionState;
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
  const { enabled = true, state = 'idle' } = options;
  const mixerRef = useRef<AnimationMixer | null>(null);
  const actionsRef = useRef<LocomotionActions | null>(null);
  const readyRef = useRef(false);
  const prevStateRef = useRef<LocomotionState>('idle');
  const clipsKey = useMemo(
    () => clips.map((clip) => clip.name).join('|'),
    [clips],
  );

  useEffect(() => {
    readyRef.current = false;
    prevStateRef.current = 'idle';
    actionsRef.current?.idle.stop();
    actionsRef.current?.walk.stop();
    actionsRef.current?.run.stop();
    actionsRef.current = null;
    mixerRef.current?.stopAllAction();
    mixerRef.current = null;
  }, [animationConfig.idle, animationConfig.run, animationConfig.walk, clipsKey, enabled]);

  useFrame((_, delta) => {
    if (!enabled) {
      return;
    }

    const model = modelRef.current;
    if (!model) {
      return;
    }

    if (!readyRef.current) {
      const resolved = resolveSoldierClips(clips, animationConfig);
      if (!resolved) {
        return;
      }

      cacheHipsBindPosition(model);
      const mixer = new AnimationMixer(model);
      const idle = mixer.clipAction(resolved.idle);
      const walk = mixer.clipAction(resolved.walk);
      const run = mixer.clipAction(resolved.run);
      idle.loop = LoopRepeat;
      walk.loop = LoopRepeat;
      run.loop = LoopRepeat;
      idle.reset().setEffectiveWeight(1).play();

      mixerRef.current = mixer;
      actionsRef.current = { idle, walk, run };
      readyRef.current = true;
      prevStateRef.current = 'idle';
    }

    const mixer = mixerRef.current;
    const actions = actionsRef.current;
    if (!mixer || !actions) {
      return;
    }

    if (state !== prevStateRef.current) {
      const from = actionForState(actions, prevStateRef.current);
      const to = actionForState(actions, state);
      from.crossFadeTo(to, CROSSFADE_SECONDS);
      to.play();
      prevStateRef.current = state;
    }

    mixer.update(delta);
    lockHipsBindPosition(model);
  });
}
