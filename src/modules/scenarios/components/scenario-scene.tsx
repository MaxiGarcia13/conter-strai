import type { ScenarioConfig } from '../types';
import { useScenarioPhaseTextureLibrary } from '../hooks/use-scenario-texture-library';
import { PropInstance } from './prop-instance';
import { ScenarioFloor } from './scenario-floor';
import { ScenarioWalls } from './scenario-walls';

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

/** Phase 3 — decorations (props). */
export function ScenarioProps({ scenario }: { scenario: ScenarioConfig }) {
  return (
    <group>
      {(scenario.props ?? []).map((prop) => (
        <PropInstance key={`${prop.id}-${prop.position.join(',')}`} prop={prop} />
      ))}
    </group>
  );
}

/** Mounts every arena layer in one boundary (pre-staged fallback). */
export function ScenarioScene({ scenario }: { scenario: ScenarioConfig }) {
  return (
    <group>
      <ScenarioGround scenario={scenario} />
      <ScenarioHouses scenario={scenario} />
      <ScenarioProps scenario={scenario} />
    </group>
  );
}
