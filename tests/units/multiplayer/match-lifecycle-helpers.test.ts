import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMatchCountdown } from '@/modules/multiplayer/rooms/create-match-countdown';
import { scheduleMatchExpiry } from '@/modules/multiplayer/rooms/schedule-match-expiry';
import { createMatchState } from '@/modules/multiplayer/schema/match-state';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('createMatchCountdown', () => {
  it('sets the countdown phase and ticks down to in_progress', () => {
    const state = createMatchState();
    const countdown = createMatchCountdown(state, 1_000);

    countdown.begin(3);
    expect(state).toMatchObject({ roundPhase: 'countdown', countdown: 3 });

    vi.advanceTimersByTime(1_000);
    expect(state).toMatchObject({ countdown: 2 });

    vi.advanceTimersByTime(2_000);
    expect(state).toMatchObject({ roundPhase: 'in_progress', countdown: 0 });
  });

  it('clear stops the interval so the phase no longer advances', () => {
    const state = createMatchState();
    const countdown = createMatchCountdown(state, 1_000);

    countdown.begin(3);
    countdown.clear();
    vi.advanceTimersByTime(3_000);

    expect(state).toMatchObject({ roundPhase: 'countdown', countdown: 3 });
  });

  it('re-begin restarts from a fresh value', () => {
    const state = createMatchState();
    const countdown = createMatchCountdown(state, 1_000);

    countdown.begin(3);
    vi.advanceTimersByTime(1_000);
    countdown.begin(5);

    expect(state).toMatchObject({ roundPhase: 'countdown', countdown: 5 });
    vi.advanceTimersByTime(1_000);
    expect(state).toMatchObject({ countdown: 4 });
  });
});

describe('scheduleMatchExpiry', () => {
  it('calls onExpired after the expiresAt plus grace window', () => {
    const onExpired = vi.fn();
    const expiry = scheduleMatchExpiry({ graceMs: 1_000, onExpired });
    const expiresAt = new Date(Date.now() + 5_000).toISOString();

    expiry.schedule(expiresAt);
    expect(onExpired).not.toHaveBeenCalled();

    vi.advanceTimersByTime(5_000);
    expect(onExpired).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1_000);
    expect(onExpired).toHaveBeenCalledTimes(1);
  });

  it('fires immediately when the room already expired', () => {
    const onExpired = vi.fn();
    const expiry = scheduleMatchExpiry({ graceMs: 1_000, onExpired });
    const expiresAt = new Date(Date.now() - 5_000).toISOString();

    expiry.schedule(expiresAt);
    expect(onExpired).toHaveBeenCalledTimes(1);
  });

  it('cancel prevents the scheduled dispose', () => {
    const onExpired = vi.fn();
    const expiry = scheduleMatchExpiry({ graceMs: 1_000, onExpired });

    expiry.schedule(new Date(Date.now() + 5_000).toISOString());
    expiry.cancel();

    vi.advanceTimersByTime(10_000);
    expect(onExpired).not.toHaveBeenCalled();
  });

  it('reschedule supersedes a pending timer and uses the fresh expiresAt', () => {
    const onExpired = vi.fn();
    const expiry = scheduleMatchExpiry({ graceMs: 1_000, onExpired });

    expiry.schedule(new Date(Date.now() + 5_000).toISOString());
    // Renewal slides the expiry forward well past the first timer.
    expiry.schedule(new Date(Date.now() + 30_000).toISOString());

    vi.advanceTimersByTime(6_000);
    expect(onExpired).not.toHaveBeenCalled();

    vi.advanceTimersByTime(25_000);
    expect(onExpired).toHaveBeenCalledTimes(1);
  });

  it('ignores an invalid or missing expiresAt', () => {
    const onExpired = vi.fn();
    const expiry = scheduleMatchExpiry({ graceMs: 1_000, onExpired });

    expiry.schedule(undefined);
    expiry.schedule('not-a-date');

    vi.advanceTimersByTime(10_000);
    expect(onExpired).not.toHaveBeenCalled();
  });
});
