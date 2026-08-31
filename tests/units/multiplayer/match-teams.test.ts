import type { MatchState } from '@/modules/multiplayer/schema';
import type { Team } from '@/modules/teams/types';
import { describe, expect, it } from 'vitest';
import { DEFAULT_MAX_PER_TEAM } from '@/modules/game/constants/play-defaults';
import {
  assignTeam,
  checkTeamWipe,
  recalculateSpawnIndices,
  shuffleTeamsIfNoOpponents,
  teamCount,
} from '@/modules/multiplayer/rooms/match-teams';
import { createMatchState, createPlayerState } from '@/modules/multiplayer/schema';

/** Deterministic LCG so seeded tests reproduce the exact team split. */
function seededRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 2 ** 32;
  };
}

function teamCountsOf(state: MatchState): Record<Team, number> {
  const counts: Record<Team, number> = { civilian: 0, soldier: 0 };
  for (const [, player] of state.players) {
    counts[player.team as Team]++;
  }
  return counts;
}

/** `rng = () => 0` picks major team civilian and reverses the shuffle to [b,c,d,a] for 4 ids. */
function fourCivilianLobby(state: MatchState) {
  state.players.set('a', createPlayerState({ team: 'civilian', skin: 'swat-2' }));
  state.players.set('b', createPlayerState({ team: 'civilian', skin: 'remy' }));
  state.players.set('c', createPlayerState({ team: 'civilian', skin: 'james' }));
  state.players.set('d', createPlayerState({ team: 'civilian', skin: 'remy' }));
}

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
    for (let i = 0; i < DEFAULT_MAX_PER_TEAM; i++) {
      state.players.set(`s${i}`, createPlayerState({ team: 'soldier' }));
    }
    expect(assignTeam(state, 'soldier')).toBe('civilian');
  });

  it('returns null when both teams are full', () => {
    const state = createMatchState();
    for (let i = 0; i < DEFAULT_MAX_PER_TEAM; i++) {
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

describe('shuffleTeamsIfNoOpponents', () => {
  it('skips with fewer than two players', () => {
    const state = createMatchState();
    state.players.set('a', createPlayerState({ team: 'civilian' }));

    expect(shuffleTeamsIfNoOpponents(state)).toBe(false);
    expect(state.players.get('a')?.team).toBe('civilian');
  });

  it('skips when both teams already have players', () => {
    const state = createMatchState();
    state.players.set('c1', createPlayerState({ team: 'civilian' }));
    state.players.set('s1', createPlayerState({ team: 'soldier' }));

    expect(shuffleTeamsIfNoOpponents(state)).toBe(false);
    expect(state.players.get('c1')?.team).toBe('civilian');
    expect(state.players.get('s1')?.team).toBe('soldier');
  });

  it('splits two players 1v1', () => {
    const state = createMatchState();
    state.players.set('a', createPlayerState({ team: 'civilian' }));
    state.players.set('b', createPlayerState({ team: 'civilian' }));

    expect(shuffleTeamsIfNoOpponents(state, () => 0)).toBe(true);
    expect(teamCountsOf(state)).toEqual({ civilian: 1, soldier: 1 });
  });

  it('splits three players 2v1', () => {
    const state = createMatchState();
    for (let i = 0; i < 3; i++) {
      state.players.set(`c${i}`, createPlayerState({ team: 'civilian' }));
    }

    expect(shuffleTeamsIfNoOpponents(state, () => 0)).toBe(true);
    expect(teamCountsOf(state)).toEqual({ civilian: 2, soldier: 1 });
  });

  it('splits four players 2v2', () => {
    const state = createMatchState();
    fourCivilianLobby(state);

    expect(shuffleTeamsIfNoOpponents(state, () => 0)).toBe(true);
    expect(teamCountsOf(state)).toEqual({ civilian: 2, soldier: 2 });
  });

  it('reassigns a valid skin to the shuffled soldier side', () => {
    const state = createMatchState();
    fourCivilianLobby(state);

    shuffleTeamsIfNoOpponents(state, () => 0);

    // `rng = 0` order is [b, c, d, a]: d and a move to soldier.
    expect(state.players.get('a')?.team).toBe('soldier');
    expect(state.players.get('a')?.skin).toBe('swat-2');
    expect(state.players.get('d')?.team).toBe('soldier');
    expect(state.players.get('d')?.skin).toBe('swat-1');
    expect(state.players.get('b')?.team).toBe('civilian');
    expect(state.players.get('b')?.skin).toBe('remy');
  });

  it('produces the same split for the same seed', () => {
    const first = createMatchState();
    const second = createMatchState();
    for (let i = 0; i < 5; i++) {
      first.players.set(`p${i}`, createPlayerState({ team: 'civilian' }));
      second.players.set(`p${i}`, createPlayerState({ team: 'civilian' }));
    }

    shuffleTeamsIfNoOpponents(first, seededRng(42));
    shuffleTeamsIfNoOpponents(second, seededRng(42));

    for (let i = 0; i < 5; i++) {
      expect(first.players.get(`p${i}`)?.team).toBe(second.players.get(`p${i}`)?.team);
    }
  });

  it('does not coerce teams when the shuffle is skipped on an uneven mixed lobby', () => {
    const state = createMatchState();
    for (let i = 0; i < DEFAULT_MAX_PER_TEAM; i++) {
      state.players.set(`c${i}`, createPlayerState({ team: 'civilian' }));
    }
    state.players.set('s1', createPlayerState({ team: 'soldier' }));

    expect(shuffleTeamsIfNoOpponents(state, () => 0)).toBe(false);
    expect(teamCountsOf(state)).toEqual({ civilian: DEFAULT_MAX_PER_TEAM, soldier: 1 });
  });
});

describe('recalculateSpawnIndices', () => {
  it('assigns sequential slot 0..teamSize-1 per team', () => {
    const state = createMatchState();
    state.players.set('s1', createPlayerState({ team: 'soldier' }));
    state.players.set('c1', createPlayerState({ team: 'civilian' }));
    state.players.set('c2', createPlayerState({ team: 'civilian' }));
    const spawnIndexBySession = new Map([
      ['s1', 7],
      ['c1', 6],
      ['c2', 3],
    ]);

    recalculateSpawnIndices(state, spawnIndexBySession);

    expect(spawnIndexBySession.get('s1')).toBe(0);
    expect(spawnIndexBySession.get('c1')).toBe(0);
    expect(spawnIndexBySession.get('c2')).toBe(1);
  });
});
