import type { ScenarioConfig } from '@/modules/scenarios/types';
import { arena01Floors, arena01Walls } from './layout';

/** Ruined Village — 100×50 m pistol TDM map. */
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
  floorZones: arena01Floors,
  walls: {
    assetId: 'cliff_side',
    thickness: 1.2,
    height: 8,
  },
  wallSegments: arena01Walls,
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
