import type { GLTF } from 'three-stdlib';
import type { TextureId } from '@/modules/textures';
import { useGLTF } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';
import { getTextureById } from '@/modules/textures';

const MAP_KEYS = ['map', 'normalMap', 'roughnessMap', 'aoMap'] as const;

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

export function standardMaterialFromGltf(gltf: GLTF, url: string): THREE.MeshStandardMaterial {
  let source: THREE.MeshStandardMaterial | undefined;
  gltf.scene.traverse((object) => {
    if (source || !(object instanceof THREE.Mesh)) {
      return;
    }
    const material = object.material;
    const candidate = Array.isArray(material) ? material[0] : material;
    if (candidate instanceof THREE.MeshStandardMaterial) {
      source = candidate;
    }
  });
  if (!source) {
    throw new Error(`No standard material found in ${url}`);
  }
  return new THREE.MeshStandardMaterial({
    map: source.map,
    normalMap: source.normalMap,
    roughnessMap: source.roughnessMap,
    aoMap: source.aoMap,
    roughness: source.roughness,
    metalness: source.metalness,
  });
}

export function useScenarioMaterial(
  assetId: TextureId,
  repeat?: [number, number],
): THREE.MeshStandardMaterial {
  const { url } = getTextureById(assetId);
  const gltf = useGLTF(url);
  return useMemo(() => {
    const material = standardMaterialFromGltf(gltf, url);
    if (repeat) {
      cloneMapsWithRepeat(material, repeat);
    }
    return material;
  }, [gltf, url, repeat?.[0], repeat?.[1]]);
}

/** Clone a base wall/floor material with independent UV tiling. */
export function materialWithRepeat(
  source: THREE.MeshStandardMaterial,
  repeat: [number, number],
): THREE.MeshStandardMaterial {
  const material = source.clone();
  cloneMapsWithRepeat(material, repeat);
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
