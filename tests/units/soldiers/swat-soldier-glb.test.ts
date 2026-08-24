import { NodeIO } from '@gltf-transform/core';
import { beforeAll, describe, expect, it } from 'vitest';

/** Asset contract validator for swat-soldier.glb */
describe('swat-soldier-glb', () => {
  let nodeNames: Set<string>;
  let animationNames: string[];

  // Load GLB before tests run
  beforeAll(async () => {
    const io = new NodeIO();
    const doc = await io.read('./public/assets/soldiers/swat-soldier.glb');
    const root = doc.getRoot();

    nodeNames = new Set(root.listNodes().map((n) => n.getName()));
    animationNames = root.listAnimations().map((a) => a.getName());
  });

  describe('animation clips', () => {
    const requiredClips = ['idle', 'walk', 'run', 'jump', 'kneel', 'reloading', 'shooting'];
    const optionalClips = ['dying'];

    it('has all required locomotion and action clips', () => {
      for (const clip of requiredClips) {
        expect(animationNames).toContain(clip);
      }
    });

    it('should have dying animation', () => {
      expect(animationNames).toContain('dying');
    });

    it('does not have unexpected clip names (excluding mixamo.com metadata)', () => {
      // The loaded GLB may include "mixamo.com" as a metadata clip; filter it out
      const unexpectedClips = animationNames.filter(
        (name) =>
          name !== 'mixamo.com'
          && !requiredClips.includes(name)
          && !optionalClips.includes(name),
      );
      expect(unexpectedClips).toEqual([]);
    });
  });

  describe('scene nodes', () => {
    const requiredNodes = ['Armature', 'Soldier_body', 'Soldier_head'];

    it('has all required mesh/node names', () => {
      for (const node of requiredNodes) {
        expect(nodeNames.has(node)).toBe(true);
      }
    });
  });

  describe('skeleton bones', () => {
    it('has Hips bone (root of skeleton)', () => {
      const hasHips
        = nodeNames.has('mixamorig:Hips')
          || nodeNames.has('mixamorigHips')
          || nodeNames.has('Hips');
      expect(hasHips).toBe(true);
    });

    it('has Neck bone', () => {
      const hasNeck
        = nodeNames.has('mixamorig:Neck')
          || nodeNames.has('mixamorigNeck')
          || nodeNames.has('Neck');
      expect(hasNeck).toBe(true);
    });

    it('has Head bone', () => {
      const hasHead
        = nodeNames.has('mixamorig:Head')
          || nodeNames.has('mixamorigHead')
          || nodeNames.has('Head');
      expect(hasHead).toBe(true);
    });

    it('has hand bones', () => {
      const hasLeftHand
        = nodeNames.has('mixamorig:LeftHand')
          || nodeNames.has('mixamorigLeftHand')
          || nodeNames.has('LeftHand');
      const hasRightHand
        = nodeNames.has('mixamorig:RightHand')
          || nodeNames.has('mixamorigRightHand')
          || nodeNames.has('RightHand');

      expect(hasLeftHand).toBe(true);
      expect(hasRightHand).toBe(true);
    });
  });

  describe('propertyBinding validation', () => {
    it('all animation track targets reference existing nodes (no orphans)', async () => {
      const io = new NodeIO();
      const doc = await io.read('./public/assets/soldiers/swat-soldier.glb');
      const root = doc.getRoot();

      const allNodes = new Set(root.listNodes().map((n) => n.getName()));

      for (const animation of root.listAnimations()) {
        const channels = animation.listChannels();

        for (const channel of channels) {
          const targetNode = channel.getTargetNode();

          // Check if target node exists in scene
          if (targetNode) {
            const targetName = targetNode.getName();
            expect(allNodes.has(targetName)).toBe(true);
          }
        }
      }
    });
  });
});
