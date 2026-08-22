import type { ScenarioConfig } from '../types';
import { useScenarioTextureLibrary } from '../hooks/use-scenario-texture-library';
import { PropInstance } from './prop-instance';
import { ScenarioFloor } from './scenario-floor';
import { ScenarioWalls } from './scenario-walls';

export function ScenarioScene({ scenario }: { scenario: ScenarioConfig }) {
  const materials = useScenarioTextureLibrary(scenario);

  return (
    <group>
      <ScenarioFloor scenario={scenario} materials={materials} />
      <ScenarioWalls scenario={scenario} materials={materials} />
      {(scenario.props ?? []).map((prop) => (
        <PropInstance key={`${prop.id}-${prop.position.join(',')}`} prop={prop} />
      ))}
    </group>
  );
}
