import type {
  ArenaEnvironment,
  ArenaLayout,
  ScenarioConfig,
  ScenarioMeta,
  SpawnerConfig,
} from '@/modules/scenarios/types';
import { arena01Collisions, arena01Floors, arena01Holes, arena01Walls } from './layout';

const arena01Meta: ScenarioMeta = {
  id: 'arena-01',
  name: 'Ruined Village',
  theme: 'ruined-village',
  previewImageUrl: '/assets/scenarios/arena-01.png',
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
  collisionHoles: arena01Holes,
};

const arena01Spawns: SpawnerConfig = {
  teamSpawns: {
    soldier: [
      [-40, 0, -8],
      [-35, 0, 0],
      [-45, 0, -8],
      [-35, 0, 0],
    ],
    civilian: [
      [46, 0, -8],
      [46, 0, -14],
      [35, 0, -8],
      [35, 0, -14],
    ],
  },
};

const arena01Environment: ArenaEnvironment = {
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
};

/** Ruined Village — 100×50 m pistol TDM map. */
export const arena01: ScenarioConfig = {
  ...arena01Meta,
  ...arena01Layout,
  ...arena01Spawns,
  ...arena01Environment,
};
