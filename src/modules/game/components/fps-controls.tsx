import type { ScenarioConfig } from '@/modules/scenarios';

import { useFpsControls } from '../hooks/use-fps-controls';

interface FpsControlsProps {
  scenario: ScenarioConfig;
}

/** WASD + pointer-lock — mounts immediately, no asset loading. */
export function FpsControls({ scenario }: FpsControlsProps) {
  useFpsControls({ bounds: scenario.bounds });
  return null;
}
