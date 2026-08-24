import { AnimationClip, QuaternionKeyframeTrack, VectorKeyframeTrack } from 'three';
import { describe, expect, it, vi } from 'vitest';

import { getSoldierSkinById } from '@/modules/soldiers/get-soldier-skin-by-id';
import { resolveSoldierClips } from '@/modules/soldiers/utils/resolve-soldier-clips';

// Registry preloads on import; keep the data test loader-free.
vi.mock('@react-three/drei', () => ({
  useGLTF: { preload: vi.fn() },
}));

const HIPS_TRACK = /Hips\.(?:position|translation)$/i;

function clipWithHipsTrack(name: string): AnimationClip {
  return new AnimationClip(name, 1, [
    new QuaternionKeyframeTrack('mixamorigSpine.quaternion', [0, 1], [0, 0, 0, 1, 0, 0, 0, 1]),
    new VectorKeyframeTrack('mixamorigHips.position', [0, 1], [0, -0.9, 0, 0, -0.9, 0]),
  ]);
}

describe('resolve-soldier-clips', () => {
  const skin = getSoldierSkinById('swat-guy');

  it('resolves every registry clip name', () => {
    const resolved = resolveSoldierClips(
      Object.values(skin.meshData.animations).map(clipWithHipsTrack),
      skin.meshData.animations,
    );
    expect(Object.keys(resolved ?? {})).toEqual([
      'idle',
      'walk',
      'run',
      'jump',
      'kneel',
      'reloading',
      'shooting',
    ]);
  });

  it('returns null when a configured clip is missing', () => {
    const resolved = resolveSoldierClips(
      ['idle', 'walk'].map(clipWithHipsTrack),
      skin.meshData.animations,
    );
    expect(resolved).toBeNull();
  });

  it('strips hips translation from locomotion but keeps it on action clips', () => {
    const resolved = resolveSoldierClips(
      Object.values(skin.meshData.animations).map(clipWithHipsTrack),
      skin.meshData.animations,
    )!;

    for (const key of ['idle', 'walk', 'run'] as const) {
      expect(resolved[key].tracks.some((track) => HIPS_TRACK.test(track.name))).toBe(false);
    }
    // Without these tracks jump never leaves the ground and kneel never crouches.
    for (const key of ['jump', 'kneel'] as const) {
      expect(resolved[key].tracks.some((track) => HIPS_TRACK.test(track.name))).toBe(true);
    }
  });
});
