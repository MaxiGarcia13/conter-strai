import type { ScenarioConfig } from '@/modules/scenarios/types';
import { LazyScenarioGround } from '../scenario-ground';
import { LazyScenarioHouses } from '../scenario-houses';
import { LazyScenarioProps } from '../scenario-props';

/** Mounts every arena layer in one boundary (pre-staged fallback). */
export function ScenarioScene({ scenario }: { scenario: ScenarioConfig }) {
  return (
    <group>
      <LazyScenarioGround scenario={scenario} />
      <LazyScenarioHouses scenario={scenario} />
      <LazyScenarioProps scenario={scenario} />
    </group>
  );
}
