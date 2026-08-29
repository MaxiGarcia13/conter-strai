import type { PropDefinition } from './types';
import { useGLTF } from '@react-three/drei';

export const props: Record<string, PropDefinition> = {
  jacaranda: {
    id: 'jacaranda',
    modelUrl: '/assets/greenery/jacaranda.glb',
    scale: 0.4,
    collidable: true,
    collisionRadius: 0.9,
  },
};

// Preload before ScenarioScene mounts so useGLTF does not re-trigger drei's
// loading manager (which would update LoadingReporter during render).
for (const { modelUrl } of Object.values(props)) {
  useGLTF.preload(modelUrl);
}
