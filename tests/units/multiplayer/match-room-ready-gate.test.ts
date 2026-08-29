import type { Client } from 'colyseus';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MatchRoom } from '@/modules/multiplayer/rooms/match-room';

const FUTURE_EXPIRY = '2099-01-01T00:00:00.000Z';

function fakeClient(sessionId: string): Client {
  return { sessionId, reconnectionToken: sessionId } as Client;
}

function bootstrapMatchRoom() {
  const room = new MatchRoom();
  room.__init();
  room.roomId = 'test-room';
  room['_listing'] = { metadata: {} };
  room.lock = vi.fn();

  room.onCreate({
    metadata: {
      roomCode: 'TEST01',
      scenario: 'arena-01',
      expiresAt: FUTURE_EXPIRY,
    },
  });

  room['_internalState'] = 1;

  return room;
}

function joinPlayer(room: MatchRoom, sessionId: string, team: 'civilian' | 'soldier' = 'civilian') {
  const client = fakeClient(sessionId);
  room.clients.push(client);
  room.onJoin(client, { team });
  return client;
}

async function disconnectPlayer(room: MatchRoom, client: Client) {
  room.allowReconnection = vi.fn().mockRejectedValue(new Error('gone'));
  room.clients.delete(client);
  await room.onLeave(client);
}

describe('MatchRoom deploy ready gate', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts countdown when a single connected player is ready', () => {
    const room = bootstrapMatchRoom();
    const client = joinPlayer(room, 'p0');

    room.startRound();
    expect(room.state.roundPhase).toBe('deploying');
    expect(room.state.countdown).toBe(0);

    room.playerReady(client.sessionId);

    expect(room.state.roundPhase).toBe('countdown');
    expect(room.state.countdown).toBe(3);
  });

  it('waits for every connected player before starting countdown', () => {
    const room = bootstrapMatchRoom();
    const first = joinPlayer(room, 'p0', 'civilian');
    const second = joinPlayer(room, 'p1', 'soldier');

    room.startRound();
    room.playerReady(first.sessionId);

    expect(room.state.roundPhase).toBe('deploying');
    expect(room.state.countdown).toBe(0);

    room.playerReady(second.sessionId);

    expect(room.state.roundPhase).toBe('countdown');
    expect(room.state.countdown).toBe(3);
  });

  it('re-evaluates the gate when a player disconnects during deploying', async () => {
    const room = bootstrapMatchRoom();
    const ready = joinPlayer(room, 'p0', 'civilian');
    const leaving = joinPlayer(room, 'p1', 'soldier');

    room.startRound();
    room.playerReady(ready.sessionId);

    expect(room.state.roundPhase).toBe('deploying');

    await disconnectPlayer(room, leaving);

    expect(room.state.players.has('p1')).toBe(false);
    expect(room.state.roundPhase).toBe('countdown');
    expect(room.state.countdown).toBe(3);
  });

  it('stays deploying when the remaining player is not ready after a disconnect', async () => {
    const room = bootstrapMatchRoom();
    joinPlayer(room, 'p0', 'civilian');
    const leaving = joinPlayer(room, 'p1', 'soldier');

    room.startRound();

    await disconnectPlayer(room, leaving);

    expect(room.state.roundPhase).toBe('deploying');
    expect(room.state.countdown).toBe(0);
  });

  it('ignores playerReady outside deploying', () => {
    const room = bootstrapMatchRoom();
    const client = joinPlayer(room, 'p0');

    room.playerReady(client.sessionId);

    expect(room.state.roundPhase).toBe('waiting');
  });
});
