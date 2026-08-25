import { Group, Scene, Vector3 } from 'three';
import { describe, expect, it } from 'vitest';
import { findEntityWorldPosition } from '@/modules/game/utils/find-entity-world-position';

describe('findEntityWorldPosition', () => {
  it('prefers the named soldier root over hitbox children', () => {
    const scene = new Scene();
    const root = new Group();
    root.name = 'local-player';
    root.position.set(4, 0, 8);
    scene.add(root);

    const hitbox = new Group();
    hitbox.userData = { entityId: 'local-player', hitZone: 'body' };
    hitbox.position.set(0, 1, 0);
    root.add(hitbox);

    const target = new Vector3();
    const found = findEntityWorldPosition(scene, 'local-player', target);
    expect(found).toBe(target);
    expect(found?.x).toBeCloseTo(4);
    expect(found?.z).toBeCloseTo(8);
  });
});
