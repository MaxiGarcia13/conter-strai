import type { SoldierSkin, SoldierSkinId } from './types';
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
        jump: 'jump',
        kneel: 'kneel',
        dying: 'dying',
        reloading: 'reloading',
        shooting: 'shooting',
      },
    },
    hitboxPresetId: 'humanoid-standard',
  },
};

// Start loading before DeferredAfterLoad mounts so useGLTF does not re-trigger
// drei's loading manager (which would update LoadingReporter during render).
for (const { meshData } of Object.values(soldierSkins)) {
  useGLTF.preload(meshData.modelUrl);
}
