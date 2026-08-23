import type { HitboxPreset, HitboxPresetId } from './types';

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
