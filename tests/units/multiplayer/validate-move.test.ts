import { describe, expect, it } from 'vitest';
import { isMoveMessage, moveExceedsThreshold } from '@/modules/multiplayer/utils/validate-move';

describe('isMoveMessage', () => {
  it('accepts a finite move payload', () => {
    expect(isMoveMessage({ x: 1, y: 0, z: 2, rotY: 0.5 })).toBe(true);
  });

  it('rejects malformed or non-finite payloads', () => {
    expect(isMoveMessage(null)).toBe(false);
    expect(isMoveMessage({ x: 1, z: 2 })).toBe(false);
    expect(isMoveMessage({ x: Number.NaN, y: 0, z: 2, rotY: 0 })).toBe(false);
  });
});

describe('moveExceedsThreshold', () => {
  const previous = { x: 0, z: 0, atMs: 1_000 };

  it('accepts a normal ~20 Hz move step', () => {
    expect(moveExceedsThreshold(previous, { x: 0.3, z: 0 }, 1_050)).toBe(false);
  });

  it('accepts a hitched-frame gap (lag spike) within speed headroom', () => {
    expect(moveExceedsThreshold(previous, { x: 3, z: 0 }, 1_400)).toBe(false);
  });

  it('rejects an instant teleport', () => {
    expect(moveExceedsThreshold(previous, { x: 0, z: 50 }, 1_001)).toBe(true);
  });

  it('rejects even a large gap-time teleport beyond the hard cap', () => {
    expect(moveExceedsThreshold(previous, { x: 20, z: 0 }, 5_000)).toBe(true);
  });
});
