import { AnimationClip } from 'three';
import { describe, expect, it } from 'vitest';

import { mergeSoldierClips } from '@/modules/soldiers/utils/merge-soldier-clips';

function namedClip(name: string): AnimationClip {
  return new AnimationClip(name, 1, []);
}

describe('merge-soldier-clips', () => {
  it('merges mesh and shared clips by name', () => {
    const merged = mergeSoldierClips(
      [namedClip('mixamo.com'), namedClip('idle')],
      [namedClip('walk'), namedClip('run')],
    );
    expect(merged.map((clip) => clip.name).sort()).toEqual([
      'idle',
      'mixamo.com',
      'run',
      'walk',
    ]);
  });

  it('lets shared clips win on name collision', () => {
    const meshIdle = namedClip('idle');
    const sharedIdle = namedClip('idle');
    const merged = mergeSoldierClips([meshIdle], [sharedIdle]);
    expect(merged).toHaveLength(1);
    expect(merged[0]).toBe(sharedIdle);
  });

  it('returns shared-only when mesh has no clips', () => {
    const shared = [namedClip('idle'), namedClip('walk')];
    expect(mergeSoldierClips([], shared)).toEqual(shared);
  });
});
