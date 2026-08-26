import type { RoomSnapshot, TeamSeatSummary } from '../types';
import { ROOM_ID_LENGTH } from '@/modules/lobby/constants/room-id';
import { isValidScenario } from '@/modules/scenarios/utils/is-valid-scenario';
import { TEAMS } from '@/modules/teams';

const PHASES: ReadonlySet<RoomSnapshot['phase']> = new Set(['waiting', 'in_progress', 'ended']);

function isTeamSeatSummary(value: unknown): value is TeamSeatSummary {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }
  const seat = value as Partial<TeamSeatSummary>;
  return typeof seat.count === 'number' && seat.max === 4 && typeof seat.open === 'boolean';
}

/** Decode lobby REST `RoomSnapshot` JSON, or `null` if invalid. */
export function decodeRoomSnapshot(value: unknown): RoomSnapshot | null {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  const body = value as Record<string, unknown>;
  if (typeof body.id !== 'string' || body.id.length !== ROOM_ID_LENGTH) {
    return null;
  }
  if (typeof body.phase !== 'string' || !PHASES.has(body.phase as RoomSnapshot['phase'])) {
    return null;
  }
  if (typeof body.canJoin !== 'boolean' || body.maxPerTeam !== 4 || typeof body.playerCount !== 'number') {
    return null;
  }
  if (body.teams === null || typeof body.teams !== 'object' || Array.isArray(body.teams)) {
    return null;
  }

  const teams = body.teams as Record<string, unknown>;
  if (!TEAMS.every((team) => isTeamSeatSummary(teams[team]))) {
    return null;
  }

  const snapshot: RoomSnapshot = {
    id: body.id,
    phase: body.phase as RoomSnapshot['phase'],
    canJoin: body.canJoin,
    maxPerTeam: 4,
    playerCount: body.playerCount,
    teams: {
      civilian: teams.civilian as TeamSeatSummary,
      soldier: teams.soldier as TeamSeatSummary,
    },
  };

  if (body.scenario !== undefined) {
    if (!isValidScenario(body.scenario)) {
      return null;
    }
    snapshot.scenario = body.scenario;
  }

  return snapshot;
}
