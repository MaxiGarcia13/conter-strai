import type { PropDefinition } from './types';
import { useGLTF } from '@react-three/drei';
import { glbCdnUrl } from '@/utils/glb-cdn-url';

export const props: Record<string, PropDefinition> = {
  jacaranda: {
    id: 'jacaranda',
    modelUrl: glbCdnUrl('/greenery/jacaranda.glb'),
    scale: 0.4,
    collidable: true,
    collisionRadius: 0.9,
  },
  concreteRoadBarrier: {
    id: 'concreteRoadBarrier',
    modelUrl: glbCdnUrl('/Infrastructure/concrete_road_barrier.glb'),
    scale: 1,
    collidable: true,
    collisionRadius: 0.6,
  },
  coveredCar: {
    id: 'coveredCar',
    modelUrl: glbCdnUrl('/Infrastructure/covered_car.glb'),
    scale: 1,
    collidable: true,
    collisionRadius: 1.2,
  },
};

// Preload before ScenarioScene mounts so useGLTF does not re-trigger drei's
// loading manager (which would update LoadingReporter during render).
for (const { modelUrl } of Object.values(props)) {
  useGLTF.preload(modelUrl);
}
