import { describe, expect, it } from 'vitest';
import { LOCOMOTION_SOUND_MAX_DISTANCE } from '@/modules/game/constants/locomotion-sounds';
import { LOCAL_PLAYER_ENTITY_ID } from '@/modules/game/constants/player';
import { resolveInjurySpatialVolume } from '@/modules/game/utils/play-injury-sound';

describe('resolveInjurySpatialVolume', () => {
  const listener = { x: 0, y: 0, z: 0 };

  it('is full volume for the local player even without a world source', () => {
    expect(resolveInjurySpatialVolume(LOCAL_PLAYER_ENTITY_ID, null, listener)).toBe(1);
  });

  it('is silent for a remote peer with no position', () => {
    expect(resolveInjurySpatialVolume('peer', null, listener)).toBe(0);
  });

  it('falls off like footsteps and is silent at 40 m', () => {
    const half = LOCOMOTION_SOUND_MAX_DISTANCE / 2;
    expect(
      resolveInjurySpatialVolume('peer', { x: half, y: 0, z: 0 }, listener),
    ).toBeCloseTo(0.5);
    expect(
      resolveInjurySpatialVolume(
        'peer',
        { x: LOCOMOTION_SOUND_MAX_DISTANCE, y: 0, z: 0 },
        listener,
      ),
    ).toBe(0);
  });
});
