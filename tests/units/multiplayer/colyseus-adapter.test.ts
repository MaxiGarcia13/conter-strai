import type { MatchState } from '@/modules/multiplayer/schema';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getActiveMatch,
  initMatch,
  leaveMatch,
  onPlayerUpdate,
  onRoundUpdate,
  readMatchPlayers,
  sendShot,
  startMatch,
  syncTransform,
  toMoveMessage,
} from '@/modules/multiplayer/adapters/colyseus-adapter';
import { createMatchState, createPlayerState } from '@/modules/multiplayer/schema';

const ENDPOINT = 'ws://localhost:2567';

interface CallbackStore {
  stateChange: ((state: MatchState) => void)[];
  leave: ((code: number) => void)[];
  messages: Record<string, ((payload: unknown) => void)[]>;
}

interface FakeRoom {
  roomId: string;
  sessionId: string;
  reconnectionToken: string;
  state: MatchState;
  callbacks: CallbackStore;
  sent: { type: string; payload: unknown }[];
  leaveTimes: number;
  onStateChange: (callback: (state: MatchState) => void) => void;
  onLeave: (callback: (code: number) => void) => void;
  onMessage: (type: string, callback: (payload: unknown) => void) => void;
  send: (type: string, payload: unknown) => void;
  leave: (consented?: boolean) => Promise<number>;
  removeAllListeners: () => void;
}

function makeRoom(roomId: string, existing?: MatchState): FakeRoom {
  const room: FakeRoom = {
    roomId,
    sessionId: 'local-session',
    reconnectionToken: `${roomId}:token-local`,
    state: existing ?? createMatchState({ scenario: 'arena-01' }),
    callbacks: { stateChange: [], leave: [], messages: {} },
    sent: [],
    leaveTimes: 0,
    onStateChange(callback) {
      room.callbacks.stateChange.push(callback);
    },
    onLeave(callback) {
      room.callbacks.leave.push(callback);
    },
    onMessage(type, callback) {
      const list = room.callbacks.messages[type] ?? [];
      list.push(callback);
      room.callbacks.messages[type] = list;
    },
    send(type, payload) {
      room.sent.push({ type, payload });
    },
    leave() {
      room.leaveTimes++;
      return Promise.resolve(1000);
    },
    removeAllListeners() {},
  };
  return room;
}

class FakeClient {
  readonly endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  joinById(roomId: string, options: unknown, _rootSchema: unknown): Promise<FakeRoom> {
    const rooms = new Map<string, FakeRoom>([['host-room', makeRoom('host-room')]]);
    const room = rooms.get(roomId) ?? makeRoom(roomId);
    room.sent.push({ type: 'join-options', payload: options });
    return Promise.resolve(room);
  }

  consumeSeatReservation(reservation: { roomId: string }, _rootSchema: unknown): Promise<FakeRoom> {
    return Promise.resolve(makeRoom(reservation.roomId));
  }

  reconnect(reconnectionToken: string, _rootSchema: unknown): Promise<FakeRoom> {
    const [roomId] = reconnectionToken.split(':');
    return Promise.resolve(makeRoom(roomId ?? 'rejoined'));
  }
}

vi.mock('@colyseus/sdk', () => ({ Client: FakeClient }));

describe('toMoveMessage', () => {
  it('maps ground transform to the server move shape', () => {
    expect(toMoveMessage({ x: 1, z: 2, yaw: 0.5 })).toEqual({ x: 1, y: 0, z: 2, rotY: 0.5 });
  });
});

describe('readMatchPlayers', () => {
  it('flattens the schema player map into plain snapshots', () => {
    const state = createMatchState({ scenario: 'arena-01' });
    const ewe = createPlayerState({ team: 'civilian', skin: 'remy' });
    ewe.x = 1;
    ewe.z = 2;
    ewe.rotY = 0.5;
    ewe.hp = 60;
    const sol = createPlayerState({ team: 'soldier', skin: 'swat-1' });
    state.players.set('session-1', ewe);
    state.players.set('session-2', sol);

    expect(readMatchPlayers(state)).toEqual([
      {
        sessionId: 'session-1',
        x: 1,
        y: 0,
        z: 2,
        rotY: 0.5,
        hp: 60,
        eliminated: false,
        team: 'civilian',
        skin: 'remy',
      },
      {
        sessionId: 'session-2',
        x: 0,
        y: 0,
        z: 0,
        rotY: 0,
        hp: 100,
        eliminated: false,
        team: 'soldier',
        skin: 'swat-1',
      },
    ]);
  });
});

