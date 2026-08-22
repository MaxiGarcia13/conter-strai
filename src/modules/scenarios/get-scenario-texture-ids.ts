import type { ScenarioConfig } from './types';
import type { TextureId } from '@/modules/textures';

/** Collects unique texture ids referenced by a scenario config. */
export function getScenarioTextureIds(scenario: ScenarioConfig): TextureId[] {
  const ids = new Set<TextureId>();
  ids.add(scenario.floor.assetId);
  ids.add(scenario.walls.assetId);
  for (const zone of scenario.floorZones ?? []) {
    ids.add(zone.assetId);
  }
  for (const segment of scenario.wallSegments ?? []) {
    if (segment.assetId) {
      ids.add(segment.assetId);
    }
  }
  return [...ids];
}
