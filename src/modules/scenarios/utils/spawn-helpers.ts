import type { ScenarioConfig, Vec3 } from '../types';
import type { Team } from '@/modules/teams';

/** Yaw (radians) facing map center from a ground position; yaw 0 looks toward −Z. */
function faceCenterYaw(position: Vec3): number {
  return Math.atan2(position[0], position[2]);
}

export function spawnYawFor(scenario: ScenarioConfig, team: Team, position: Vec3): number {
  return scenario.spawnYaw?.[team] ?? faceCenterYaw(position);
}

export function spawnKey(team: Team, index: number): string {
  return `${team}-${index}`;
}
