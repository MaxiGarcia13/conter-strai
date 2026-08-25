import type { HitboxPreset, HitboxPresetId } from './types';

/**
 * Approximate standing humanoid (~1.8 m with helmet). Tuned so SWAT helmet
 * crown / vest depth still register — undersized head spheres let rays pass
 * through to walls behind the dummy.
 */
export const hitboxPresets: Record<HitboxPresetId, HitboxPreset> = {
  'humanoid-standard': {
    id: 'humanoid-standard',
    parts: [
      {
        zone: 'head',
        kind: 'sphere',
        offset: [0, 1.65, 0],
        radius: 0.16,
      },
      {
        zone: 'body',
        kind: 'box',
        offset: [0, 1.05, 0],
        size: [0.5, 0.8, 0.4],
      },
      {
        zone: 'limb',
        kind: 'box',
        offset: [0, 0.32, 0],
        size: [0.3, 0.65, 0.36],
      },
    ],
  },
};
