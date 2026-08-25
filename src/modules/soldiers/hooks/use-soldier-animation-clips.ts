import type { AnimationClip } from 'three';
import type { CharacterMeshData } from '../types';

import { useGLTF } from '@react-three/drei';
import { useMemo } from 'react';

import { mergeSoldierClips } from '../utils/merge-soldier-clips';

/**
 * Merges mesh-local clips with an optional shared pack. Shared wins on name.
 * When no shared URL is set, returns `meshClips` unchanged (shared `useGLTF`
 * still runs against `modelUrl` so the hook stays unconditional — drei caches).
 */
export function useSoldierAnimationClips(
  meshData: CharacterMeshData,
  meshClips: AnimationClip[],
): AnimationClip[] {
  const sharedUrl = meshData.sharedAnimationsUrl ?? meshData.modelUrl;
  const sharedGltf = useGLTF(sharedUrl);

  return useMemo(() => {
    if (!meshData.sharedAnimationsUrl) {
      return meshClips;
    }
    return mergeSoldierClips(meshClips, sharedGltf.animations);
  }, [meshClips, meshData.sharedAnimationsUrl, sharedGltf.animations]);
}
