import type { RefObject } from 'react';
import type { AnimationClip, Object3D } from 'three';
import type { OneShotFinishedCallbacks } from './create-one-shot-finished-handler';
import type { ClipKey, SoldierActions } from './types';
import type { SoldierAnimationClips } from '@/modules/soldiers/types';
import { useEffect, useMemo, useRef } from 'react';
import { AnimationMixer } from 'three';
import { resolveSoldierClips } from '@/modules/soldiers/utils/resolve-soldier-clips';
import { createOneShotFinishedHandler } from './create-one-shot-finished-handler';
import { configureActionLoops, createSoldierActions } from './soldier-actions';

const activeMixers = new Set<AnimationMixer>();

/** Number of soldiers with a live locomotion mixer (e2e diagnostics). */
export function countActiveSoldierMixers(): number {
  return activeMixers.size;
}

interface UseSoldierMixerOptions extends OneShotFinishedCallbacks {
  modelRef: RefObject<Object3D | null>;
  clips: AnimationClip[];
  animationConfig: SoldierAnimationClips;
  enabled: boolean;
  prevKeyRef: RefObject<ClipKey>;
}

/** Mounts the AnimationMixer + action map; tears down on clip/config change. */
export function useSoldierMixer({
  modelRef,
  clips,
  animationConfig,
  enabled,
  prevKeyRef,
  onJumpFinished,
  onReloadingFinished,
  onShootingFinished,
  onHitReactionFinished,
}: UseSoldierMixerOptions): {
  mixerRef: RefObject<AnimationMixer | null>;
  actionsRef: RefObject<SoldierActions | null>;
} {
  const mixerRef = useRef<AnimationMixer | null>(null);
  const actionsRef = useRef<SoldierActions | null>(null);
  const clipsRef = useRef(clips);
  clipsRef.current = clips;

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
    const actions = createSoldierActions(mixer, resolved);
    configureActionLoops(actions);
    actions.idle.reset().setEffectiveWeight(1).play();

    const onFinished = createOneShotFinishedHandler(actions, {
      onJumpFinished,
      onReloadingFinished,
      onShootingFinished,
      onHitReactionFinished,
    });
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
    animationConfig.walk,
    animationConfig.run,
    animationConfig.crouchWalking,
    animationConfig.jump,
    animationConfig.jumpIdle,
    animationConfig.walkBackward,
    animationConfig.runBackward,
    animationConfig.kneel,
    animationConfig.dying,
    animationConfig.reloading,
    animationConfig.reloadingKneel,
    animationConfig.shooting,
    animationConfig.hitReaction,
    clipsKey,
    enabled,
    modelRef,
    prevKeyRef,
    onJumpFinished,
    onReloadingFinished,
    onShootingFinished,
    onHitReactionFinished,
  ]);

  return { mixerRef, actionsRef };
}
