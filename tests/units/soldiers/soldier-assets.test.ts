import { NodeIO } from '@gltf-transform/core';
import { beforeAll, describe, expect, it } from 'vitest';

const CHARACTER_MESHES = [
  { id: 'remy', path: './public/assets/characters/civilians/remy.glb' },
  { id: 'james', path: './public/assets/characters/civilians/james.glb' },
  { id: 'liza', path: './public/assets/characters/civilians/liza.glb' },
  { id: 'swat-1', path: './public/assets/characters/soldiers/swat-1.glb' },
  { id: 'swat-2', path: './public/assets/characters/soldiers/swat-2.glb' },
  { id: 'swat-3', path: './public/assets/characters/soldiers/swat-3.glb' },
] as const;

describe('shared animation pack', () => {
  let animationNames: string[];

  beforeAll(async () => {
    const io = new NodeIO();
    const doc = await io.read('./public/assets/characters/shared/base-animations.glb');
    const root = doc.getRoot();
    animationNames = root.listAnimations().map((a) => a.getName());
  });

  it('has all required locomotion clips', () => {
    const requiredClips = ['idle-shooting', 'walk', 'run', 'crouch-walking'];
    for (const clip of requiredClips) {
      expect(animationNames).toContain(clip);
    }
  });

  it('has required action clips', () => {
    const requiredClips = ['jump', 'kneel', 'dying', 'reloading', 'reloading-kneel', 'shooting', 'hit-reaction'];
    for (const clip of requiredClips) {
      expect(animationNames).toContain(clip);
    }
  });
});

for (const mesh of CHARACTER_MESHES) {
  describe(`${mesh.id}.glb`, () => {
    let nodeNames: Set<string>;

    beforeAll(async () => {
      const io = new NodeIO();
      const doc = await io.read(mesh.path);
      const root = doc.getRoot();
      nodeNames = new Set(root.listNodes().map((n) => n.getName()));
    });

    it('has Armature root', () => {
      expect(nodeNames.has('Armature')).toBe(true);
    });

    it('uses mixamorig: skeleton contract', () => {
      expect(nodeNames.has('mixamorig:Hips')).toBe(true);
      expect(nodeNames.has('mixamorig:Head')).toBe(true);
      for (const name of nodeNames) {
        expect(name).not.toMatch(/^mixamorig\d+:/);
      }
    });

    it('all animation track targets reference existing nodes', async () => {
      const io = new NodeIO();
      const doc = await io.read(mesh.path);
      const root = doc.getRoot();
      const allNodes = new Set(root.listNodes().map((n) => n.getName()));

      for (const animation of root.listAnimations()) {
        for (const channel of animation.listChannels()) {
          const targetNode = channel.getTargetNode();
          if (targetNode) {
            expect(allNodes.has(targetNode.getName())).toBe(true);
          }
        }
      }
    });
  });
}
