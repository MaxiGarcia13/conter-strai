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
      [46, 0, -8],
      [46, 0, -14],
      [35, 0, -8],
      [35, 0, -14],
    ],
  },
};
