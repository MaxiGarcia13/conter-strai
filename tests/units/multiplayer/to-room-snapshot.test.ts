import type { MatchState } from '@/modules/multiplayer/schema';
import type { Team } from '@/modules/teams';
import { describe, expect, it } from 'vitest';
import { createEmptyRoomSnapshot, toRoomSnapshot } from '@/modules/multiplayer/adapters/to-room-snapshot';
import { createMatchState, createPlayerState } from '@/modules/multiplayer/schema';

const ROOM_CODE = 'ABC123';
const EXPIRES_AT = '2099-01-01T00:00:00.000Z';

function addPlayer(state: MatchState, sessionId: string, team: Team): void {
  state.players.set(sessionId, createPlayerState({ team }));
}

function fillTeam(state: MatchState, team: Team, count: number): void {
  for (let index = 0; index < count; index++) {
    addPlayer(state, `${team}-${index}`, team);
  }
}

describe('toRoomSnapshot', () => {
  it('maps waiting state to joinable seats with max 4 per team', () => {
    const state = createMatchState({ scenario: 'arena-01' });
    addPlayer(state, 'c1', 'civilian');
    addPlayer(state, 's1', 'soldier');

    expect(toRoomSnapshot(ROOM_CODE, state, EXPIRES_AT)).toEqual({
      id: ROOM_CODE,
      phase: 'waiting',
      canJoin: true,
      maxPerTeam: 4,
      playerCount: 2,
      expiresAt: EXPIRES_AT,
      scenario: 'arena-01',
      teams: {
        civilian: { count: 1, max: 4, open: true },
        soldier: { count: 1, max: 4, open: true },
      },
    });
  });

  it('sets canJoin false when the round has started', () => {
    const state = createMatchState();
    addPlayer(state, 'c1', 'civilian');
    state.roundPhase = 'in_progress';

    const snapshot = toRoomSnapshot(ROOM_CODE, state, EXPIRES_AT);
    expect(snapshot.phase).toBe('in_progress');
    expect(snapshot.canJoin).toBe(false);
    expect(snapshot.playerCount).toBe(1);
  });

  it('maps deploying to in_progress so lobby joins stay locked', () => {
    const state = createMatchState();
    addPlayer(state, 'c1', 'civilian');
    state.roundPhase = 'deploying';

    const snapshot = toRoomSnapshot(ROOM_CODE, state, EXPIRES_AT);
    expect(snapshot.phase).toBe('in_progress');
    expect(snapshot.canJoin).toBe(false);
  });

  it('maps countdown to in_progress so lobby joins stay locked', () => {
    const state = createMatchState();
    addPlayer(state, 'c1', 'civilian');
    state.roundPhase = 'countdown';
    state.countdown = 2;

    const snapshot = toRoomSnapshot(ROOM_CODE, state, EXPIRES_AT);
    expect(snapshot.phase).toBe('in_progress');
    expect(snapshot.canJoin).toBe(false);
  });

  it('closes a team at 4 and canJoin when both teams are full', () => {
    const state = createMatchState();
    fillTeam(state, 'civilian', 4);
    fillTeam(state, 'soldier', 3);

    const almostFull = toRoomSnapshot(ROOM_CODE, state, EXPIRES_AT);
    expect(almostFull.canJoin).toBe(true);
    expect(almostFull.teams.civilian).toEqual({ count: 4, max: 4, open: false });
    expect(almostFull.teams.soldier).toEqual({ count: 3, max: 4, open: true });

    addPlayer(state, 'soldier-3', 'soldier');
    const full = toRoomSnapshot(ROOM_CODE, state, EXPIRES_AT);
    expect(full.canJoin).toBe(false);
    expect(full.playerCount).toBe(8);
    expect(full.teams.soldier.open).toBe(false);
  });
});

describe('createEmptyRoomSnapshot', () => {
  it('returns a joinable waiting room with empty seats', () => {
    expect(createEmptyRoomSnapshot(ROOM_CODE, EXPIRES_AT, 'arena-01')).toEqual({
      id: ROOM_CODE,
      phase: 'waiting',
      canJoin: true,
      maxPerTeam: 4,
      playerCount: 0,
      expiresAt: EXPIRES_AT,
      scenario: 'arena-01',
      teams: {
        civilian: { count: 0, max: 4, open: true },
        soldier: { count: 0, max: 4, open: true },
      },
    });
  });
});
