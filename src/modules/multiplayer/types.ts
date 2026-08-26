import type { ScenarioId } from '@/modules/scenarios';
import type { SoldierSkinId } from '@/modules/soldiers';
import type { Team } from '@/modules/teams';

/** Seat / room caps mirror `DEFAULT_MAX_PER_TEAM` in play-defaults. */
export interface TeamSeatSummary {
  count: number;
  max: 4;
  open: boolean;
}

export interface RoomSnapshot {
  id: string;
  phase: 'waiting' | 'in_progress' | 'ended';
  canJoin: boolean;
  maxPerTeam: 4;
  playerCount: number;
  scenario?: ScenarioId;
  teams: Record<Team, TeamSeatSummary>;
}

export interface CreateRoomOptions {
  team?: Team;
  skin?: SoldierSkinId;
  scenario?: ScenarioId;
}

export interface SeatClaimOptions {
  team: Team;
  skin: SoldierSkinId;
}

/** Colyseus `ISeatReservation` fields needed by `consumeSeatReservation`. */
export interface SeatReservation {
  name: string;
  sessionId: string;
  roomId: string;
  publicAddress?: string;
  processId?: string;
  reconnectionToken?: string;
  devMode?: boolean;
}

export interface ClaimSeatResponse {
  snapshot: RoomSnapshot;
  reservation: SeatReservation;
}
