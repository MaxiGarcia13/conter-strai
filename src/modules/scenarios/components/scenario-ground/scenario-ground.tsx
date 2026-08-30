import type { ScenarioConfig } from '@/modules/scenarios/types';
import { ScenarioFloor } from '@/modules/scenarios/components/scenario-floor';
import { useScenarioPhaseTextureLibrary } from '@/modules/scenarios/hooks/use-scenario-texture-library';

/** Phase 1 — base floor + street floorZones (ground textures). */
export function ScenarioGround({ scenario }: { scenario: ScenarioConfig }) {
  const materials = useScenarioPhaseTextureLibrary(scenario, 'ground');

  return (
    <ScenarioFloor
      scenario={scenario}
      materials={materials}
      zones={scenario.groundFloorZones}
    />
  );
}
