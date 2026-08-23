import type { TextureId } from '@/modules/textures';
import * as THREE from 'three';

const MAP_KEYS = ['map', 'normalMap', 'roughnessMap', 'aoMap'] as const;

const materialRepeatCache = new Map<string, THREE.MeshStandardMaterial>();

function cloneMapsWithRepeat(
  material: THREE.MeshStandardMaterial,
  repeat: [number, number],
): void {
  for (const key of MAP_KEYS) {
    const map = material[key];
    if (!map) {
      continue;
    }
    const cloned = map.clone();
    cloned.wrapS = THREE.RepeatWrapping;
    cloned.wrapT = THREE.RepeatWrapping;
    cloned.repeat.set(repeat[0], repeat[1]);
    cloned.needsUpdate = true;
    material[key] = cloned;
  }
}

/** Scale plane UVs so one material can tile without cloning texture maps. */
export function applyUvRepeat(geometry: THREE.BufferGeometry, repeat: [number, number]): void {
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

/** Clone a base wall/floor material with independent UV tiling (cached by repeat key). */
export function materialWithRepeat(
  source: THREE.MeshStandardMaterial,
  repeat: [number, number],
): THREE.MeshStandardMaterial {
  const key = `${source.uuid}:${repeat[0]}:${repeat[1]}`;
  const cached = materialRepeatCache.get(key);
  if (cached) {
    return cached;
  }
  const material = source.clone();
  cloneMapsWithRepeat(material, repeat);
  materialRepeatCache.set(key, material);
  return material;
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
