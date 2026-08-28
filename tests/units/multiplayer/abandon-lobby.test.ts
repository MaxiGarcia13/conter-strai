import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { markPlayHandoff } from '@/modules/lobby/utils/play-handoff';
import { writeRoomSession } from '@/modules/lobby/utils/room-session';
import { setActiveMatch } from '@/modules/multiplayer/adapters/colyseus-adapter/active-match';
import { abandonLobby, abandonLobbySync } from '@/modules/multiplayer/services/abandon-lobby';
import { useMultiplayerStore } from '@/modules/multiplayer/stores/multiplayer-store';
import { mockSessionStorage, unmockSessionStorage } from '../helpers/mock-session-storage';

function makeHandle() {
  return {
    leaveLobby: vi.fn(),
    leave: vi.fn().mockResolvedValue(1000),
  };
}

describe('abandonLobby', () => {
  beforeEach(() => {
    mockSessionStorage();
    useMultiplayerStore.getState().reset();
  });

  afterEach(() => {
    setActiveMatch(null);
    vi.restoreAllMocks();
    unmockSessionStorage();
  });

  it('skips when navigating to play', async () => {
    const handle = makeHandle();
    setActiveMatch(handle as never);
    writeRoomSession('ABC123', {
      team: 'civilian',
      skin: 'remy',
      scenario: 'arena-01',
      role: 'guest',
      reconnectionToken: 'room:token',
    });
    markPlayHandoff('ABC123');

    await abandonLobby('ABC123');

    expect(handle.leaveLobby).not.toHaveBeenCalled();
    expect(handle.leave).not.toHaveBeenCalled();
    expect(sessionStorage.getItem('cs:room:ABC123')).not.toBeNull();
  });

  it('leaves the match and clears session on voluntary exit', async () => {
    const handle = makeHandle();
    setActiveMatch(handle as never);
    writeRoomSession('ABC123', {
      team: 'civilian',
      skin: 'remy',
      scenario: 'arena-01',
      role: 'guest',
      reconnectionToken: 'room:token',
    });

    await abandonLobby('ABC123');

    expect(handle.leaveLobby).toHaveBeenCalledOnce();
    expect(handle.leave).toHaveBeenCalledOnce();
    expect(sessionStorage.getItem('cs:room:ABC123')).toBeNull();
    expect(useMultiplayerStore.getState().remotePlayers).toEqual({});
    expect(useMultiplayerStore.getState().connected).toBe(false);
  });

  it('abandonLobbySync sends leaveLobby and clears session without awaiting leave', () => {
    const handle = makeHandle();
    setActiveMatch(handle as never);
    writeRoomSession('ABC123', {
      team: 'civilian',
      skin: 'remy',
      scenario: 'arena-01',
      role: 'guest',
    });

    abandonLobbySync('ABC123');

    expect(handle.leaveLobby).toHaveBeenCalledOnce();
    expect(sessionStorage.getItem('cs:room:ABC123')).toBeNull();
  });
});
