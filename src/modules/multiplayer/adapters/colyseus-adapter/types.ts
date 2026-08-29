import type { Room } from '@colyseus/sdk';
import type { HitZone } from '@/modules/combat';
import type { MatchRoundPhase, MatchState } from '@/modules/multiplayer/schema';
import type { SeatReservation } from '@/modules/multiplayer/types';
import type { RemotePoseMessage } from '@/modules/multiplayer/utils/syncable-remote-pose';
import type { SoldierSkinId } from '@/modules/soldiers';
import type { Team } from '@/modules/teams';

export type { RemotePoseMessage };

/** Throttle window for local transform sync (~20 Hz), matching the design. */
export const TRANSFORM_SYNC_INTERVAL_MS = 50;

/** Local transform inputs; `y` is always 0 and `rotY` comes from `yaw`. */
export interface TransformSyncPayload {
  x: number;
  z: number;
  yaw: number;
}

export interface ShotPayload {
  targetId: string;
  zone: HitZone;
}

export interface PosePayload {
  sessionId: string;
  pose: RemotePoseMessage;
}

export interface FirePayload {
  sessionId: string;
}

/** Flattened, store-friendly view of one connected player (schema fields). */
export interface MatchPlayerSnapshot {
  sessionId: string;
  x: number;
  y: number;
  z: number;
  rotY: number;
  hp: number;
  eliminated: boolean;
  team: Team;
  skin: SoldierSkinId;
}

export interface PlayersUpdatePayload {
  localSessionId: string;
  players: MatchPlayerSnapshot[];
}

export interface RoundUpdatePayload {
  phase: MatchRoundPhase;
  winner: string;
  countdown: number;
}

export interface InitMatchOptions {
  /** Colyseus internal room id for `joinById` — ignored when a reservation is set. */
  roomId: string;
  /** Reserved seat from `PUT /api/v1/room/{id}`; consumed when present. */
  reservation?: SeatReservation;
  /**
   * `room.reconnectionToken` (`roomId:token`) from a prior join — used after
   * hard navigations (waiting → /play) while the server still holds the seat.
   */
  reconnectionToken?: string;
  /** Preferred team/skin passed to the server `onJoin`. */
  options?: { team?: Team; skin?: SoldierSkinId };
  /** Overrides `PUBLIC_COLYSEUS_URL` (tests / unusual endpoints). */
  endpoint?: string;
}

export interface MoveMessage {
  x: number;
  y: number;
  z: number;
  rotY: number;
}

export type PlayerUpdateListener = (payload: PlayersUpdatePayload) => void;
export type RoundUpdateListener = (payload: RoundUpdatePayload) => void;
export type PoseListener = (payload: PosePayload) => void;
export type FireListener = (payload: FirePayload) => void;
export type LeaveListener = (code: number) => void;
export type RoomClosedListener = () => void;

/** The `@colyseus/sdk` room whose state is the authoritative `MatchState`. */
export type MatchRoom = Room<any, MatchState>;

/**
 * Live handle for a joined match — the only surface game wiring needs.
 */
export interface MatchHandle {
  /** Underlying Colyseus room; prefer the facade methods over raw use. */
  room: MatchRoom;
  roomId: string;
  sessionId: string;
  localPlayerId: string;
  /** `roomId:token` for `client.reconnect` after a hard navigation. */
  reconnectionToken: string;
  /** Latest snapshot (incl. self) rebuilt on every server state change. */
  players: MatchPlayerSnapshot[];
  syncTransform: (transform: TransformSyncPayload) => void;
  sendShot: (shot: ShotPayload) => void;
  sendPose: (pose: RemotePoseMessage) => void;
  sendFire: () => void;
  /** Host-only: flips the room from `waiting` | `ended` into the countdown. */
  startRound: () => void;
  playerReady: () => void;
  restartRound: () => void;
  /** Voluntary lobby exit — server drops the seat immediately while `waiting`. */
  leaveLobby: () => void;
  onPlayerUpdate: (listener: PlayerUpdateListener) => () => void;
  onRoundUpdate: (listener: RoundUpdateListener) => () => void;
  /** Cosmetic peer pose events (jump / kneel / clear) — no authority. */
  onPose: (listener: PoseListener) => () => void;
  /** Cosmetic peer gunshot events — spatial SFX only, no authority. */
  onFire: (listener: FireListener) => () => void;
  onLeave: (listener: LeaveListener) => () => void;
  /** Fired when the room is disposed (Home / Close Room) — all clients should exit. */
  onRoomClosed: (listener: RoomClosedListener) => () => void;
  leave: () => Promise<number>;
}
