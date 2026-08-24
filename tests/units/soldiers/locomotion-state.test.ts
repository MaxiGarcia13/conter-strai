import { describe, expect, it } from 'vitest';
import { resolveLocomotionState } from '@/modules/soldiers/utils/resolve-locomotion-state';

describe('resolveLocomotionState', () => {
  it('returns idle when standing still', () => {
    expect(resolveLocomotionState({ moving: false, running: false })).toBe('idle');
  });

  it('returns walk when moving with WASD', () => {
    expect(resolveLocomotionState({ moving: true, running: false })).toBe('walk');
  });

  it('returns run when moving with WASD and Space', () => {
    expect(resolveLocomotionState({ moving: true, running: true })).toBe('run');
  });
});
