import type { ScenarioConfig } from './types';

export const arena01: ScenarioConfig = {
  id: 'arena-01',
  name: 'Ruined Village',
  theme: 'ruined-village',
  bounds: {
    width: 100,
    depth: 50,
    wallHeight: 3.5,
  },
  floor: {
    assetId: 'forrest_ground',
    repeat: [25, 12.5],
  },
  walls: {
    assetId: 'coral_fort_wall',
    thickness: 0.5,
  },
  props: [],
  teamSpawns: {
    puma: [
      [-46, 0, -8],
      [-46, 0, 8],
    ],
    lion: [
      [46, 0, -8],
      [46, 0, 8],
    ],
  },
  lighting: {
    ambient: 0.6,
    sunIntensity: 1.2,
  },
};
