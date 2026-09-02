import type { Intersection, Object3D } from 'three';
import { Mesh, Object3D as Obj3D, Vector3 } from 'three';
import { describe, expect, it } from 'vitest';
import { LOCAL_PLAYER_ROOT_NAME } from '@/modules/game/constants/player';
import { pickCloseWorldImpact } from '@/modules/game/utils/pick-close-world-impact';
import { CLOSE_RANGE_IMPACT_METERS } from '@/modules/weapons/constants/pistol';

function stubIntersection(object: Object3D, distance: number, normal = new Vector3(0, 1, 0)): Intersection {
  return {
    distance,
    point: new Vector3(0, 0, -distance),
    object,
    face: { normal },
    faceIndex: 0,
    uv: undefined,
    uv1: undefined,
    normal: undefined,
  } as Intersection;
}

describe('pickCloseWorldImpact', () => {
  it('returns point + world normal for a visible wall within range', () => {
    const wall = new Mesh();
    wall.visible = true;

    const result = pickCloseWorldImpact([stubIntersection(wall, 1, new Vector3(0, 1, 0))]);
    expect(result).toEqual({
      point: [0, 0, -1],
      normal: [0, 1, 0],
    });
  });

  it('returns null beyond the close-range threshold', () => {
    const wall = new Mesh();
    wall.visible = true;

    expect(
      pickCloseWorldImpact([stubIntersection(wall, CLOSE_RANGE_IMPACT_METERS + 2)]),
    ).toBeNull();
  });

  it('skips the local player root then marks the wall behind it', () => {
    const localRoot = new Obj3D();
    localRoot.name = LOCAL_PLAYER_ROOT_NAME;
    const localSkin = new Mesh();
    localSkin.visible = true;
    localRoot.add(localSkin);

    const wall = new Mesh();
    wall.visible = true;

    const result = pickCloseWorldImpact([
      stubIntersection(localSkin, 0.5, new Vector3(0, 1, 0)),
      stubIntersection(wall, 1, new Vector3(0, 1, 0)),
    ]);
    expect(result).not.toBeNull();
  });

  it('skips soldier (tagged) meshes so no mark spawns on a body', () => {
    const enemy = new Mesh();
    enemy.visible = true;
    enemy.userData = { entityId: 'civilian-0', hitZone: 'body' };

    expect(pickCloseWorldImpact([stubIntersection(enemy, 0.5, new Vector3(0, 1, 0))])).toBeNull();
  });

  it('skips hidden meshes (hitboxes) and falls to a visible wall', () => {
    const hitbox = new Mesh();
    hitbox.visible = false;
    hitbox.userData = { entityId: 'civilian-0', hitZone: 'head' };

    const wall = new Mesh();
    wall.visible = true;

    const result = pickCloseWorldImpact([
      stubIntersection(hitbox, 0.4, new Vector3(0, 1, 0)),
      stubIntersection(wall, 1, new Vector3(0, 1, 0)),
    ]);
    expect(result).not.toBeNull();
  });
});
