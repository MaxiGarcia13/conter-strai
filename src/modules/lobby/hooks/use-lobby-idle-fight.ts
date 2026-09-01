import type { RefObject } from 'react';
import type { Object3D } from 'three';
import type { SoldierSkinId } from '@/modules/soldiers';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { AnimationMixer, LoopOnce } from 'three';
import { resolveCrossfadeSeconds } from '@/modules/soldiers/hooks/use-soldier-locomotion/apply-clip-transition';
import { LOBBY_PREVIEW_ANIMATIONS_URL } from '../constants/idle-fight';
import { prepareLobbyIdleClip } from '../utils/prepare-lobby-idle-clip';
import { resolveLobbyPreviewClipName } from '../utils/resolve-lobby-preview-clip-name';

useGLTF.preload(LOBBY_PREVIEW_ANIMATIONS_URL);

/** Plays the lobby preview clip for this skin (fight once, look-around loops). */
export function useLobbyIdleFight(
  modelRef: RefObject<Object3D | null>,
  source: Object3D,
  skinId: SoldierSkinId,
) {
  const gltf = useGLTF(LOBBY_PREVIEW_ANIMATIONS_URL);
  const clipName = resolveLobbyPreviewClipName(skinId);
  const clip = useMemo(
    () => prepareLobbyIdleClip(gltf.animations, clipName),
    [clipName, gltf.animations],
  );
  const mixerRef = useRef<AnimationMixer | null>(null);

  useEffect(() => {
    const root = modelRef.current;
    if (!root || !clip) {
      return;
    }

    const mixer = new AnimationMixer(root);
    const action = mixer.clipAction(clip);
    action.setLoop(LoopOnce, 1);
    action.clampWhenFinished = true;

    action.reset().fadeIn(resolveCrossfadeSeconds('idle')).play();

    mixerRef.current = mixer;

    return () => {
      mixer.stopAllAction();
      if (mixerRef.current === mixer) {
        mixerRef.current = null;
      }
    };
  }, [clip, clipName, modelRef, source]);

  useFrame((_, delta) => {
    mixerRef.current?.update(delta);
  });
}
