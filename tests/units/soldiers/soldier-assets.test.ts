import { NodeIO } from '@gltf-transform/core';
import { beforeAll, describe, expect, it } from 'vitest';

describe('shared animation pack', () => {
  let animationNames: string[];

  beforeAll(async () => {
    const io = new NodeIO();
    const doc = await io.read('./public/assets/characters/shared/base-animations.glb');
    const root = doc.getRoot();
    animationNames = root.listAnimations().map((a) => a.getName());
  });

  it('has all required locomotion clips', () => {
    const requiredClips = ['idle', 'walk', 'run', 'crouch-walking'];
    for (const clip of requiredClips) {
      expect(animationNames).toContain(clip);
    }
  });

  it('has required action clips', () => {
    const requiredClips = ['jump', 'kneel', 'dying'];
    for (const clip of requiredClips) {
      expect(animationNames).toContain(clip);
    }
  });
});

describe('remy.glb', () => {
  let nodeNames: Set<string>;
  let animationNames: string[];

  beforeAll(async () => {
    const io = new NodeIO();
    const doc = await io.read('./public/assets/characters/civilians/remy.glb');
    const root = doc.getRoot();
    nodeNames = new Set(root.listNodes().map((n) => n.getName()));
    animationNames = root.listAnimations().map((a) => a.getName());
  });

  it('has Armature root', () => {
    expect(nodeNames.has('Armature')).toBe(true);
  });

  it('has skeleton bones', () => {
    const hasHips
      = nodeNames.has('mixamorig:Hips')
        || nodeNames.has('mixamorigHips')
        || nodeNames.has('Hips');
    expect(hasHips).toBe(true);
  });

  it('all animation track targets reference existing nodes', async () => {
    const io = new NodeIO();
    const doc = await io.read('./public/assets/characters/civilians/remy.glb');
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

describe('swat-1.glb', () => {
  let nodeNames: Set<string>;
  let animationNames: string[];

  beforeAll(async () => {
    const io = new NodeIO();
    const doc = await io.read('./public/assets/characters/soldiers/swat-1.glb');
    const root = doc.getRoot();
    nodeNames = new Set(root.listNodes().map((n) => n.getName()));
    animationNames = root.listAnimations().map((a) => a.getName());
  });

  it('has Armature root', () => {
    expect(nodeNames.has('Armature')).toBe(true);
  });

  it('has skeleton bones', () => {
    const hasHips
      = nodeNames.has('mixamorig:Hips')
        || nodeNames.has('mixamorigHips')
        || nodeNames.has('Hips');
    expect(hasHips).toBe(true);

    const hasHead
      = nodeNames.has('mixamorig:Head')
        || nodeNames.has('mixamorigHead')
        || nodeNames.has('Head');
    expect(hasHead).toBe(true);
  });

  it('all animation track targets reference existing nodes', async () => {
    const io = new NodeIO();
    const doc = await io.read('./public/assets/characters/soldiers/swat-1.glb');
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
