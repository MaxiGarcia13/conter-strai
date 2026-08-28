import { describe, expect, it } from 'vitest';
import {
  REMOTE_IDLE_HOLD_MS,
  REMOTE_IDLE_SPEED_MPS,
  REMOTE_RUN_ENTER_MPS,
  REMOTE_RUN_EXIT_MPS,
  resolveRemoteLocomotionForAnimation,
  resolveRemotePlayback,
  updateRemoteMotion,
} from '@/modules/multiplayer/utils/resolve-remote-locomotion';
import {
  REMOTE_SNAP_DISTANCE,
  stepRemoteRenderTransform,
} from '@/modules/multiplayer/utils/step-remote-render-transform';

describe('updateRemoteMotion', () => {
  it('starts idle and keeps idle when the sample is unchanged', () => {
    const first = updateRemoteMotion(null, { x: 0, z: 0, rotY: 0 }, 0);
    expect(first.locomotion).toBe('idle');

    const held = updateRemoteMotion(first, { x: 0, z: 0, rotY: 0 }, 16);
    expect(held).toBe(first);
  });

  it('returns idle for tiny moves below the speed threshold', () => {
    const start = updateRemoteMotion(null, { x: 0, z: 0, rotY: 0 }, 0);
    const dtMs = 100;
    const distance = REMOTE_IDLE_SPEED_MPS * 0.5 * (dtMs / 1000);
    const next = updateRemoteMotion(start, { x: distance, z: 0, rotY: 0 }, dtMs);
    expect(next.locomotion).toBe('idle');
  });

  it('sets walk on movement and holds it between 20 Hz sync gaps', () => {
    const start = updateRemoteMotion(null, { x: 0, z: 0, rotY: 0 }, 0);
    const moving = updateRemoteMotion(start, { x: 0.25, z: 0, rotY: 0 }, 50);
    expect(moving.locomotion).toBe('walk');

    const betweenSync = updateRemoteMotion(moving, { x: 0.25, z: 0, rotY: 0 }, 66);
    expect(betweenSync.locomotion).toBe('walk');
    expect(betweenSync).toBe(moving);

    const stillHolding = updateRemoteMotion(moving, { x: 0.25, z: 0, rotY: 0 }, 50 + REMOTE_IDLE_HOLD_MS - 1);
    expect(stillHolding.locomotion).toBe('walk');

    const stopped = updateRemoteMotion(moving, { x: 0.25, z: 0, rotY: 0 }, 50 + REMOTE_IDLE_HOLD_MS);
    expect(stopped.locomotion).toBe('idle');
  });

  it('promotes to run for fast sync deltas', () => {
    const start = updateRemoteMotion(null, { x: 0, z: 0, rotY: 0 }, 0);
    const distance = REMOTE_RUN_ENTER_MPS * 0.05;
    const running = updateRemoteMotion(start, { x: distance, z: 0, rotY: 0 }, 50);
    expect(running.locomotion).toBe('run');
  });

  it('does not false-promote to run on bursty sync deltas', () => {
    const start = updateRemoteMotion(null, { x: 0, z: 0, rotY: 0 }, 0);
    const walking = updateRemoteMotion(start, { x: 0.25, z: 0, rotY: 0 }, 50);
    expect(walking.locomotion).toBe('walk');

    const bursty = updateRemoteMotion(walking, { x: 0.5, z: 0, rotY: 0 }, 60);
    expect(bursty.locomotion).toBe('walk');
  });

  it('keeps run until speed drops below the exit threshold', () => {
    const start = updateRemoteMotion(null, { x: 0, z: 0, rotY: 0 }, 0);
    const running = updateRemoteMotion(start, { x: REMOTE_RUN_ENTER_MPS * 0.05, z: 0, rotY: 0 }, 50);
    expect(running.locomotion).toBe('run');

    // Between exit and enter — would be walk without hysteresis, stays run.
    const mid = ((REMOTE_RUN_EXIT_MPS + REMOTE_RUN_ENTER_MPS) / 2) * 0.05;
    const stillRunning = updateRemoteMotion(running, { x: running.x + mid, z: 0, rotY: 0 }, 100);
    expect(stillRunning.locomotion).toBe('run');

    const walking = updateRemoteMotion(
      stillRunning,
      { x: stillRunning.x + REMOTE_RUN_EXIT_MPS * 0.4 * 0.05, z: 0, rotY: 0 },
      150,
    );
    expect(walking.locomotion).toBe('walk');
  });

  it('infers walkBackward when velocity is opposite facing', () => {
    const start = updateRemoteMotion(null, { x: 0, z: 0, rotY: 0 }, 0);
    // Facing −Z (rotY 0); moving +Z is backpedal.
    const backward = updateRemoteMotion(start, { x: 0, z: 0.25, rotY: 0 }, 50);
    expect(backward.locomotion).toBe('walkBackward');
  });

  it('infers runBackward for fast backpedal deltas', () => {
    const start = updateRemoteMotion(null, { x: 0, z: 0, rotY: 0 }, 0);
    const distance = REMOTE_RUN_ENTER_MPS * 0.05;
    const backward = updateRemoteMotion(start, { x: 0, z: distance, rotY: 0 }, 50);
    expect(backward.locomotion).toBe('runBackward');
  });

  it('snaps to idle on teleport-sized jumps (round respawn)', () => {
    const start = updateRemoteMotion(null, { x: 0, z: 0, rotY: 0 }, 0);
    const walking = updateRemoteMotion(start, { x: 0.25, z: 0, rotY: 0 }, 50);
    expect(walking.locomotion).toBe('walk');

    const respawned = updateRemoteMotion(
      walking,
      { x: walking.x + REMOTE_SNAP_DISTANCE + 1, z: 0, rotY: 0 },
      100,
    );
    expect(respawned.locomotion).toBe('idle');
    expect(respawned.x).toBe(walking.x + REMOTE_SNAP_DISTANCE + 1);
  });
});

