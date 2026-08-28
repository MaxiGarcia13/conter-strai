import type { ScenarioLighting } from '../types';

/** Sun position feeding the directional light and its shadow frustum. */
export const DEFAULT_SUN_POSITION: [number, number, number] = [40, 60, 20];

export const DEFAULT_LIGHTING: ScenarioLighting = {
  ambient: 0.75,
  sunIntensity: 1.2,
  sunPosition: DEFAULT_SUN_POSITION,
  hemisphere: {
    skyColor: '#c3d5e8',
    groundColor: '#4c463d',
    intensity: 5,
  },
  toneMapping: true,
  toneMappingExposure: 1.1,
};
