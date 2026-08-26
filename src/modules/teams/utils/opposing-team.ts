import type { Team } from '../types';
import { TEAMS } from '../constants/teams';

/** The other side in a two-team match. */
export function opposingTeam(team: Team): Team {
  const other = TEAMS.find((candidate) => candidate !== team);
  if (!other) {
    throw new Error(`No opposing team for ${team}`);
  }
  return other;
}
