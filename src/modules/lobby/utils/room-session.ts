import type { SeatReservation } from '@/modules/multiplayer/types';
import type { ScenarioConfig } from '@/modules/scenarios';
import type { SoldierSkinId } from '@/modules/soldiers';
import type { Team } from '@/modules/teams';
import {
  DEFAULT_PLAY_SKIN_ID,
  DEFAULT_ROOM_ROLE,
  DEFAULT_SCENARIO_ID,
  DEFAULT_TEAM,
} from '@/modules/game/constants/play-defaults';
import { isValidScenario } from '@/modules/scenarios/utils/is-valid-scenario';
import { isValidSkin, isValidTeam, TEAM_SKINS } from '@/modules/teams';

export interface RoomSession {
  team: Team;
  skin: SoldierSkinId;
  scenario: ScenarioConfig['id'];
  role: 'host' | 'guest';
  reservation?: SeatReservation;
  /** Persisted after join so `/play` can `client.reconnect` after a hard nav. */
  reconnectionToken?: string;
}

const PREFIX = 'cs:room:';

const DEFAULT_SESSION: RoomSession = {
  team: DEFAULT_TEAM,
  skin: DEFAULT_PLAY_SKIN_ID,
  scenario: DEFAULT_SCENARIO_ID,
  role: DEFAULT_ROOM_ROLE,
};

export function writeRoomSession(roomId: string, data: RoomSession) {
  sessionStorage.setItem(`${PREFIX}${roomId}`, JSON.stringify(data));
}

export function clearRoomSession(roomId: string) {
  sessionStorage.removeItem(`${PREFIX}${roomId}`);
}

export function readRoomSession(roomId: string): RoomSession | null {
  const raw = sessionStorage.getItem(`${PREFIX}${roomId}`);
  if (!raw)
    return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (!isRoomSession(value)) {
      return null;
    }
    return value;
  } catch {
    return null;
  }
}

export function resolveRoomSession(roomId: string): RoomSession {
  const session = readRoomSession(roomId);
  if (!session) {
    return DEFAULT_SESSION;
  }
  const skins = TEAM_SKINS[session.team];
  return skins.includes(session.skin) ? session : { ...session, skin: skins[0] };
}

function isRoomSession(value: unknown): value is RoomSession {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const session = value as Partial<RoomSession>;

  return (
    isValidTeam(session.team)
    && typeof session.skin === 'string'
    && isValidSkin(session.skin)
    && isValidScenario(session.scenario)
    && (session.role === 'host' || session.role === 'guest')
    && (session.reservation === undefined || isSeatReservation(session.reservation))
    && (session.reconnectionToken === undefined || typeof session.reconnectionToken === 'string')
  );
}

function isSeatReservation(value: unknown): value is SeatReservation {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }
  const reservation = value as Partial<SeatReservation>;
  return (
    typeof reservation.name === 'string'
    && typeof reservation.sessionId === 'string'
    && typeof reservation.roomId === 'string'
  );
}
