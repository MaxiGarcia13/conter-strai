import type { Intersection, Object3D } from 'three';
import { CLOSE_RANGE_IMPACT_METERS } from '@/modules/weapons/constants/pistol';
import { LOCAL_PLAYER_ROOT_NAME } from '../constants/player';
import { AIM_MARKER_NAME, resolveHitTags } from './pick-bullet-hit';

export interface CloseWorldImpact {
  point: [number, number, number];
  normal: [number, number, number];
}

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

/**
 * First visible untagged mesh (wall / floor / prop) within close range along a
 * camera ray, or null. Runs in parallel with `pickBulletHit` so a point-blank
 * wall still leaves a mark even when a soldier stands behind it.
 */
export function pickCloseWorldImpact(
  intersections: Intersection[],
): CloseWorldImpact | null {
  for (const ix of intersections) {
    const { object } = ix;
    if (object.name === AIM_MARKER_NAME || hasAncestorNamed(object, AIM_MARKER_NAME)) {
      continue;
    }
    if (hasAncestorNamed(object, LOCAL_PLAYER_ROOT_NAME)) {
      continue;
    }
    if (resolveHitTags(object)) {
      continue;
    }
    if (ix.distance > CLOSE_RANGE_IMPACT_METERS) {
      break;
    }
    if (!object.visible) {
      continue;
    }
    const normal = ix.face?.normal
      ? ix.face.normal.clone().transformDirection(object.matrixWorld)
      : null;
    if (!normal) {
      continue;
    }
    return {
      point: ix.point.toArray() as [number, number, number],
      normal: normal.toArray() as [number, number, number],
    };
  }
  return null;
}
