import type { CircleBlocker } from './resolve-player-collision';
import type { ScenarioConfig } from '@/modules/scenarios';
import type { Team } from '@/modules/teams';
import { spawnKey } from '@/modules/scenarios';
import { PLAYER_RADIUS } from '../constants/player';

const NPC_BODY_RADIUS = PLAYER_RADIUS;

/** Static XZ discs for every scenario spawn except the local player's slot. */
export function npcBlockersFromScenario(
  scenario: ScenarioConfig,
  skipKey: string,
  radius: number = NPC_BODY_RADIUS,
): CircleBlocker[] {
  const blockers: CircleBlocker[] = [];
  const teams = Object.keys(scenario.teamSpawns) as Team[];

  for (const team of teams) {
    const spawns = scenario.teamSpawns[team] ?? [];
    for (let index = 0; index < spawns.length; index += 1) {
      const key = spawnKey(team, index);
      if (key === skipKey) {
        continue;
      }
      const position = spawns[index]!;
      blockers.push({
        x: position[0],
        z: position[2],
        radius,
        entityId: key,
      });
    }
  }

  return blockers;
}
