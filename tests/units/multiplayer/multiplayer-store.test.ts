import { beforeEach, describe, expect, it } from 'vitest';
import {
  mapMatchRoundPhase,
  toRemotePlayerEntry,
  useMultiplayerStore,
} from '@/modules/multiplayer/stores/multiplayer-store';

describe('mapMatchRoundPhase', () => {
  it('maps the server phases onto the client RoundPhase', () => {
    expect(mapMatchRoundPhase('in_progress')).toBe('live');
    expect(mapMatchRoundPhase('ended')).toBe('round-end');
  });

  it('has no live equivalent for the waiting phase', () => {
    expect(mapMatchRoundPhase('waiting')).toBeNull();
  });
});

describe('toRemotePlayerEntry', () => {
  it('maps an adapter snapshot into store shape with a HealthState', () => {
    const entry = toRemotePlayerEntry({
      sessionId: 'session-2',
      x: 3,
      y: 0,
      z: 4,
      rotY: 0.5,
      hp: 60,
      eliminated: false,
      team: 'soldier',
      skin: 'swat-1',
    });

    expect(entry).toEqual({
      sessionId: 'session-2',
      team: 'soldier',
      skin: 'swat-1',
      transform: { x: 3, y: 0, z: 4, rotY: 0.5 },
      health: { currentHp: 60, maxHp: 100, isEliminated: false },
    });
  });
});

describe('useMultiplayerStore', () => {
  beforeEach(() => {
    useMultiplayerStore.getState().reset();
  });

  it('tracks remote players and excludes the local session', () => {
    useMultiplayerStore.getState().applyPlayersUpdate({
      localSessionId: 'local-session',
      players: [
        {
          sessionId: 'local-session',
          x: 0,
          y: 0,
          z: 0,
          rotY: 0,
          hp: 100,
          eliminated: false,
          team: 'civilian',
          skin: 'remy',
        },
        {
          sessionId: 'session-2',
          x: 3,
          y: 0,
          z: 4,
          rotY: 0.5,
          hp: 60,
          eliminated: false,
          team: 'soldier',
          skin: 'swat-1',
        },
      ],
    });

    const state = useMultiplayerStore.getState();
    expect(state.connected).toBe(true);
    expect(Object.keys(state.remotePlayers)).toEqual(['session-2']);
    expect(state.remotePlayers['session-2']?.team).toBe('soldier');
  });

  it('applies server round phase and winner via the mapped client phase', () => {
    useMultiplayerStore.getState().applyRoundUpdate({ phase: 'ended', winner: 'civilian' });

    expect(useMultiplayerStore.getState()).toMatchObject({
      phase: 'round-end',
      winner: 'civilian',
      connected: true,
    });
  });

  it('clears the winner when the server has none', () => {
    useMultiplayerStore.getState().applyRoundUpdate({ phase: 'in_progress', winner: '' });

    expect(useMultiplayerStore.getState()).toMatchObject({ phase: 'live', winner: null });
  });

  it('reset clears state for the leave/reconnect path', () => {
    useMultiplayerStore.getState().reset();

    expect(useMultiplayerStore.getState()).toEqual({
      remotePlayers: {},
      phase: null,
      winner: null,
      connected: false,
      applyPlayersUpdate: expect.any(Function),
      applyRoundUpdate: expect.any(Function),
      reset: expect.any(Function),
    });
  });
});
