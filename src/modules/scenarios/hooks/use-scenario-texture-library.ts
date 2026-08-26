import type { ScenarioConfig } from '../types';
import type { ScenarioMaterials } from './use-scenario-material';
import { useLoader } from '@react-three/fiber';
import { useMemo } from 'react';
import * as THREE from 'three';
import { getScenarioTextureIds } from '../get-scenario-texture-ids';
import { collectMapEntries, materialsFromEntries } from '../utils/texture-library-utils';

/** Loads PBR map images referenced by the scenario config. */
export function useScenarioTextureLibrary(scenario: ScenarioConfig): ScenarioMaterials {
  const textureIds = useMemo(() => getScenarioTextureIds(scenario), [scenario]);
  const entries = useMemo(() => collectMapEntries(textureIds), [textureIds]);
  const urls = useMemo(() => entries.map((entry) => entry.url), [entries]);
  const loaded = useLoader(THREE.TextureLoader, urls);

  return useMemo(
    () => materialsFromEntries(textureIds, entries, loaded),
    [entries, loaded, textureIds],
  );
}
