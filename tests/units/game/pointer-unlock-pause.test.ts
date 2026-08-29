import { describe, expect, it } from 'vitest';
import { shouldOpenPauseOnPointerUnlock } from '@/modules/game/hooks/use-player-controls/use-player-pointer-lock';

describe('shouldOpenPauseOnPointerUnlock', () => {
  it('opens pause when the browser releases pointer lock during live play', () => {
    expect(
      shouldOpenPauseOnPointerUnlock({
        wasIntentionalUnlock: false,
        suppressResumeUnlock: false,
        lookEnabled: true,
        eliminated: false,
        phase: 'live',
        isPaused: false,
      }),
    ).toBe(true);
  });

  it('ignores intentional unlocks from pause / round-end cleanup', () => {
    expect(
      shouldOpenPauseOnPointerUnlock({
        wasIntentionalUnlock: true,
        suppressResumeUnlock: false,
        lookEnabled: true,
        eliminated: false,
        phase: 'live',
        isPaused: false,
      }),
    ).toBe(false);
  });

  it('ignores unlock while resuming from pause on the same Esc key', () => {
    expect(
      shouldOpenPauseOnPointerUnlock({
        wasIntentionalUnlock: false,
        suppressResumeUnlock: true,
        lookEnabled: true,
        eliminated: false,
        phase: 'live',
        isPaused: false,
      }),
    ).toBe(false);
  });

  it('does not open pause when already paused or not live', () => {
    expect(
      shouldOpenPauseOnPointerUnlock({
        wasIntentionalUnlock: false,
        suppressResumeUnlock: false,
        lookEnabled: true,
        eliminated: false,
        phase: 'live',
        isPaused: true,
      }),
    ).toBe(false);

    expect(
      shouldOpenPauseOnPointerUnlock({
        wasIntentionalUnlock: false,
        suppressResumeUnlock: false,
        lookEnabled: true,
        eliminated: false,
        phase: 'round-end',
        isPaused: false,
      }),
    ).toBe(false);
  });
});
