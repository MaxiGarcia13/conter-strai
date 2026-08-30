import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { getScenarioTextureIds } from '../get-scenario-texture-ids';
import { scenarios } from '../scenario-registry';
import { collectMapEntries } from './texture-library-utils';

/** Warms R3F's texture cache before ScenarioGround mounts. */
export function preloadScenarioTextures(): void {
  const urls = new Set(
    Object.values(scenarios).flatMap((scenario) =>
      collectMapEntries(getScenarioTextureIds(scenario)).map((entry) => entry.url),
    ),
  );

  for (const url of urls) {
    useLoader.preload(THREE.TextureLoader, url);
  }
}

// Preload when imported from GameCanvas so useLoader is warm before
// ScenarioGround mounts and does not re-trigger drei's loading manager
// (which would update LoadingReporter during render).
preloadScenarioTextures();
