import type { MatchState } from '../schema/match-state';
import type { Team } from '@/modules/teams';
import { DEFAULT_MAX_PER_TEAM } from '@/modules/game/constants/play-defaults';
import { opposingTeam, TEAMS } from '@/modules/teams';

export function teamCount(state: MatchState, team: Team): number {
  let count = 0;
  for (const [, player] of state.players) {
    if (player.team === team) {
      count++;
    }
  }
  return count;
}

/** Prefer `preferred` when that side still has capacity; otherwise first open team. */
export function assignTeam(state: MatchState, preferred?: Team): Team | null {
  if (preferred) {
    if (teamCount(state, preferred) < DEFAULT_MAX_PER_TEAM) {
      return preferred;
    }
  }
  for (const team of TEAMS) {
    if (teamCount(state, team) < DEFAULT_MAX_PER_TEAM) {
      return team;
    }
  }
  return null;
}

/** Winning team when the other side has no living players; otherwise null. */
export function checkTeamWipe(state: MatchState): Team | null {
  for (const team of TEAMS) {
    let hasAlive = false;
    for (const [, player] of state.players) {
      if (player.team === team && !player.eliminated) {
        hasAlive = true;
        break;
      }
    }
    if (!hasAlive) {
      return opposingTeam(team);
    }
  }
  return null;
}
