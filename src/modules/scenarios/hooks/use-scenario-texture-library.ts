import type { ScenarioPhase } from '../get-scenario-texture-ids';
import type { ScenarioConfig } from '../types';
import type { ScenarioMaterials } from './use-scenario-material';
import { useLoader } from '@react-three/fiber';
import { useMemo } from 'react';
import * as THREE from 'three';
import { getScenarioPhaseTextureIds } from '../get-scenario-texture-ids';
import { collectMapEntries, materialsFromEntries } from '../utils/texture-library-utils';

/** Loads the PBR map images for one deploy phase so Suspense resolves independently. */
export function useScenarioPhaseTextureLibrary(
  scenario: ScenarioConfig,
  phase: ScenarioPhase,
): ScenarioMaterials {
  const textureIds = useMemo(
    () => getScenarioPhaseTextureIds(scenario, phase),
    [phase, scenario],
  );
  const entries = useMemo(() => collectMapEntries(textureIds), [textureIds]);
  const urls = useMemo(() => entries.map((entry) => entry.url), [entries]);
  const loaded = useLoader(THREE.TextureLoader, urls);

  return useMemo(
    () => materialsFromEntries(textureIds, entries, loaded),
    [entries, loaded, textureIds],
  );
}
