import type { SeatClaimOptions } from '../types';
import { isValidSkin, isValidTeam, TEAM_SKINS } from '@/modules/teams';

/** Decode PUT seat-claim body `{ team, skin }`, or `null` if invalid. */
export function decodeSeatClaim(value: unknown): SeatClaimOptions | null {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  const body = value as Record<string, unknown>;
  if (!isValidTeam(body.team) || !isValidSkin(body.skin)) {
    return null;
  }
  if (!TEAM_SKINS[body.team].includes(body.skin)) {
    return null;
  }

  return { team: body.team, skin: body.skin };
}