describe('resolveRemoteLocomotionForAnimation', () => {
  it('caps inferred run to walk while kneeling', () => {
    const motion = { x: 1, z: 0, rotY: 0, movedAt: 100, locomotion: 'run' as const };
    expect(resolveRemoteLocomotionForAnimation(motion, 'kneel', 150)).toBe('walk');
  });

  it('holds walk during idle gaps while kneeling and recently moving', () => {
    const motion = { x: 1, z: 0, rotY: 0, movedAt: 100, locomotion: 'idle' as const };
    expect(resolveRemoteLocomotionForAnimation(motion, 'kneel', 100 + REMOTE_IDLE_HOLD_MS - 1)).toBe(
      'walk',
    );
  });

  it('allows idle kneel when movement has stopped', () => {
    const motion = { x: 1, z: 0, rotY: 0, movedAt: 100, locomotion: 'idle' as const };
    expect(resolveRemoteLocomotionForAnimation(motion, 'kneel', 100 + REMOTE_IDLE_HOLD_MS)).toBe(
      'idle',
    );
  });

  it('passes through forward or backward locomotion when not kneeling', () => {
    expect(resolveRemoteLocomotionForAnimation(
      { x: 1, z: 0, rotY: 0, movedAt: 100, locomotion: 'run' as const },
      undefined,
      150,
    )).toBe('run');
    expect(resolveRemoteLocomotionForAnimation(
      { x: 1, z: 0, rotY: 0, movedAt: 100, locomotion: 'walkBackward' as const },
      undefined,
      150,
    )).toBe('walkBackward');
    expect(resolveRemoteLocomotionForAnimation(
      { x: 1, z: 0, rotY: 0, movedAt: 100, locomotion: 'runBackward' as const },
      undefined,
      150,
    )).toBe('runBackward');
  });

  it('falls back to crouch-walk for backpedal while kneeling', () => {
    const motion = { x: 1, z: 0, rotY: 0, movedAt: 100, locomotion: 'walkBackward' as const };
    expect(resolveRemoteLocomotionForAnimation(motion, 'kneel', 150)).toBe('crouchWalking');
  });

  it('caps backpedal run to walk while kneeling (run-over-kneel)', () => {
    const motion = { x: 1, z: 0, rotY: 0, movedAt: 100, locomotion: 'runBackward' as const };
    expect(resolveRemoteLocomotionForAnimation(motion, 'kneel', 150)).toBe('walk');
  });
});

