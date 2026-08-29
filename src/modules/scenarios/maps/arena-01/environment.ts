import type { ArenaEnvironment } from '@/modules/scenarios/types';

export const arena01Environment: ArenaEnvironment = {
  lighting: {
    ambient: 0.75,
    sunIntensity: 1.2,
    sunPosition: [40, 60, 20],
    hemisphere: {
      skyColor: '#c3d5e8',
      groundColor: '#4c463d',
      intensity: 0.7,
    },
    toneMapping: true,
    toneMappingExposure: 1.1,
  },
  sky: {
    type: 'gradient',
  },
  fog: {
    color: '#c3d5e8',
    near: 50,
    far: 150,
  },
};
