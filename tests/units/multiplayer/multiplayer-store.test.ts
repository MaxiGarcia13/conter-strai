import type { PlayersUpdatePayload } from '@/modules/multiplayer/adapters/colyseus-adapter';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  mapMatchRoundPhase,
  toRemotePlayerEntry,
  useMultiplayerStore,
} from '@/modules/multiplayer/stores/multiplayer-store';

describe('mapMatchRoundPhase', () => {
  it('maps the server phases onto the client RoundPhase', () => {
    expect(mapMatchRoundPhase('countdown')).toBe('countdown');
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
    useMultiplayerStore.getState().applyRoundUpdate({
      phase: 'ended',
      winner: 'civilian',
      countdown: 0,
    });

    expect(useMultiplayerStore.getState()).toMatchObject({
      phase: 'round-end',
      winner: 'civilian',
      countdown: null,
      connected: true,
    });
  });

  it('tracks countdown while the server is counting down', () => {
    useMultiplayerStore.getState().applyRoundUpdate({
      phase: 'countdown',
      winner: '',
      countdown: 3,
    });

    expect(useMultiplayerStore.getState()).toMatchObject({
      phase: 'countdown',
      countdown: 3,
      winner: null,
    });
  });

  it('clears the winner when the server has none', () => {
    useMultiplayerStore.getState().applyRoundUpdate({
      phase: 'in_progress',
      winner: '',
      countdown: 0,
    });

    expect(useMultiplayerStore.getState()).toMatchObject({
      phase: 'live',
      winner: null,
      countdown: null,
    });
  });

  it('reset clears state for the leave/reconnect path', () => {
    useMultiplayerStore.getState().reset();

    expect(useMultiplayerStore.getState()).toEqual({
      remotePlayers: {},
      phase: null,
      winner: null,
      countdown: null,
      connected: false,
      applyPlayersUpdate: expect.any(Function),
      applyRoundUpdate: expect.any(Function),
      applyRemotePose: expect.any(Function),
      reset: expect.any(Function),
    });
  });

  it('preserves an ephemeral pose across transform updates', () => {
    const payload: PlayersUpdatePayload = {
      localSessionId: 'local-session',
      players: [
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
    };

    useMultiplayerStore.getState().applyPlayersUpdate(payload);
    useMultiplayerStore.getState().applyRemotePose('session-2', 'kneel');

    expect(useMultiplayerStore.getState().remotePlayers['session-2']?.pose).toBe('kneel');

    // Position patch rebuilds the entry — the pose must survive.
    useMultiplayerStore.getState().applyPlayersUpdate(payload);

    expect(useMultiplayerStore.getState().remotePlayers['session-2']?.pose).toBe('kneel');
  });

  it('applies and clears a remote pose', () => {
    useMultiplayerStore.getState().applyPlayersUpdate({
      localSessionId: 'local-session',
      players: [
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
      ],
    });

    useMultiplayerStore.getState().applyRemotePose('session-2', 'jump');
    expect(useMultiplayerStore.getState().remotePlayers['session-2']?.pose).toBe('jump');
    expect(useMultiplayerStore.getState().remotePlayers['session-2']?.poseEpoch).toBe(1);

    useMultiplayerStore.getState().applyRemotePose('session-2', 'jump');
    expect(useMultiplayerStore.getState().remotePlayers['session-2']?.poseEpoch).toBe(2);

    useMultiplayerStore.getState().applyRemotePose('session-2', 'clear');
    expect(useMultiplayerStore.getState().remotePlayers['session-2']?.pose).toBeUndefined();
    expect(useMultiplayerStore.getState().remotePlayers['session-2']?.poseEpoch).toBe(2);
  });
});
