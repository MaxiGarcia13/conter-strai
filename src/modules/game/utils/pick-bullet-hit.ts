import type { Intersection, Object3D } from 'three';
import type { BulletHitResult } from '@/modules/weapons/types';
import { LOCAL_PLAYER_ROOT_NAME } from '../constants/player';

export const AIM_MARKER_NAME = 'aim-marker';

function hasAncestorNamed(object: Object3D, name: string): boolean {
  let current: Object3D | null = object;
  while (current) {
    if (current.name === name) {
      return true;
    }
    current = current.parent;
  }
  return false;
}

/** Walk parents for combat tags (hitboxes set both; soldier roots set entityId). */
export function resolveHitTags(
  object: Object3D,
): { entityId: string; hitZone: string | null } | null {
  let entityId: string | null = null;
  let hitZone: string | null = null;
  let current: Object3D | null = object;
  while (current) {
    const data = current.userData as { entityId?: string; hitZone?: string };
    if (!entityId && data.entityId) {
      entityId = data.entityId;
    }
    if (!hitZone && data.hitZone) {
      hitZone = data.hitZone;
    }
    if (entityId && hitZone) {
      break;
    }
    current = current.parent;
  }
  if (!entityId) {
    return null;
  }
  return { entityId, hitZone };
}

/**
 * First combat hit along a camera ray, or null when blocked by world geometry /
 * aiming at empty sky. Skips the local player and the aim marker.
 */
export function pickBulletHit(
  intersections: Intersection[],
  localEntityId: string,
): BulletHitResult | null {
  for (const ix of intersections) {
    const { object } = ix;
    if (object.name === AIM_MARKER_NAME || hasAncestorNamed(object, AIM_MARKER_NAME)) {
      continue;
    }
    if (hasAncestorNamed(object, LOCAL_PLAYER_ROOT_NAME)) {
      continue;
    }

    const tags = resolveHitTags(object);
    if (tags) {
      if (tags.entityId === localEntityId) {
        continue;
      }
      return {
        entityId: tags.entityId,
        // Mesh hits inherit entityId from the soldier root; default zone to body.
        hitZone: (tags.hitZone as BulletHitResult['hitZone']) ?? 'body',
        point: ix.point.toArray() as [number, number, number],
        distance: ix.distance,
      };
    }

    // Visible untagged mesh = world occluder (walls / floor / props).
    if (object.visible) {
      return null;
    }
  }
  return null;
}

/**
 * First surface for the aim ring: soldier hitboxes / tagged meshes, then
 * visible world geometry. Skinned body meshes often miss at point-blank
 * (backfaces / bind-pose bounds); hitboxes stay reliable.
 */
export function pickAimSurface(
  intersections: Intersection[],
  markerObject: Object3D,
): Intersection | null {
  for (const ix of intersections) {
    const { object } = ix;
    if (object === markerObject) {
      continue;
    }
    if (hasAncestorNamed(object, LOCAL_PLAYER_ROOT_NAME)) {
      continue;
    }
    if (hasAncestorNamed(object, AIM_MARKER_NAME)) {
      continue;
    }

    if (resolveHitTags(object)) {
      return ix;
    }

    if (object.visible) {
      return ix;
    }
  }
  return null;
}
