import type { MatchState } from '../schema/match-state';
import type { PlayerState } from '../schema/player-state';
import type { ScenarioConfig, ScenarioId, Vec3 } from '@/modules/scenarios';
import type { Team } from '@/modules/teams';
import { DEFAULT_MAX_HP } from '@/modules/combat/constants/health';
import { getScenarioById, spawnYawFor } from '@/modules/scenarios';

export function placePlayerAtSpawn(
  player: PlayerState,
  spawn: readonly [number, number, number],
  yaw: number,
): void {
  player.x = spawn[0];
  player.y = spawn[1];
  player.z = spawn[2];
  player.rotY = yaw;
}

export function resolveTeamSpawn(
  scenario: ScenarioConfig,
  team: Team,
  spawnIndex: number,
): { spawn: Vec3; yaw: number } {
  const spawns = scenario.teamSpawns[team];
  const spawn = spawns?.[spawnIndex % (spawns?.length ?? 1)] ?? [0, 0, 0];
  return {
    spawn,
    yaw: spawnYawFor(scenario, team, spawn),
  };
}

/** Reset HP / eliminated and teleport every player to their join spawn slot. */
export function respawnMatchPlayers(
  state: MatchState,
  spawnIndexBySession: ReadonlyMap<string, number>,
): void {
  const scenario = getScenarioById(state.scenario as ScenarioId);

  for (const [sessionId, player] of state.players) {
    const team = player.team as Team;
    const spawnIndex = spawnIndexBySession.get(sessionId) ?? 0;
    const { spawn, yaw } = resolveTeamSpawn(scenario, team, spawnIndex);
    placePlayerAtSpawn(player, spawn, yaw);
    player.hp = DEFAULT_MAX_HP;
    player.eliminated = false;
  }
}
