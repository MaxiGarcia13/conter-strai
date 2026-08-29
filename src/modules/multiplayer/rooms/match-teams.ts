import type { MatchState } from '../schema/match-state';
import type { SoldierSkinId } from '@/modules/soldiers/types';
import type { Team } from '@/modules/teams/types';
import { DEFAULT_MAX_PER_TEAM } from '@/modules/game/constants/play-defaults';
import { TEAM_SKINS } from '@/modules/teams/constants/team-skins';
import { TEAMS } from '@/modules/teams/constants/teams';
import { opposingTeam } from '@/modules/teams/utils/opposing-team';

type Rng = () => number;

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

/**
 * When >= 2 players are connected but one team is empty, re-split the lobby as
 * evenly as possible so a round can be won by team wipe. Returns whether teams
 * were shuffled; `rng` is injectable for seeded unit tests.
 */
export function shuffleTeamsIfNoOpponents(state: MatchState, rng: Rng = Math.random): boolean {
  const sessionIds = [...state.players.keys()];
  if (sessionIds.length < 2 || TEAMS.every((team) => teamCount(state, team) > 0)) {
    return false;
  }

  const majorCount = Math.ceil(sessionIds.length / 2);
  const majorTeam = rng() < 0.5 ? TEAMS[0] : TEAMS[1];
  const shuffled = shuffle(sessionIds, rng);

  shuffled.forEach((sessionId, index) => {
    const player = state.players.get(sessionId);
    if (!player) {
      return;
    }
    const team = index < majorCount ? majorTeam : opposingTeam(majorTeam);
    player.team = team;
    if (!TEAM_SKINS[team].includes(player.skin as SoldierSkinId)) {
      player.skin = TEAM_SKINS[team][0];
    }
  });

  return true;
}

/** In-place Fisher–Yates over a copy so the caller keeps a deterministic order. */
function shuffle<T>(items: readonly T[], rng: Rng): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Reassign spawn slots to `0..teamSize-1` per team so moved players land on the
 * first spawns of their new side. Session ids listed in deterministic order.
 */
export function recalculateSpawnIndices(
  state: MatchState,
  spawnIndexBySession: Map<string, number>,
): void {
  for (const team of TEAMS) {
    const sessionIds = [...state.players]
      .filter(([, player]) => player.team === team)
      .map(([sessionId]) => sessionId)
      .sort();
    sessionIds.forEach((sessionId, index) => {
      spawnIndexBySession.set(sessionId, index);
    });
  }
}
