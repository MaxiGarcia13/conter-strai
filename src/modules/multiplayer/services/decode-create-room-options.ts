import type { CreateRoomOptions } from '../types';
import { isValidScenario } from '@/modules/scenarios/utils/is-valid-scenario';
import { isValidSkin, isValidTeam } from '@/modules/teams';

/** Decode unknown JSON body into create-room options, or `null` if invalid. */
export function decodeCreateRoomOptions(value: unknown): CreateRoomOptions | null {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  const options = value as Record<string, unknown>;

  if (options.team !== undefined && !isValidTeam(options.team)) {
    return null;
  }
  if (options.skin !== undefined && !isValidSkin(options.skin)) {
    return null;
  }
  if (options.scenario !== undefined && !isValidScenario(options.scenario)) {
    return null;
  }

  return {
    ...(options.team !== undefined ? { team: options.team } : {}),
    ...(options.skin !== undefined ? { skin: options.skin } : {}),
    ...(options.scenario !== undefined ? { scenario: options.scenario } : {}),
  };
}
