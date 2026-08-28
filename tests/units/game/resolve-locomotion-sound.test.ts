import { describe, expect, it } from 'vitest';
import { resolveLocomotionSound } from '@/modules/game/utils/resolve-locomotion-sound';

describe('resolveLocomotionSound', () => {
  it('maps walk-like locomotion to walk', () => {
    expect(resolveLocomotionSound('walk', null)).toBe('walk');
    expect(resolveLocomotionSound('crouchWalking', null)).toBe('walk');
    expect(resolveLocomotionSound('walkBackward', null)).toBe('walk');
  });

  it('maps run-like locomotion to run', () => {
    expect(resolveLocomotionSound('run', null)).toBe('run');
    expect(resolveLocomotionSound('runBackward', null)).toBe('run');
  });

  it('returns null when idle or airborne', () => {
    expect(resolveLocomotionSound('idle', null)).toBeNull();
    expect(resolveLocomotionSound('walk', 'jump')).toBeNull();
    expect(resolveLocomotionSound('run', 'jumpIdle')).toBeNull();
    expect(resolveLocomotionSound('walk', 'dying')).toBeNull();
  });
});
