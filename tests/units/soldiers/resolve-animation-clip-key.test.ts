import { describe, expect, it } from 'vitest';

import { resolveAnimationClipKey } from '@/modules/soldiers/utils/resolve-animation-clip-key';

describe('resolveAnimationClipKey', () => {
  it('returns locomotion when no pose', () => {
    expect(resolveAnimationClipKey(null, 'idle')).toBe('idle');
    expect(resolveAnimationClipKey(null, 'walk')).toBe('walk');
    expect(resolveAnimationClipKey(null, 'run')).toBe('run');
    expect(resolveAnimationClipKey(null, 'walkBackward')).toBe('walkBackward');
    expect(resolveAnimationClipKey(null, 'runBackward')).toBe('runBackward');
  });

  it('returns pose when pose is jump, jumpIdle, shooting, or dying', () => {
    expect(resolveAnimationClipKey('jump', 'idle')).toBe('jump');
    expect(resolveAnimationClipKey('jumpIdle', 'idle')).toBe('jumpIdle');
    expect(resolveAnimationClipKey('jump', 'walk')).toBe('jump');
    expect(resolveAnimationClipKey('shooting', 'walk')).toBe('shooting');
    expect(resolveAnimationClipKey('hitReaction', 'run')).toBe('hitReaction');
    expect(resolveAnimationClipKey('dying', 'run')).toBe('dying');
  });

  it('returns kneel when kneeling and idle', () => {
    expect(resolveAnimationClipKey('kneel', 'idle')).toBe('kneel');
  });

  it('returns crouchWalking when kneeling and walking', () => {
    expect(resolveAnimationClipKey('kneel', 'walk')).toBe('crouchWalking');
    expect(resolveAnimationClipKey('kneel', 'crouchWalking')).toBe('crouchWalking');
  });

  it('returns run when kneeling and running', () => {
    expect(resolveAnimationClipKey('kneel', 'run')).toBe('run');
  });

  it('handles kneel with backward gaits (no crouch-backward clip)', () => {
    expect(resolveAnimationClipKey('kneel', 'walkBackward')).toBe('crouchWalking');
    expect(resolveAnimationClipKey('kneel', 'runBackward')).toBe('run');
  });
});
