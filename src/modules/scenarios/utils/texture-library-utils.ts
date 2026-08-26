import type { ScenarioMaterials } from '../hooks/use-scenario-material';
import type { TextureId } from '@/modules/textures';
import * as THREE from 'three';
import { getTextureById } from '@/modules/textures';

export interface LoadedMapEntry {
  textureId: TextureId;
  slot: 'map' | 'normalMap' | 'roughnessMap' | 'aoMap';
  url: string;
}

const SLOT_TO_MATERIAL_KEY = {
  color: 'map',
  normal: 'normalMap',
  roughness: 'roughnessMap',
  ao: 'aoMap',
} as const;

export function collectMapEntries(textureIds: TextureId[]): LoadedMapEntry[] {
  const entries: LoadedMapEntry[] = [];
  for (const textureId of textureIds) {
    const definition = getTextureById(textureId);
    for (const [slot, url] of Object.entries(definition.maps)) {
      if (!url) {
        continue;
      }
      entries.push({
        textureId,
        slot: SLOT_TO_MATERIAL_KEY[slot as keyof typeof SLOT_TO_MATERIAL_KEY],
        url,
      });
    }
  }
  return entries;
}

export function configureTexture(texture: THREE.Texture, slot: LoadedMapEntry['slot']): THREE.Texture {
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = slot === 'map' ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  return texture;
}

export function materialsFromEntries(
  textureIds: TextureId[],
  entries: LoadedMapEntry[],
  loaded: THREE.Texture[],
): ScenarioMaterials {
  const materials: ScenarioMaterials = {};

  for (const textureId of textureIds) {
    const definition = getTextureById(textureId);
    materials[textureId] = new THREE.MeshStandardMaterial({
      roughness: definition.roughness ?? 1,
      metalness: definition.metalness ?? 0,
    });
  }

  entries.forEach((entry, index) => {
    const material = materials[entry.textureId];
    if (!material) {
      return;
    }
    const texture = configureTexture(loaded[index], entry.slot);
    material[entry.slot] = texture;
  });

  return materials;
}
