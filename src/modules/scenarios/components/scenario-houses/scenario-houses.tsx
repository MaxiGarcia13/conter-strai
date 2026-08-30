import type { ScenarioConfig } from '@/modules/scenarios/types';
import { ScenarioFloor } from '@/modules/scenarios/components/scenario-floor';
import { ScenarioWalls } from '@/modules/scenarios/components/scenario-walls';
import { useScenarioPhaseTextureLibrary } from '@/modules/scenarios/hooks/use-scenario-texture-library';

/** Phase 2 — house walls + house floorZones (house textures). */
export function ScenarioHouses({ scenario }: { scenario: ScenarioConfig }) {
  const materials = useScenarioPhaseTextureLibrary(scenario, 'houses');
  return (
    <group>
      <ScenarioWalls scenario={scenario} materials={materials} />
      <ScenarioFloor
        scenario={scenario}
        materials={materials}
        zones={scenario.houseFloorZones}
        renderBase={false}
      />
    </group>
  );
}
