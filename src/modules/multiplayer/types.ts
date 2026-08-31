import type { MaxPerTeam } from '@/modules/game/constants/play-defaults';
import type { ScenarioId } from '@/modules/scenarios';
import type { SoldierSkinId } from '@/modules/soldiers';
import type { Team } from '@/modules/teams';

/** Seat / room caps mirror `DEFAULT_MAX_PER_TEAM` in play-defaults. */
export interface TeamSeatSummary {
  count: number;
  max: MaxPerTeam;
  open: boolean;
}

export interface RoomSnapshot {
  id: string;
  phase: 'waiting' | 'in_progress' | 'ended';
  canJoin: boolean;
  maxPerTeam: MaxPerTeam;
  playerCount: number;
  /** ISO timestamp the room code expires at. */
  expiresAt: string;
  scenario?: ScenarioId;
  teams: Record<Team, TeamSeatSummary>;
}

export interface CreateRoomOptions {
  team?: Team;
  skin?: SoldierSkinId;
  scenario?: ScenarioId;
}

/** `RoomSnapshot` + one-time `hostToken` returned by `POST /api/v1/room`. */
export interface CreateRoomResponse extends RoomSnapshot {
  hostToken: string;
}

/** What the create-room client keeps after `POST /api/v1/room`. */
export interface CreateRoomResult {
  roomId: string;
  hostToken: string;
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
