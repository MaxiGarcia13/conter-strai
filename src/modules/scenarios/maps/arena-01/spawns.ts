import type { SpawnerConfig } from '@/modules/scenarios/types';

export const arena01Spawns: SpawnerConfig = {
  teamSpawns: {
    soldier: [
      [-40, 0, -8],
      [-35, 0, 0],
      [-45, 0, -8],
      [-35, 0, 0],
    ],
    civilian: [
      [24, 0, 20],
      [24, 0, 18],
      [22, 0, 20],
      [22, 0, 20],
    ],
  },
};
