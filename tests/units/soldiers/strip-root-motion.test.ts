import { AnimationClip, QuaternionKeyframeTrack, VectorKeyframeTrack } from 'three';
import { describe, expect, it } from 'vitest';

import { stripHipsTranslation } from '@/modules/soldiers/utils/strip-root-motion';

const HIPS_TRACK = /Hips\.(?:position|translation)$/i;

function createClipWithHipsTrack(name: string, duration = 1): AnimationClip {
  return new AnimationClip(name, duration, [
    new QuaternionKeyframeTrack('mixamorigSpine.quaternion', [0, duration], [0, 0, 0, 1, 0, 0, 0, 1]),
    new VectorKeyframeTrack('mixamorigHips.position', [0, duration], [0, -0.9, 0, 0, -0.9, 0]),
  ]);
}

function createClipWithoutHipsTrack(name: string, duration = 1): AnimationClip {
  return new AnimationClip(name, duration, [
    new QuaternionKeyframeTrack('mixamorigSpine.quaternion', [0, duration], [0, 0, 0, 1, 0, 0, 0, 1]),
  ]);
}

describe('strip-root-motion', () => {
  describe('stripHipsTranslation', () => {
    it('removes hips translation tracks from walk clip', () => {
      const clip = createClipWithHipsTrack('walk');
      const stripped = stripHipsTranslation(clip);

      expect(stripped.tracks.some((track) => HIPS_TRACK.test(track.name))).toBe(false);
      expect(stripped.tracks.length).toBe(1);
      expect(stripped.tracks[0].name).toBe('mixamorigSpine.quaternion');
    });

    it('removes hips translation tracks from run clip', () => {
      const clip = createClipWithHipsTrack('run');
      const stripped = stripHipsTranslation(clip);

      expect(stripped.tracks.some((track) => HIPS_TRACK.test(track.name))).toBe(false);
      expect(stripped.tracks.length).toBe(1);
      expect(stripped.tracks[0].name).toBe('mixamorigSpine.quaternion');
    });

    it('preserves other animation tracks', () => {
      const clip = createClipWithHipsTrack('walk');
      const stripped = stripHipsTranslation(clip);

      expect(stripped.tracks.filter((track) => track.name.includes('Spine'))).toHaveLength(1);
    });

    it('preserves clip name and duration', () => {
      const clip = createClipWithHipsTrack('run', 1.5);
      const stripped = stripHipsTranslation(clip);

      expect(stripped.name).toBe('run');
      expect(stripped.duration).toBe(1.5);
    });

    it('returns same clip instance when no hips tracks are present', () => {
      const clip = createClipWithoutHipsTrack('idle');
      const stripped = stripHipsTranslation(clip);

      expect(stripped).toBe(clip);
    });

    it('removes all hips translation track variations', () => {
      const clip = new AnimationClip('walk', 1, [
        new VectorKeyframeTrack('mixamorigHips.position', [0, 1], [0, -0.9, 0, 0, -0.9, 0]),
        new VectorKeyframeTrack('mixamorig:Hips.translation', [0, 1], [0, -0.9, 0, 0, -0.9, 0]),
        new VectorKeyframeTrack('mixamorigHips.translation', [0, 1], [0, -0.9, 0, 0, -0.9, 0]),
        new QuaternionKeyframeTrack('mixamorigSpine.quaternion', [0, 1], [0, 0, 0, 1, 0, 0, 0, 1]),
      ]);
      const stripped = stripHipsTranslation(clip);

      expect(stripped.tracks.some((track) => HIPS_TRACK.test(track.name))).toBe(false);
      expect(stripped.tracks.length).toBe(1);
    });
  });
});
