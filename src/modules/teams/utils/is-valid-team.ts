import type { Team } from '../types';
import { TEAMS } from '../constants/teams';

export function isValidTeam(value: unknown): value is Team {
  return typeof value === 'string' && (TEAMS as readonly string[]).includes(value);
}
