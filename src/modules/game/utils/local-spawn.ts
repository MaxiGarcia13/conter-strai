import type { ScenarioConfig, Vec3 } from '@/modules/scenarios';
import type { Team } from '@/modules/teams';
import { spawnKey, spawnYawFor } from '@/modules/scenarios';

import { DEFAULT_LOCAL_SPAWN_INDEX, DEFAULT_LOCAL_TEAM } from '../constants/player';

/** Everything the local player needs to claim a team spawn slot. */
export interface LocalSpawn {
  /** Spawn slot key — ScenarioSoldiers skips it so no NPC duplicates the player. */
  key: string;
  position: Vec3;
  yaw: number;
}

export function resolveLocalSpawn(scenario: ScenarioConfig, team: Team = DEFAULT_LOCAL_TEAM): LocalSpawn {
  const teamSpawns = scenario.teamSpawns[team];
  if (!teamSpawns || teamSpawns.length === 0) {
    throw new Error(`Scenario ${scenario.id} has no ${team} spawns`);
  }
  const index = Math.min(DEFAULT_LOCAL_SPAWN_INDEX, teamSpawns.length - 1);
  const position = teamSpawns[index]!;
  return {
    key: spawnKey(team, index),
    position,
    yaw: spawnYawFor(scenario, team, position),
  };
}
