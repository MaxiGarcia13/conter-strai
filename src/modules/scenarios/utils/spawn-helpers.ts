import type { ScenarioConfig, Vec3 } from '../types';
import type { Team } from '@/modules/teams';

/** Yaw (radians) facing map center from a ground position; yaw 0 looks toward −Z. */
export function faceCenterYaw(position: Vec3): number {
  return Math.atan2(position[0], position[2]);
}

export function spawnYawFor(scenario: ScenarioConfig, team: Team, position: Vec3): number {
  return scenario.spawnYaw?.[team] ?? faceCenterYaw(position);
}

export interface TeamSpawn {
  position: Vec3;
  yaw: number;
}

export function getTeamSpawn(scenario: ScenarioConfig, team: Team, index = 0): TeamSpawn {
  const positions = scenario.teamSpawns[team];
  const safeIndex = index < positions.length ? index : 0;
  const position = positions[safeIndex];
  return { position, yaw: spawnYawFor(scenario, team, position) };
}

export function spawnKey(team: Team, index: number): string {
  return `${team}-${index}`;
}
