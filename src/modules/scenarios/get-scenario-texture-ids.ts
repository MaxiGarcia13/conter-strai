import type { ScenarioConfig } from './types';
import type { TextureId } from '@/modules/textures';

/** Arena deploy phases that resolve scenario PBR textures independently. */
export type ScenarioPhase = 'ground' | 'houses';

const PHASE_FLOOR_ZONES: Record<ScenarioPhase, (s: ScenarioConfig) => NonNullable<ScenarioConfig['groundFloorZones']>> = {
  ground: (s) => s.groundFloorZones ?? [],
  houses: (s) => s.houseFloorZones ?? [],
};

/** Unique texture ids referenced by the given deploy phase. */
export function getScenarioPhaseTextureIds(
  scenario: ScenarioConfig,
  phase: ScenarioPhase,
): TextureId[] {
  const ids = new Set<TextureId>();
  if (phase === 'ground') {
    ids.add(scenario.floor.assetId);
    for (const zone of PHASE_FLOOR_ZONES.ground(scenario)) {
      ids.add(zone.assetId);
    }
  } else {
    ids.add(scenario.walls.assetId);
    for (const segment of scenario.wallSegments ?? []) {
      if (segment.assetId) {
        ids.add(segment.assetId);
      }
    }
    for (const zone of PHASE_FLOOR_ZONES.houses(scenario)) {
      ids.add(zone.assetId);
    }
  }
  return [...ids];
}

/** Collects unique texture ids referenced by a scenario config. */
export function getScenarioTextureIds(scenario: ScenarioConfig): TextureId[] {
  const ids = new Set<TextureId>([
    ...getScenarioPhaseTextureIds(scenario, 'ground'),
    ...getScenarioPhaseTextureIds(scenario, 'houses'),
  ]);
  return [...ids];
}
