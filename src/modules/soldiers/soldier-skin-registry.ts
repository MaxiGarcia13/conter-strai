import type { SoldierSkin, SoldierSkinId } from './types';
import { useGLTF } from '@react-three/drei';

export const soldierSkins: Record<SoldierSkinId, SoldierSkin> = {
  'remy': {
    meshData: {
      modelUrl: '/assets/characters/civilians/remy.glb',
      scale: 1,
      viewModelScale: 1.15,
      sharedAnimationsUrl: '/assets/characters/shared/base-animations.glb',
      // Head bone sits low vs eyes; nudge FPS lens up so arms match SWAT framing.
      fpsView: { eyeOffsetY: 0.1 },
      animations: {
        idle: 'idle',
        walk: 'walk',
        run: 'run',
        crouchWalking: 'crouch-walking',
        jump: 'jump',
        kneel: 'kneel',
        dying: 'dying',
      },
    },
    hitboxPresetId: 'humanoid-standard',
  },
  'swat-1': {
    meshData: {
      modelUrl: '/assets/characters/soldiers/swat-1.glb',
      scale: 1,
      viewModelScale: 1.15,
      sharedAnimationsUrl: '/assets/characters/shared/base-animations.glb',
      animations: {
        idle: 'idle',
        walk: 'walk',
        run: 'run',
        crouchWalking: 'crouch-walking',
        jump: 'jump',
        kneel: 'kneel',
        dying: 'dying',
      },
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
