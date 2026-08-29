import type { TextureId } from '@/modules/textures';
import * as THREE from 'three';

/** Scale plane UVs so one material can tile without cloning texture maps. */
function applyUvRepeat(geometry: THREE.BufferGeometry, repeat: [number, number]): void {
  const uv = geometry.getAttribute('uv');
  if (!(uv instanceof THREE.BufferAttribute)) {
    return;
  }
  const [repeatU, repeatV] = repeat;
  for (let i = 0; i < uv.count; i++) {
    uv.setXY(i, uv.getX(i) * repeatU, uv.getY(i) * repeatV);
  }
  uv.needsUpdate = true;
}

export function createTiledPlaneGeometry(
  width: number,
  depth: number,
  repeat: [number, number],
): THREE.PlaneGeometry {
  const geometry = new THREE.PlaneGeometry(width, depth);
  applyUvRepeat(geometry, repeat);
  return geometry;
}

/**
 * Box UVs tiled per face so long walls and thin end-caps share one brick scale.
 * Face order matches three.js BoxGeometry: +x, -x, +y, -y, +z, -z (4 verts each).
 */
export function createTiledBoxGeometry(
  width: number,
  height: number,
  depth: number,
  tileSize: number,
): THREE.BoxGeometry {
  const geometry = new THREE.BoxGeometry(width, height, depth);
  const uv = geometry.getAttribute('uv');
  if (!(uv instanceof THREE.BufferAttribute) || uv.count < 24) {
    return geometry;
  }
  const faceUvScale: [number, number][] = [
    [depth / tileSize, height / tileSize],
    [depth / tileSize, height / tileSize],
    [width / tileSize, depth / tileSize],
    [width / tileSize, depth / tileSize],
    [width / tileSize, height / tileSize],
    [width / tileSize, height / tileSize],
  ];
  let vertex = 0;
  for (const [uScale, vScale] of faceUvScale) {
    for (let i = 0; i < 4; i += 1) {
      uv.setXY(vertex, uv.getX(vertex) * uScale, uv.getY(vertex) * vScale);
      vertex += 1;
    }
  }
  uv.needsUpdate = true;
  return geometry;
}

export type ScenarioMaterials = Partial<Record<TextureId, THREE.MeshStandardMaterial>>;

export function getScenarioMaterial(
  materials: ScenarioMaterials,
  assetId: TextureId,
): THREE.MeshStandardMaterial {
  const material = materials[assetId];
  if (!material) {
    throw new Error(`Scenario texture not loaded: ${assetId}`);
  }
  return material;
}
