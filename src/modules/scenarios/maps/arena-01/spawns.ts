import type { SpawnerConfig } from '@/modules/scenarios/types';

export const arena01Spawns: SpawnerConfig = {
  teamSpawns: {
    soldier: [
      [-40, 0, -8],
      [-45, 0, -8],
      [-32, 0, -8],
      [-28, 0, -6],
    ],
    civilian: [
      [24, 0, 20],
      [24, 0, 18],
      [22, 0, 20],
      [20, 0, 18],
    ],
  },
};
