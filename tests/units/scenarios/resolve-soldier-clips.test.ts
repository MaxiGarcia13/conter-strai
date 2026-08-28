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
  const skin = getSoldierSkinById('swat-1');

  it('resolves every required registry clip name', () => {
    const resolved = resolveSoldierClips(
      Object.values(skin.meshData.animations).map(clipWithHipsTrack),
      skin.meshData.animations,
    );
    expect(Object.keys(resolved ?? {})).toEqual([
      'idle',
      'walk',
      'run',
      'crouchWalking',
      'jump',
      'jumpIdle',
      'walkBackward',
      'runBackward',
      'kneel',
      'dying',
      'reloading',
      'reloadingKneel',
      'shooting',
      'hitReaction',
    ]);
  });

  it('returns null when a required clip is missing', () => {
    const resolved = resolveSoldierClips(
      ['idle', 'walk'].map(clipWithHipsTrack),
      skin.meshData.animations,
    );
    expect(resolved).toBeNull();
  });

  it('returns null on empty clips', () => {
    const resolved = resolveSoldierClips([], skin.meshData.animations);
    expect(resolved).toBeNull();
  });

  it('strips hips translation from locomotion; keeps it on pose clips', () => {
    const resolved = resolveSoldierClips(
      Object.values(skin.meshData.animations).map(clipWithHipsTrack),
      skin.meshData.animations,
    )!;

    for (const key of ['idle', 'walk', 'run', 'crouchWalking', 'walkBackward', 'runBackward'] as const) {
      expect(resolved[key].tracks.some((track) => HIPS_TRACK.test(track.name))).toBe(false);
    }
    for (const key of ['jump', 'jumpIdle', 'kneel', 'dying'] as const) {
      expect(resolved[key].tracks.some((track) => HIPS_TRACK.test(track.name))).toBe(true);
    }
  });

  it('optional reloading absent returns no error', () => {
    const config = { ...skin.meshData.animations };
    delete (config as { reloading?: string }).reloading;
    const resolved = resolveSoldierClips(
      Object.values(config).map(clipWithHipsTrack),
      config,
    )!;
    expect(resolved.reloading).toBeUndefined();
    expect(resolved.shooting?.name).toBe('shooting');
    expect(resolved.hitReaction?.name).toBe('hit-reaction');
  });

  it('optional reloading/shooting/hitReaction present resolves them', () => {
    const config = {
      ...skin.meshData.animations,
      reloading: 'reloading',
      reloadingKneel: 'reloading-kneel',
      shooting: 'shooting',
      hitReaction: 'hit-reaction',
    };
    const clips = Object.values(config).map(clipWithHipsTrack);
    const resolved = resolveSoldierClips(clips, config)!;
    expect(resolved.reloading?.name).toBe('reloading');
    expect(resolved.reloadingKneel?.name).toBe('reloading-kneel');
    expect(resolved.shooting?.name).toBe('shooting');
    expect(resolved.hitReaction?.name).toBe('hit-reaction');
  });
});
