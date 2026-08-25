import type { Intersection, Object3D } from 'three';
import { Mesh, Object3D as Obj3D, Vector3 } from 'three';
import { describe, expect, it } from 'vitest';
import { LOCAL_PLAYER_ROOT_NAME } from '@/modules/game/constants/player';
import { pickAimSurface, pickBulletHit, resolveHitTags } from '@/modules/game/utils/pick-bullet-hit';

function stubIntersection(object: Object3D, distance: number): Intersection {
  return {
    distance,
    point: new Vector3(0, 0, -distance),
    object,
    face: null,
    faceIndex: 0,
    uv: undefined,
    uv1: undefined,
    normal: undefined,
  } as Intersection;
}

describe('resolveHitTags', () => {
  it('reads entityId + hitZone from the mesh itself', () => {
    const mesh = new Mesh();
    mesh.userData = { entityId: 'civilian-0', hitZone: 'head' };
    expect(resolveHitTags(mesh)).toEqual({ entityId: 'civilian-0', hitZone: 'head' });
  });

  it('walks up to a parent entityId when the mesh has none', () => {
    const root = new Obj3D();
    root.userData = { entityId: 'civilian-0' };
    const mesh = new Mesh();
    root.add(mesh);
    expect(resolveHitTags(mesh)).toEqual({ entityId: 'civilian-0', hitZone: null });
  });
});

describe('pickBulletHit', () => {
  it('returns a hit when the ray meets an enemy root mesh', () => {
    const root = new Obj3D();
    root.userData = { entityId: 'civilian-0' };
    const mesh = new Mesh();
    mesh.visible = true;
    root.add(mesh);

    const result = pickBulletHit([stubIntersection(mesh, 5)], 'local-player');
    expect(result).toEqual({
      entityId: 'civilian-0',
      hitZone: 'body',
      point: [0, 0, -5],
      distance: 5,
    });
  });

  it('preserves hitZone from a hitbox mesh', () => {
    const mesh = new Mesh();
    mesh.visible = false;
    mesh.userData = { entityId: 'civilian-0', hitZone: 'head' };
    const result = pickBulletHit([stubIntersection(mesh, 3)], 'local-player');
    expect(result?.hitZone).toBe('head');
  });

  it('refines body default to head when a hitbox follows the mesh hit', () => {
    const root = new Obj3D();
    root.userData = { entityId: 'civilian-0' };
    const skin = new Mesh();
    skin.visible = true;
    root.add(skin);

    const headBox = new Mesh();
    headBox.visible = false;
    headBox.userData = { entityId: 'civilian-0', hitZone: 'head' };

    const result = pickBulletHit(
      [stubIntersection(skin, 4), stubIntersection(headBox, 4.1)],
      'local-player',
    );
    expect(result?.hitZone).toBe('head');
  });

  it('skips the local player and continues', () => {
    const localRoot = new Obj3D();
    localRoot.name = LOCAL_PLAYER_ROOT_NAME;
    const localMesh = new Mesh();
    localRoot.add(localMesh);

    const enemy = new Mesh();
    enemy.userData = { entityId: 'civilian-0', hitZone: 'body' };

    const result = pickBulletHit(
      [stubIntersection(localMesh, 1), stubIntersection(enemy, 4)],
      'local-player',
    );
    expect(result?.entityId).toBe('civilian-0');
  });

  it('stops at visible world geometry (no shoot-through)', () => {
    const wall = new Mesh();
    wall.visible = true;
    const enemy = new Mesh();
    enemy.userData = { entityId: 'civilian-0', hitZone: 'body' };

    const result = pickBulletHit(
      [stubIntersection(wall, 2), stubIntersection(enemy, 6)],
      'local-player',
    );
    expect(result).toBeNull();
  });
});

describe('pickAimSurface', () => {
  it('places on soldier hitboxes before world geometry behind them', () => {
    const marker = new Mesh();
    const hitbox = new Mesh();
    hitbox.visible = false;
    hitbox.userData = { hitZone: 'body', entityId: 'civilian-0' };
    const floor = new Mesh();
    floor.visible = true;

    const hit = pickAimSurface(
      [stubIntersection(hitbox, 1), stubIntersection(floor, 2)],
      marker,
    );
    expect(hit?.object).toBe(hitbox);
  });

  it('falls through to visible world geometry when nothing is tagged', () => {
    const marker = new Mesh();
    const floor = new Mesh();
    floor.visible = true;

    const hit = pickAimSurface([stubIntersection(floor, 2)], marker);
    expect(hit?.object).toBe(floor);
  });
});
