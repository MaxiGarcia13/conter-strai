import type { SoldierDefinition, SoldierId } from './types';
import { useGLTF } from '@react-three/drei';

export const soldiers: Record<SoldierId, SoldierDefinition> = {
  'swat-guy': {
    id: 'swat-guy',
    modelUrl: '/assets/soldiers/swat-guy.glb',
    scale: 0.01,
  },
};

// Start loading before DeferredAfterLoad mounts so useGLTF does not re-trigger
// drei's loading manager (which would update LoadingReporter during render).
for (const { modelUrl } of Object.values(soldiers)) {
  useGLTF.preload(modelUrl);
}
