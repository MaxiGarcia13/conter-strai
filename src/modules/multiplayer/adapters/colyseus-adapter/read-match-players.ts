import type { MatchPlayerSnapshot } from './types';
import type { MatchState } from '@/modules/multiplayer/schema';
import type { SoldierSkinId } from '@/modules/soldiers';
import type { Team } from '@/modules/teams';

/** Flatten a live `MapSchema<PlayerState>` into plain snapshots once per change. */
export function readMatchPlayers(state: MatchState): MatchPlayerSnapshot[] {
  const players: MatchPlayerSnapshot[] = [];
  state.players.forEach((player, sessionId) => {
    players.push({
      sessionId,
      x: player.x ?? 0,
      y: player.y ?? 0,
      z: player.z ?? 0,
      rotY: player.rotY ?? 0,
      hp: player.hp,
      eliminated: player.eliminated,
      team: player.team as Team,
      skin: player.skin as SoldierSkinId,
    });
  });
  return players;
}
