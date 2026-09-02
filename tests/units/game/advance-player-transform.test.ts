import { describe, expect, it } from 'vitest';
import { advancePlayerTransform } from '@/modules/game/utils/advance-player-transform';

const defaultBounds = { width: 40, depth: 40 };

describe('advancePlayerTransform', () => {
  it('returns idle locomotion when no input', () => {
    const result = advancePlayerTransform({
      transform: { x: 0, z: 0, yaw: 0 },
      strafe: 0,
      forward: 0,
      running: false,
      delta: 0.016,
      collisionSegments: [],
      wallThickness: 0.5,
      npcBlockers: [],
      solidNpcFlags: [],
      bounds: defaultBounds,
    });

    expect(result.locomotion).toBe('idle');
    expect(result.x).toBe(0);
    expect(result.z).toBe(0);
  });

  it('moves forward along -Z when yaw is 0', () => {
    const result = advancePlayerTransform({
      transform: { x: 0, z: 0, yaw: 0 },
      strafe: 0,
      forward: 1,
      running: false,
      delta: 1,
      collisionSegments: [],
      wallThickness: 0.5,
      npcBlockers: [],
      solidNpcFlags: [],
      bounds: defaultBounds,
    });

    expect(result.locomotion).toBe('walk');
    expect(result.x).toBeCloseTo(0);
    expect(result.z).toBeLessThan(0);
  });

  it('runs faster than walk', () => {
    const walk = advancePlayerTransform({
      transform: { x: 0, z: 0, yaw: 0 },
      strafe: 0,
      forward: 1,
      running: false,
      delta: 1,
      collisionSegments: [],
      wallThickness: 0.5,
      npcBlockers: [],
      solidNpcFlags: [],
      bounds: defaultBounds,
    });

    const run = advancePlayerTransform({
      transform: { x: 0, z: 0, yaw: 0 },
      strafe: 0,
      forward: 1,
      running: true,
      delta: 1,
      collisionSegments: [],
      wallThickness: 0.5,
      npcBlockers: [],
      solidNpcFlags: [],
      bounds: defaultBounds,
    });

    expect(run.locomotion).toBe('run');
    expect(Math.abs(run.z)).toBeGreaterThan(Math.abs(walk.z));
  });

  it('moves backward toward +Z and selects backward gait', () => {
    const result = advancePlayerTransform({
      transform: { x: 0, z: 0, yaw: 0 },
      strafe: 0,
      forward: -1,
      running: false,
      delta: 1,
      collisionSegments: [],
      wallThickness: 0.5,
      npcBlockers: [],
      solidNpcFlags: [],
      bounds: defaultBounds,
    });

    expect(result.locomotion).toBe('walkBackward');
    expect(result.z).toBeGreaterThan(0);
  });

  it('selects runBackward and moves slower than forward run', () => {
    const run = advancePlayerTransform({
      transform: { x: 0, z: 0, yaw: 0 },
      strafe: 0,
      forward: 1,
      running: true,
      delta: 1,
      collisionSegments: [],
      wallThickness: 0.5,
      npcBlockers: [],
      solidNpcFlags: [],
      bounds: defaultBounds,
    });

    const runBack = advancePlayerTransform({
      transform: { x: 0, z: 0, yaw: 0 },
      strafe: 0,
      forward: -1,
      running: true,
      delta: 1,
      collisionSegments: [],
      wallThickness: 0.5,
      npcBlockers: [],
      solidNpcFlags: [],
      bounds: defaultBounds,
    });

    expect(runBack.locomotion).toBe('runBackward');
    expect(Math.abs(runBack.z)).toBeGreaterThan(0);
    expect(Math.abs(runBack.z)).toBeLessThan(Math.abs(run.z));
  });

  it('does not backpedal when strafe dominates forward', () => {
    const result = advancePlayerTransform({
      transform: { x: 0, z: 0, yaw: 0 },
      strafe: 2,
      forward: -1,
      running: false,
      delta: 1,
      collisionSegments: [],
      wallThickness: 0.5,
      npcBlockers: [],
      solidNpcFlags: [],
      bounds: defaultBounds,
    });

    expect(result.locomotion).toBe('walk');
  });

  it('clamps to bounds', () => {
    const result = advancePlayerTransform({
      transform: { x: 18, z: 0, yaw: 0 },
      strafe: 1,
      forward: 0,
      running: false,
      delta: 10,
      collisionSegments: [],
      wallThickness: 0.5,
      npcBlockers: [],
      solidNpcFlags: [],
      bounds: defaultBounds,
    });

    expect(result.x).toBeLessThanOrEqual(20);
  });

  it('respects NPC blockers', () => {
    const result = advancePlayerTransform({
      transform: { x: 0, z: -0.3, yaw: 0 },
      strafe: 0,
      forward: 1,
      running: false,
      delta: 0.016,
      collisionSegments: [],
      wallThickness: 0.5,
      npcBlockers: [{ x: 0, z: -1, radius: 0.5 }],
      solidNpcFlags: [true],
      bounds: defaultBounds,
    });

    expect(result.z).toBeGreaterThanOrEqual(-0.5);
  });

  it('ignores eliminated NPCs', () => {
    const withoutNpc = advancePlayerTransform({
      transform: { x: 0, z: 0, yaw: 0 },
      strafe: 0,
      forward: 1,
      running: false,
      delta: 1,
      collisionSegments: [],
      wallThickness: 0.5,
      npcBlockers: [],
      solidNpcFlags: [],
      bounds: defaultBounds,
    });

    const withDeadNpc = advancePlayerTransform({
      transform: { x: 0, z: 0, yaw: 0 },
      strafe: 0,
      forward: 1,
      running: false,
      delta: 1,
      collisionSegments: [],
      wallThickness: 0.5,
      npcBlockers: [{ x: 0, z: -1, radius: 0.5 }],
      solidNpcFlags: [false],
      bounds: defaultBounds,
    });

    expect(withDeadNpc.z).toBeCloseTo(withoutNpc.z);
  });

  it('blocks walking into a covered-car oriented box', () => {
    const result = advancePlayerTransform({
      transform: { x: 0, z: 2.7, yaw: 0 },
      strafe: 0,
      forward: 1,
      running: false,
      delta: 0.1,
      collisionSegments: [],
      wallThickness: 0.5,
      npcBlockers: [],
      solidNpcFlags: [],
      boxBlockers: [{ x: 0, z: 0, halfWidth: 0.9, halfDepth: 2.19, yaw: 0 }],
      bounds: defaultBounds,
    });

    expect(result.z).toBeCloseTo(2.59);
    expect(result.x).toBeCloseTo(0);
  });

  it('pushes a player already inside a car even when standing still', () => {
    const result = advancePlayerTransform({
      transform: { x: 0, z: 0.2, yaw: 0 },
      strafe: 0,
      forward: 0,
      running: false,
      delta: 0.016,
      collisionSegments: [],
      wallThickness: 0.5,
      npcBlockers: [],
      solidNpcFlags: [],
      boxBlockers: [{ x: 0, z: 0, halfWidth: 0.9, halfDepth: 2.19, yaw: 0 }],
      bounds: defaultBounds,
    });

    expect(Math.abs(result.x)).toBeCloseTo(1.3);
    expect(result.z).toBeCloseTo(0.2);
  });
});
