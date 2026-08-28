import { useHealthStore } from '@/modules/combat';
import { consumePlayHandoff } from '@/modules/lobby/utils/play-handoff';
import { clearRoomSession } from '@/modules/lobby/utils/room-session';
import {
  getActiveMatch,
  leaveMatch,
} from '@/modules/multiplayer/adapters/colyseus-adapter';
import { unbindRoomMatch } from '@/modules/multiplayer/hooks/use-match-join';
import { useMultiplayerStore } from '@/modules/multiplayer/stores/multiplayer-store';

/**
 * Release a waiting-room seat: notify the server, disconnect, clear session.
 * Skips when a play handoff flag is set (waiting → `/play` hard navigation).
 */
export async function abandonLobby(roomId: string): Promise<void> {
  if (consumePlayHandoff(roomId)) {
    return;
  }

  const match = getActiveMatch();
  if (match) {
    match.leaveLobby();
    await leaveMatch();
    unbindRoomMatch(roomId);
    useMultiplayerStore.getState().reset();
    useHealthStore.getState().resetAll();
  }

  clearRoomSession(roomId);
}

/** Best-effort abandon for `pagehide` / tab close — cannot await disconnect. */
export function abandonLobbySync(roomId: string): void {
  if (consumePlayHandoff(roomId)) {
    return;
  }

  const match = getActiveMatch();
  if (match) {
    match.leaveLobby();
    void leaveMatch().finally(() => {
      unbindRoomMatch(roomId);
    });
    useMultiplayerStore.getState().reset();
    useHealthStore.getState().resetAll();
  }

  clearRoomSession(roomId);
}