describe('resolveRemotePlayback', () => {
  it('plays a synced locomotion clip instead of inferred gait', () => {
    expect(resolveRemotePlayback({
      synced: 'walkBackward',
      poseEpoch: 0,
      inferredLocomotion: 'walk',
      heldOneShot: null,
      consumedEpoch: 0,
    })).toEqual({ pose: null, locomotion: 'walkBackward', heldOneShot: null });
  });

  it('plays crouch-walk from the sender instead of composing kneel + inferred walk', () => {
    expect(resolveRemotePlayback({
      synced: 'crouchWalking',
      poseEpoch: 0,
      inferredLocomotion: 'run',
      heldOneShot: null,
      consumedEpoch: 0,
    })).toEqual({ pose: null, locomotion: 'crouchWalking', heldOneShot: null });
  });

  it('keeps idle kneel without overlaying inferred movement', () => {
    expect(resolveRemotePlayback({
      synced: 'kneel',
      poseEpoch: 0,
      inferredLocomotion: 'walk',
      heldOneShot: null,
      consumedEpoch: 0,
    })).toEqual({ pose: 'kneel', locomotion: 'idle', heldOneShot: null });
  });

  it('holds a jump until the sender resumes locomotion', () => {
    expect(resolveRemotePlayback({
      synced: 'walk',
      poseEpoch: 1,
      inferredLocomotion: 'walk',
      heldOneShot: 'jump',
      consumedEpoch: 0,
    })).toEqual({ pose: null, locomotion: 'walk', heldOneShot: null });
  });

  it('starts a new jump when the pose epoch advances', () => {
    expect(resolveRemotePlayback({
      synced: 'jump',
      poseEpoch: 2,
      inferredLocomotion: 'idle',
      heldOneShot: 'jump',
      consumedEpoch: 1,
    })).toEqual({ pose: 'jump', locomotion: 'idle', heldOneShot: 'jump' });
  });

  it('does not replay a consumed jump that the store has not overwritten yet', () => {
    expect(resolveRemotePlayback({
      synced: 'jump',
      poseEpoch: 1,
      inferredLocomotion: 'idle',
      heldOneShot: null,
      consumedEpoch: 1,
    })).toEqual({ pose: null, locomotion: 'idle', heldOneShot: null });
  });
});

describe('stepRemoteRenderTransform', () => {
  it('snaps on first sample', () => {
    expect(stepRemoteRenderTransform(null, { x: 1, z: 2, rotY: 0.5 }, 1 / 60)).toEqual({
      x: 1,
      z: 2,
      rotY: 0.5,
    });
  });

  it('eases toward the target without overshooting', () => {
    const next = stepRemoteRenderTransform(
      { x: 0, z: 0, rotY: 0 },
      { x: 1, z: 0, rotY: 0 },
      1 / 60,
    );
    expect(next.x).toBeGreaterThan(0);
    expect(next.x).toBeLessThan(1);
  });

  it('takes the shortest yaw arc', () => {
    const next = stepRemoteRenderTransform(
      { x: 0, z: 0, rotY: Math.PI - 0.1 },
      { x: 0, z: 0, rotY: -Math.PI + 0.1 },
      1 / 60,
    );
    expect(Math.abs(next.rotY)).toBeGreaterThan(Math.PI - 0.1);
  });

  it('snaps when the target jumps farther than the snap distance', () => {
    const next = stepRemoteRenderTransform(
      { x: 0, z: 0, rotY: 0 },
      { x: REMOTE_SNAP_DISTANCE + 1, z: 0, rotY: 1 },
      1 / 60,
    );
    expect(next).toEqual({ x: REMOTE_SNAP_DISTANCE + 1, z: 0, rotY: 1 });
  });
});
