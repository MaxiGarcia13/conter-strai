import type { GLTF } from 'three-stdlib';
import type { ScenarioConfig } from '../types';
import type { ScenarioMaterials } from './use-scenario-material';
import type { TextureId } from '@/modules/textures';
import { useLoader } from '@react-three/fiber';
import { useMemo } from 'react';
import { GLTFLoader } from 'three-stdlib';
import { getTextureById } from '@/modules/textures';
import { getScenarioTextureIds } from '../get-scenario-texture-ids';
import { standardMaterialFromGltf } from './use-scenario-material';

function materialsFromGltfs(textureIds: TextureId[], gltfs: GLTF[]): ScenarioMaterials {
  const materials: ScenarioMaterials = {};
  textureIds.forEach((id, index) => {
    const { url } = getTextureById(id);
    materials[id] = standardMaterialFromGltf(gltfs[index], url);
  });
  return materials;
}

/** Loads only the texture GLBs referenced by the scenario config. */
export function useScenarioTextureLibrary(scenario: ScenarioConfig): ScenarioMaterials {
  const textureIds = useMemo(() => getScenarioTextureIds(scenario), [scenario]);
  const urls = useMemo(() => textureIds.map((id) => getTextureById(id).url), [textureIds]);
  const gltfs = useLoader(GLTFLoader, urls) as GLTF[];

  return useMemo(
    () => materialsFromGltfs(textureIds, gltfs),
    [gltfs, textureIds],
  );
}
