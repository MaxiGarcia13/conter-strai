import { Bone, Group } from 'three';
import { describe, expect, it } from 'vitest';

import { findRightHandBone } from '@/modules/weapons/utils/find-right-hand-bone';

function addBone(parent: Group, name: string): Bone {
  const bone = new Bone();
  bone.name = name;
  parent.add(bone);
  return bone;
}

describe('findRightHandBone', () => {
  it('finds mixamorig:RightHand', () => {
    const root = new Group();
    const hand = addBone(root, 'mixamorig:RightHand');
    expect(findRightHandBone(root)).toBe(hand);
  });

  it('finds sanitized mixamorigRightHand', () => {
    const root = new Group();
    const hand = addBone(root, 'mixamorigRightHand');
    expect(findRightHandBone(root)).toBe(hand);
  });

  it('returns null when the bone is missing', () => {
    expect(findRightHandBone(new Group())).toBeNull();
  });
});