describe('initMatch', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubEnv('PUBLIC_COLYSEUS_URL', ENDPOINT);
  });

  afterEach(async () => {
    await leaveMatch();
    vi.useRealTimers();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('joins by Colyseus room id and passes join options when no reservation exists', async () => {
    const match = await initMatch({
      roomId: 'host-room',
      options: { team: 'soldier', skin: 'swat-2' },
    });

    expect(getActiveMatch()).toBe(match);
    expect(match.sessionId).toBe('local-session');
    expect(match.localPlayerId).toBe('local-session');
    expect(match.roomId).toBe('host-room');
    expect(match.players).toEqual([]);
  });

  it('consumes a reserved seat when a reservation is present', async () => {
    const match = await initMatch({
      roomId: 'unused',
      reservation: { name: 'match', sessionId: 'sess-1', roomId: 'reserved-room' },
      options: { team: 'civilian', skin: 'remy' },
    });

    expect(match.roomId).toBe('reserved-room');
  });

  it('throws when PUBLIC_COLYSEUS_URL is missing', async () => {
    vi.unstubAllEnvs();
    await expect(initMatch({ roomId: 'host-room' })).rejects.toThrow('Missing PUBLIC_COLYSEUS_URL');
  });

  it('sends one throttled move for many syncTransform calls', async () => {
    const match = await initMatch({ roomId: 'host-room' });
    const room = match.room as unknown as FakeRoom;

    match.syncTransform({ x: 1, z: 1, yaw: 0 });
    match.syncTransform({ x: 2, z: 2, yaw: 0.25 });
    vi.advanceTimersByTime(50);
    vi.advanceTimersByTime(50);

    expect(room.sent.filter((message) => message.type === 'move')).toEqual([
      { type: 'move', payload: { x: 2, y: 0, z: 2, rotY: 0.25 } },
    ]);
  });

  it('sends a shot with target and zone', async () => {
    const match = await initMatch({ roomId: 'host-room' });
    const room = match.room as unknown as FakeRoom;

    match.sendShot({ targetId: 'session-2', zone: 'head' });

    expect(room.sent).toContainEqual({ type: 'shot', payload: { targetId: 'session-2', zone: 'head' } });
  });

  it('starts the round via the adapter proxy', async () => {
    const match = await initMatch({ roomId: 'host-room' });
    const room = match.room as unknown as FakeRoom;

    startMatch();

    expect(room.sent).toContainEqual({ type: 'startRound', payload: undefined });
    expect(getActiveMatch()).toBe(match);
  });

  it('notifies player listeners with a flattened snapshot on state change', async () => {
    const match = await initMatch({ roomId: 'host-room' });
    const room = match.room as unknown as FakeRoom;
    const playerUpdates: unknown[] = [];
    onPlayerUpdate((payload) => {
      playerUpdates.push(payload);
    });

    const foe = createPlayerState({ team: 'soldier', skin: 'swat-1' });
    foe.x = 3;
    room.state.players.set('session-2', foe);
    room.callbacks.stateChange[0]!(room.state);

    expect(playerUpdates).toEqual([
      {
        localSessionId: 'local-session',
        players: [
          {
            sessionId: 'session-2',
            x: 3,
            y: 0,
            z: 0,
            rotY: 0,
            hp: 100,
            eliminated: false,
            team: 'soldier',
            skin: 'swat-1',
          },
        ],
      },
    ]);
    expect(match.players).toHaveLength(1);
  });

  it('emits round updates only when phase or winner changes', async () => {
    const match = await initMatch({ roomId: 'host-room' });
    const room = match.room as unknown as FakeRoom;
    const roundUpdates: unknown[] = [];
    onRoundUpdate((payload) => {
      roundUpdates.push(payload);
    });

    room.state.roundPhase = 'in_progress';
    room.callbacks.stateChange[0]!(room.state);
    room.callbacks.stateChange[0]!(room.state);
    room.state.winner = 'civilian';
    room.state.roundPhase = 'ended';
    room.callbacks.stateChange[0]!(room.state);

    expect(roundUpdates).toEqual([
      { phase: 'waiting', winner: '' },
      { phase: 'in_progress', winner: '' },
      { phase: 'ended', winner: 'civilian' },
    ]);
  });

  it('reconnects with a persisted reconnection token', async () => {
    const match = await initMatch({
      roomId: 'unused',
      reconnectionToken: 'host-room:token-abc',
    });

    expect(match.roomId).toBe('host-room');
    expect(match.reconnectionToken).toBe('host-room:token-local');
  });

  it('reuses an active match for the same room instead of leaving', async () => {
    const first = await initMatch({ roomId: 'host-room' });
    const second = await initMatch({ roomId: 'host-room' });

    expect(second).toBe(first);
    expect((first.room as unknown as FakeRoom).leaveTimes).toBe(0);
  });

  it('clears the active match on leave and guards module helpers', async () => {
    const match = await initMatch({ roomId: 'host-room' });
    const room = match.room as unknown as FakeRoom;
    room.callbacks.leave[0]!(1000);

    expect(getActiveMatch()).toBe(null);
    expect(() => syncTransform({ x: 0, z: 0, yaw: 0 })).toThrow('No active Colyseus match');
    expect(() => sendShot({ targetId: 'session-2', zone: 'body' })).toThrow('No active Colyseus match');
  });
});
