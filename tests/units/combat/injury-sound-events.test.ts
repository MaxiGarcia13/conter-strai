import { afterEach, describe, expect, it } from 'vitest';
import {
  drainDueInjurySounds,
  INJURY_SOUND_DELAY_MS,
  requestInjurySound,
  resetInjurySoundForTests,
} from '@/modules/combat/injury-sound-events';

describe('injury-sound-events', () => {
  afterEach(() => {
    resetInjurySoundForTests();
  });

  it('holds the grunt until the delay elapses', () => {
    requestInjurySound('peer', 0);

    expect(drainDueInjurySounds(INJURY_SOUND_DELAY_MS - 1)).toEqual([]);
    expect(drainDueInjurySounds(INJURY_SOUND_DELAY_MS)).toEqual(['peer']);
    expect(drainDueInjurySounds(INJURY_SOUND_DELAY_MS + 1)).toEqual([]);
  });

  it('keeps a queued hit if the canvas hook was not mounted yet', () => {
    requestInjurySound('peer', 0);

    expect(drainDueInjurySounds(INJURY_SOUND_DELAY_MS)).toEqual(['peer']);
  });

  it('coalesces repeat hits on the same entity until drained', () => {
    requestInjurySound('peer', 0);
    requestInjurySound('peer', 40);

    expect(drainDueInjurySounds(INJURY_SOUND_DELAY_MS)).toEqual(['peer']);
  });
});
