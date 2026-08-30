import type { ScenarioConfig } from '@/modules/scenarios/types';
import { PropInstance } from '@/modules/scenarios/components/prop-instance';

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
