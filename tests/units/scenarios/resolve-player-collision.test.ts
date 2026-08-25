import type { CollisionSegment } from '@/modules/scenarios/types';
import { describe, expect, it } from 'vitest';
import {
  resolveCircleBlockers,
  resolvePlayerCollision,
} from '@/modules/game/utils/resolve-player-collision';

const horizontalWall: CollisionSegment = {
  start: [-2, 0, 0],
  end: [2, 0, 0],
  axis: 'x',
};

describe('resolvePlayerCollision', () => {
  it('keeps the player circle outside a horizontal wall span', () => {
    const resolved = resolvePlayerCollision({ x: 0, z: -0.1 }, [horizontalWall], 0.4, { x: 0, z: -1 });

    expect(resolved.x).toBe(0);
    expect(resolved.z).toBeCloseTo(-0.4);
  });

  it('allows a player circle through a gap between solid spans', () => {
    const leftWall: CollisionSegment = { ...horizontalWall, end: [-1.1, 0, 0] };
    const rightWall: CollisionSegment = { ...horizontalWall, start: [1.1, 0, 0] };

    const resolved = resolvePlayerCollision({ x: 0, z: 0 }, [leftWall, rightWall], 0.4);

    expect(resolved).toEqual({ x: 0, z: 0 });
  });

  it('blocks a movement step that would cross through a wall', () => {
    const resolved = resolvePlayerCollision({ x: 0, z: 1 }, [horizontalWall], 0.4, { x: 0, z: -1 });

    expect(resolved.z).toBeCloseTo(-0.4);
  });

  it('resolves a vertical wall span on the X axis', () => {
    const verticalWall: CollisionSegment = {
      start: [0, 0, -2],
      end: [0, 0, 2],
      axis: 'z',
    };

    const resolved = resolvePlayerCollision({ x: 0.1, z: 0 }, [verticalWall], 0.4, { x: 1, z: 0 });

    expect(resolved.x).toBeCloseTo(0.4);
    expect(resolved.z).toBe(0);
  });
});

describe('resolveCircleBlockers', () => {
  it('pushes the player out of an overlapping NPC disc', () => {
    const resolved = resolveCircleBlockers(
      { x: 0.2, z: 0 },
      [{ x: 0, z: 0, radius: 0.4 }],
      0.4,
    );

    expect(Math.hypot(resolved.x, resolved.z)).toBeCloseTo(0.8);
  });

  it('leaves a non-overlapping player untouched', () => {
    const resolved = resolveCircleBlockers(
      { x: 2, z: 0 },
      [{ x: 0, z: 0, radius: 0.4 }],
      0.4,
    );

    expect(resolved).toEqual({ x: 2, z: 0 });
  });
});
