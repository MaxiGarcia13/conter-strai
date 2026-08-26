import type { ScenarioConfig } from '@/modules/scenarios';
import type { SoldierSkinId } from '@/modules/soldiers';
import type { Team } from '@/modules/teams';

export interface RoomSession {
  team: Team;
  skin: SoldierSkinId;
  scenario: ScenarioConfig['id'];
  role: 'host' | 'guest';
}

const PREFIX = 'cs:room:';

export function writeRoomSession(roomId: string, data: RoomSession) {
  sessionStorage.setItem(`${PREFIX}${roomId}`, JSON.stringify(data));
}

export function readRoomSession(roomId: string): RoomSession | null {
  const raw = sessionStorage.getItem(`${PREFIX}${roomId}`);
  if (!raw)
    return null;
  try {
    return JSON.parse(raw) as RoomSession;
  } catch {
    return null;
  }
}
