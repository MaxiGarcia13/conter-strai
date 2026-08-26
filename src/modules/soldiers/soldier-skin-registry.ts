import type { SoldierSkin, SoldierSkinId } from './types';
import { useGLTF } from '@react-three/drei';

const SHARED_ANIMATIONS_URL = '/assets/characters/shared/base-animations.glb';

const SHARED_CLIP_MAP = {
  idle: 'idle-shooting',
  walk: 'walk',
  run: 'run',
  crouchWalking: 'crouch-walking',
  jump: 'jump',
  kneel: 'kneel',
  dying: 'dying',
  reloading: 'reloading',
  reloadingKneel: 'reloading-kneel',
  shooting: 'shooting',
  hitReaction: 'hit-reaction',
} as const;

export const soldierSkins: Record<SoldierSkinId, SoldierSkin> = {
  'remy': {
    meshData: {
      modelUrl: '/assets/characters/civilians/remy.glb',
      scale: 1,
      viewModelScale: 1.15,
      sharedAnimationsUrl: SHARED_ANIMATIONS_URL,
      // Head bone sits low vs eyes; nudge FPS lens up so arms match SWAT framing.
      fpsView: { eyeOffsetY: 0.1 },
      animations: { ...SHARED_CLIP_MAP },
    },
    hitboxPresetId: 'humanoid-standard',
  },
  'james': {
    meshData: {
      modelUrl: '/assets/characters/civilians/james.glb',
      scale: 1,
      viewModelScale: 1.15,
      sharedAnimationsUrl: SHARED_ANIMATIONS_URL,
      fpsView: { eyeOffsetY: 0.1 },
      animations: { ...SHARED_CLIP_MAP },
    },
    hitboxPresetId: 'humanoid-standard',
  },
  'liza': {
    meshData: {
      modelUrl: '/assets/characters/civilians/liza.glb',
      scale: 1,
      viewModelScale: 1.15,
      sharedAnimationsUrl: SHARED_ANIMATIONS_URL,
      fpsView: { eyeOffsetY: 0.1 },
      animations: { ...SHARED_CLIP_MAP },
    },
    hitboxPresetId: 'humanoid-standard',
  },
  'swat-1': {
    meshData: {
      modelUrl: '/assets/characters/soldiers/swat-1.glb',
      scale: 1,
      viewModelScale: 1.15,
      sharedAnimationsUrl: SHARED_ANIMATIONS_URL,
      animations: { ...SHARED_CLIP_MAP },
    },
    hitboxPresetId: 'humanoid-standard',
  },
  'swat-2': {
    meshData: {
      modelUrl: '/assets/characters/soldiers/swat-2.glb',
      scale: 1,
      viewModelScale: 1.15,
      sharedAnimationsUrl: SHARED_ANIMATIONS_URL,
      animations: { ...SHARED_CLIP_MAP },
      fpsView: { eyeOffsetY: 0.1 },
    },
    hitboxPresetId: 'humanoid-standard',
  },
  'swat-3': {
    meshData: {
      modelUrl: '/assets/characters/soldiers/swat-3.glb',
      scale: 1,
      viewModelScale: 1.15,
      sharedAnimationsUrl: SHARED_ANIMATIONS_URL,
      animations: { ...SHARED_CLIP_MAP },
      fpsView: { eyeOffsetY: 0.1 },
    },
    hitboxPresetId: 'humanoid-standard',
  },
};

// Start loading before DeferredAfterLoad mounts so useGLTF does not re-trigger
// drei's loading manager (which would update LoadingReporter during render).
for (const { meshData } of Object.values(soldierSkins)) {
  useGLTF.preload(meshData.modelUrl);
  if (meshData.sharedAnimationsUrl) {
    useGLTF.preload(meshData.sharedAnimationsUrl);
  }
}
