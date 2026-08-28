import { describe, expect, it } from 'vitest';
import { applyMatchShot, isShotMessage } from '@/modules/multiplayer/rooms/apply-match-shot';
import { createMatchState, createPlayerState } from '@/modules/multiplayer/schema';
import { PISTOL_MAX_RANGE_METERS } from '@/modules/weapons/constants/pistol';

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

  it('ignores shots beyond pistol max range', () => {
    const state = createMatchState();
    state.roundPhase = 'in_progress';
    const shooter = createPlayerState({ team: 'soldier' });
    shooter.x = 0;
    shooter.z = 0;
    state.players.set('shooter', shooter);
    const target = createPlayerState({ team: 'civilian' });
    target.x = PISTOL_MAX_RANGE_METERS + 1;
    target.z = 0;
    state.players.set('target', target);

    expect(applyMatchShot(state, 'shooter', { targetId: 'target', zone: 'head' })).toBeNull();
    expect(state.players.get('target')?.hp).toBe(100);
  });

  it('applies damage within range and returns a wipe winner', () => {
    const state = createMatchState();
    state.roundPhase = 'in_progress';
    const shooter = createPlayerState({ team: 'soldier' });
    shooter.x = 0;
    shooter.z = 0;
    state.players.set('shooter', shooter);
    const target = createPlayerState({ team: 'civilian' });
    target.x = 5;
    target.z = 0;
    target.hp = 10;
    state.players.set('target', target);

    const winner = applyMatchShot(state, 'shooter', { targetId: 'target', zone: 'head' });
    expect(winner).toBe('soldier');
    expect(state.players.get('target')?.eliminated).toBe(true);
  });
});

describe('isShotMessage', () => {
  it('accepts a valid shot payload', () => {
    expect(isShotMessage({ targetId: 'abc', zone: 'limb' })).toBe(true);
  });

  it('rejects out-of-enum zones and malformed payloads', () => {
    expect(isShotMessage({ targetId: 'abc', zone: 'chest' })).toBe(false);
    expect(isShotMessage({ targetId: '', zone: 'body' })).toBe(false);
    expect(isShotMessage(null)).toBe(false);
    expect(isShotMessage({ zone: 'body' })).toBe(false);
  });
});
