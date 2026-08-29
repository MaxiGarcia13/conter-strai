import type { MatchState } from '../schema/match-state';
import type { RoomSnapshot, TeamSeatSummary } from '../types';
import type { ScenarioId } from '@/modules/scenarios';
import type { Team } from '@/modules/teams';
import { DEFAULT_MAX_PER_TEAM, DEFAULT_SCENARIO_ID } from '@/modules/game/constants/play-defaults';
import { TEAMS } from '@/modules/teams';

function seatSummary(count: number, max: number): TeamSeatSummary {
  return {
    count,
    max: max as TeamSeatSummary['max'],
    open: count < max,
  };
}

function countTeam(state: MatchState, team: Team): number {
  let count = 0;
  for (const [, player] of state.players) {
    if (player.team === team) {
      count++;
    }
  }
  return count;
}

function teamSeats(
  maxPerTeam: number,
  counts: Partial<Record<Team, number>> = {},
): Record<Team, TeamSeatSummary> {
  return Object.fromEntries(
    TEAMS.map((team) => [team, seatSummary(counts[team] ?? 0, maxPerTeam)]),
  ) as Record<Team, TeamSeatSummary>;
}

/** Empty waiting-room snapshot for `POST /api/v1/room` before anyone joins. */
export function createEmptyRoomSnapshot(
  roomCode: string,
  expiresAt: string,
  scenario: ScenarioId = DEFAULT_SCENARIO_ID,
): RoomSnapshot {
  return {
    id: roomCode,
    phase: 'waiting',
    canJoin: true,
    maxPerTeam: DEFAULT_MAX_PER_TEAM,
    playerCount: 0,
    expiresAt,
    scenario,
    teams: teamSeats(DEFAULT_MAX_PER_TEAM),
  };
}

/** Encode authoritative match state into the lobby REST `RoomSnapshot` DTO. */
export function toRoomSnapshot(
  roomCode: string,
  state: MatchState,
  expiresAt: string,
): RoomSnapshot {
  const maxPerTeam = state.maxPerTeam || DEFAULT_MAX_PER_TEAM;
  const playerCount = state.players.size;
  // Lobby REST only exposes waiting | in_progress | ended — deploy/countdown lock joins.
  const phase: RoomSnapshot['phase'] = state.roundPhase === 'waiting' || state.roundPhase === 'ended'
    ? state.roundPhase
    : 'in_progress';
  const maxClients = maxPerTeam * 2;

  const counts = Object.fromEntries(
    TEAMS.map((team) => [team, countTeam(state, team)]),
  ) as Record<Team, number>;

  return {
    id: roomCode,
    phase,
    canJoin: phase === 'waiting' && playerCount < maxClients,
    maxPerTeam: maxPerTeam as RoomSnapshot['maxPerTeam'],
    playerCount,
    expiresAt,
    scenario: state.scenario as ScenarioId,
    teams: teamSeats(maxPerTeam, counts),
  };
}
