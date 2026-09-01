import { AnimationClip, QuaternionKeyframeTrack, VectorKeyframeTrack } from 'three';
import { describe, expect, it } from 'vitest';

import { LOBBY_PREVIEW_SOLDIER_CLIP } from '@/modules/lobby/constants/idle-fight';
import { prepareLobbyIdleClip } from '@/modules/lobby/utils/prepare-lobby-idle-clip';

const HIPS_TRACK = /Hips\.(?:position|translation)$/i;

function createClipWithHipsTrack(name: string, duration = 1): AnimationClip {
  return new AnimationClip(name, duration, [
    new QuaternionKeyframeTrack('mixamorigSpine.quaternion', [0, duration], [0, 0, 0, 1, 0, 0, 0, 1]),
    new VectorKeyframeTrack('mixamorigHips.position', [0, duration], [0, -0.9, 0, 0, -0.9, 0]),
  ]);
}

describe('prepareLobbyIdleClip', () => {
  it('returns null when the named clip is missing', () => {
    expect(prepareLobbyIdleClip([], LOBBY_PREVIEW_SOLDIER_CLIP)).toBeNull();
    expect(prepareLobbyIdleClip([createClipWithHipsTrack('other')], LOBBY_PREVIEW_SOLDIER_CLIP)).toBeNull();
  });

  it('selects by name, strips hips translation, and keeps the asset clip name', () => {
    const fight = createClipWithHipsTrack(LOBBY_PREVIEW_SOLDIER_CLIP);
    const extra = createClipWithHipsTrack('looking-around');
    const prepared = prepareLobbyIdleClip([extra, fight], LOBBY_PREVIEW_SOLDIER_CLIP);

    expect(prepared).not.toBeNull();
    expect(prepared?.name).toBe(LOBBY_PREVIEW_SOLDIER_CLIP);
    expect(prepared?.duration).toBe(1);
    expect(prepared?.tracks.some((track) => HIPS_TRACK.test(track.name))).toBe(false);
    expect(prepared?.tracks[0]?.name).toBe('mixamorigSpine.quaternion');
  });

  it('does not mutate the source clip', () => {
    const source = createClipWithHipsTrack(LOBBY_PREVIEW_SOLDIER_CLIP);
    prepareLobbyIdleClip([source], LOBBY_PREVIEW_SOLDIER_CLIP);

    expect(source.name).toBe(LOBBY_PREVIEW_SOLDIER_CLIP);
    expect(source.tracks.some((track) => HIPS_TRACK.test(track.name))).toBe(true);
  });
});
