import type { Vec3 } from './layout';
import type { Team } from '@/modules/teams';

export type SpawnPoint = Vec3;

export interface SpawnerConfig {
  teamSpawns: Record<Team, SpawnPoint[]>;
  /** Yaw (radians) per team; individual spawns fall back to facing map center. */
  spawnYaw?: Record<Team, number>;
}
