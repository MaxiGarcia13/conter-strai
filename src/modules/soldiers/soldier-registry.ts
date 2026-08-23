import type { HitboxPreset, HitboxPresetId, SoldierSkin, SoldierSkinId } from './types';
import { useGLTF } from '@react-three/drei';

export const soldierSkins: Record<SoldierSkinId, SoldierSkin> = {
  'swat-guy': {
    meshData: {
      modelUrl: '/assets/soldiers/swat-soldier.glb',
      scale: 1,
      viewModelScale: 1.15,
      animations: {
        idle: 'idle',
        walk: 'walk',
        run: 'run',
      },
    },
    hitboxPresetId: 'humanoid-standard',
  },
};

export const hitboxPresets: Record<HitboxPresetId, HitboxPreset> = {
  'humanoid-standard': {
    id: 'humanoid-standard',
    parts: [
      { zone: 'head', kind: 'sphere', offset: [0, 1.55, 0], radius: 0.14 },
      { zone: 'body', kind: 'box', offset: [0, 1.05, 0], size: [0.45, 0.6, 0.28] },
      { zone: 'limb', kind: 'box', offset: [0, 0.35, 0], size: [0.5, 0.7, 0.32] },
    ],
  },
};

// Start loading before DeferredAfterLoad mounts so useGLTF does not re-trigger
// drei's loading manager (which would update LoadingReporter during render).
for (const { meshData } of Object.values(soldierSkins)) {
  useGLTF.preload(meshData.modelUrl);
}
