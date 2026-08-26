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
  );
}
