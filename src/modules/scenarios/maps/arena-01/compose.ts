import type { ArenaLayout, ScenarioConfig, ScenarioMeta } from '@/modules/scenarios/types';
import { arena01Environment } from './environment';
import { arena01Greenery } from './greenery';
import { arena01GroundFloors } from './ground';
import { arena01Collisions, arena01Holes, arena01HouseFloors, arena01Walls } from './houses';
import { arena01Spawns } from './spawns';

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
  floorZones: [...arena01GroundFloors, ...arena01HouseFloors],
  walls: {
    assetId: 'cliff_side',
    thickness: 1.2,
    height: 8,
  },
  wallSegments: arena01Walls,
  props: arena01Greenery,
  collisionSegments: arena01Collisions,
  collisionHoles: arena01Holes,
};

/** Ruined Village — 100×50 m pistol TDM map. */
export const arena01: ScenarioConfig = {
  ...arena01Meta,
  ...arena01Layout,
  ...arena01Spawns,
  ...arena01Environment,
};
