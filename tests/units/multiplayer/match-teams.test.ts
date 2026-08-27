import { describe, expect, it } from 'vitest';
import {
  assignTeam,
  checkTeamWipe,
  teamCount,
} from '@/modules/multiplayer/rooms/match-teams';
import { createMatchState, createPlayerState } from '@/modules/multiplayer/schema';

describe('teamCount', () => {
  it('counts players on a team', () => {
    const state = createMatchState();
    state.players.set('a', createPlayerState({ team: 'civilian' }));
    state.players.set('b', createPlayerState({ team: 'soldier' }));
    state.players.set('c', createPlayerState({ team: 'civilian' }));

    expect(teamCount(state, 'civilian')).toBe(2);
    expect(teamCount(state, 'soldier')).toBe(1);
  });
});

describe('assignTeam', () => {
  it('honors the preferred team when it has capacity', () => {
    const state = createMatchState();
    expect(assignTeam(state, 'soldier')).toBe('soldier');
  });

  it('falls back when the preferred team is full', () => {
    const state = createMatchState();
    for (let i = 0; i < 4; i++) {
      state.players.set(`s${i}`, createPlayerState({ team: 'soldier' }));
    }
    expect(assignTeam(state, 'soldier')).toBe('civilian');
  });

  it('returns null when both teams are full', () => {
    const state = createMatchState();
    for (let i = 0; i < 4; i++) {
      state.players.set(`c${i}`, createPlayerState({ team: 'civilian' }));
      state.players.set(`s${i}`, createPlayerState({ team: 'soldier' }));
    }
    expect(assignTeam(state, 'civilian')).toBeNull();
  });
});

describe('checkTeamWipe', () => {
  it('returns null while both teams have a living player', () => {
    const state = createMatchState();
    state.players.set('c1', createPlayerState({ team: 'civilian' }));
    state.players.set('s1', createPlayerState({ team: 'soldier' }));
    expect(checkTeamWipe(state)).toBeNull();
  });

  it('returns the opposing team when one side is fully eliminated', () => {
    const state = createMatchState();
    const civilian = createPlayerState({ team: 'civilian' });
    civilian.eliminated = true;
    state.players.set('c1', civilian);
    state.players.set('s1', createPlayerState({ team: 'soldier' }));
    expect(checkTeamWipe(state)).toBe('soldier');
  });
});
