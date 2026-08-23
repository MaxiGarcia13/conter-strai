import type {
  ArenaEnvironment,
  ArenaLayout,
  ScenarioConfig,
  ScenarioMeta,
  SpawnerConfig,
} from '@/modules/scenarios/types';
import { arena01Collisions, arena01Floors, arena01Walls } from './layout';

const arena01Meta: ScenarioMeta = {
  id: 'arena-01',
  name: 'Ruined Village',
  theme: 'ruined-village',
};

const arena01Layout: ArenaLayout = {
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
  collisionSegments: arena01Collisions,
};

const arena01Spawns: SpawnerConfig = {
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
};

const arena01Environment: ArenaEnvironment = {
  lighting: {
    ambient: 0.6,
    sunIntensity: 1.2,
  },
};

/** Ruined Village — 100×50 m pistol TDM map. */
export const arena01: ScenarioConfig = {
  ...arena01Meta,
  ...arena01Layout,
  ...arena01Spawns,
  ...arena01Environment,
};
