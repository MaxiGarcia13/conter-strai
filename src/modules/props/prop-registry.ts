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
  concreteRoadBarrier: {
    id: 'concreteRoadBarrier',
    modelUrl: '/assets/Infrastructure/concrete_road_barrier.glb',
    scale: 1,
    collidable: true,
    collisionRadius: 0.6,
  },
};

// Preload before ScenarioScene mounts so useGLTF does not re-trigger drei's
// loading manager (which would update LoadingReporter during render).
for (const { modelUrl } of Object.values(props)) {
  useGLTF.preload(modelUrl);
}
