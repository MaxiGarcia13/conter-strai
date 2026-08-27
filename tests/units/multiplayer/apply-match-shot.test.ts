import { describe, expect, it } from 'vitest';
import { applyMatchShot } from '@/modules/multiplayer/rooms/apply-match-shot';
import { createMatchState, createPlayerState } from '@/modules/multiplayer/schema';

describe('applyMatchShot', () => {
  it('ignores shots outside in_progress', () => {
    const state = createMatchState();
    state.roundPhase = 'countdown';
    state.players.set('shooter', createPlayerState({ team: 'soldier' }));
    state.players.set('target', createPlayerState({ team: 'civilian' }));

    expect(applyMatchShot(state, 'shooter', { targetId: 'target', zone: 'body' })).toBeNull();
    expect(state.players.get('target')?.hp).toBe(100);
  });

  it('ignores friendly fire', () => {
    const state = createMatchState();
    state.roundPhase = 'in_progress';
    state.players.set('a', createPlayerState({ team: 'soldier' }));
    state.players.set('b', createPlayerState({ team: 'soldier' }));

    expect(applyMatchShot(state, 'a', { targetId: 'b', zone: 'head' })).toBeNull();
    expect(state.players.get('b')?.hp).toBe(100);
  });

  it('applies damage and returns a wipe winner', () => {
    const state = createMatchState();
    state.roundPhase = 'in_progress';
    state.players.set('shooter', createPlayerState({ team: 'soldier' }));
    const target = createPlayerState({ team: 'civilian' });
    target.hp = 10;
    state.players.set('target', target);

    const winner = applyMatchShot(state, 'shooter', { targetId: 'target', zone: 'head' });
    expect(winner).toBe('soldier');
    expect(state.players.get('target')?.eliminated).toBe(true);
  });
});
