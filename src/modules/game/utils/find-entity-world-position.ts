import type { Object3D, Scene, Vector3 } from 'three';

/** Walks the scene for a soldier root tagged with `name` or root-level `userData.entityId`. */
export function findEntityWorldPosition(
  scene: Scene,
  entityId: string,
  target: Vector3,
): Vector3 | null {
  let named: Object3D | null = null;
  let tagged: Object3D | null = null;
  scene.traverse((object) => {
    if (object.name === entityId) {
      named = object;
      return;
    }
    const data = object.userData as { entityId?: string; hitZone?: string };
    if (!tagged && data.entityId === entityId && !data.hitZone) {
      tagged = object;
    }
  });
  const root = named ?? tagged;
  if (!root) {
    return null;
  }
  root.updateWorldMatrix(true, false);
  return root.getWorldPosition(target);
}
