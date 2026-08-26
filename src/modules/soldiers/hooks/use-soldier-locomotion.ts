import type { RefObject } from 'react';
import type { AnimationAction, AnimationClip, Object3D } from 'three';
import type { LocomotionState, SoldierActionId, SoldierAnimationClips } from '../types';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { AnimationMixer, LoopOnce, LoopRepeat } from 'three';

import { acknowledgeHitReaction } from '../state/hit-reaction-state';
import { resolveAnimationClipKey } from '../utils/resolve-animation-clip-key';
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

type ClipKey = LocomotionState | SoldierActionId;

interface SoldierActions {
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

const ONE_SHOT_KEYS = ['jump', 'kneel', 'dying', 'reloading', 'reloadingKneel', 'shooting', 'hitReaction'] as const;
type OneShotKey = (typeof ONE_SHOT_KEYS)[number];

function isOneShotKey(key: ClipKey): key is OneShotKey {
  return (ONE_SHOT_KEYS as readonly string[]).includes(key);
}

function playDyingHard(mixer: AnimationMixer, actions: SoldierActions): void {
  // Crossfades can leave idle weighted on; death must fully own the skeleton.
  mixer.stopAllAction();
  const dying = actions.dying;
  dying.reset();
  dying.setLoop(LoopOnce, 1);
  dying.clampWhenFinished = true;
  dying.setEffectiveWeight(1);
  dying.play();
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
  const mixerRef = useRef<AnimationMixer | null>(null);
  const actionsRef = useRef<SoldierActions | null>(null);
  const clipsRef = useRef(clips);
  const prevKeyRef = useRef<ClipKey>('idle');
  const getPoseRef = useRef(getPose);
  const getLocomotionStateRef = useRef(getLocomotionState);
  const stateRef = useRef(state);
  const entityIdRef = useRef(entityId);
  clipsRef.current = clips;
  getPoseRef.current = getPose;
  getLocomotionStateRef.current = getLocomotionState;
  stateRef.current = state;
  entityIdRef.current = entityId;

  const clipsKey = useMemo(
    () => clips.map((clip) => clip.name).join('|'),
    [clips],
  );

  useEffect(() => {
    prevKeyRef.current = 'idle';

    for (const action of Object.values(actionsRef.current ?? {})) {
      action?.stop();
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
      crouchWalking: mixer.clipAction(resolved.crouchWalking),
      jump: mixer.clipAction(resolved.jump),
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
    for (const key of ['idle', 'walk', 'run', 'crouchWalking'] as const) {
      actions[key].loop = LoopRepeat;
    }
    // One-shots hold their final frame until the pose owner lets them go.
    for (const key of ONE_SHOT_KEYS) {
      const action = actions[key];
      if (action) {
        action.loop = LoopOnce;
        action.clampWhenFinished = true;
      }
    }
    actions.idle.reset().setEffectiveWeight(1).play();

    const onFinished = (event: { action: AnimationAction }) => {
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
    mixer.addEventListener('finished', onFinished);

    mixerRef.current = mixer;
    actionsRef.current = actions;
    activeMixers.add(mixer);

    return () => {
      for (const action of Object.values(actions)) {
        action?.stop();
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
    animationConfig.dying,
    animationConfig.run,
    animationConfig.walk,
    animationConfig.crouchWalking,
    animationConfig.reloading,
    animationConfig.reloadingKneel,
    animationConfig.shooting,
    animationConfig.hitReaction,
    clipsKey,
    enabled,
    modelRef,
    onJumpFinished,
    onReloadingFinished,
    onShootingFinished,
    onHitReactionStarted,
    onHitReactionFinished,
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

    const pose = getPoseRef.current?.() ?? null;
    const locomotion = getLocomotionStateRef.current?.() ?? stateRef.current;
    let targetKey = resolveAnimationClipKey(pose, locomotion);

    // Skip optional clips that are not loaded for this skin.
    if (isOneShotKey(targetKey) && !actions[targetKey]) {
      targetKey = locomotion;
    }

    if (targetKey !== prevKeyRef.current) {
      if (targetKey === 'dying') {
        playDyingHard(mixer, actions);
      } else {
        const from = actions[prevKeyRef.current];
        const to = actions[targetKey];
        if (to) {
          to.reset().setEffectiveWeight(1).play();
          if (from) {
            from.crossFadeTo(to, CROSSFADE_SECONDS, false);
          }
          if (targetKey === 'hitReaction' && entityIdRef.current) {
            acknowledgeHitReaction(entityIdRef.current);
            onHitReactionStarted?.();
          }
        }
      }
      prevKeyRef.current = targetKey;
    }

    mixer.update(delta);
  });
}
