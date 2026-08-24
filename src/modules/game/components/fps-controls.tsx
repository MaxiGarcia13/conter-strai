import type { LocalSpawn } from '../utils/local-spawn';

import type { ScenarioConfig } from '@/modules/scenarios';
import { useFpsControls } from '../hooks/use-fps-controls';

interface FpsControlsProps {
  scenario: ScenarioConfig;
  spawn: LocalSpawn;
}

/** WASD + pointer-lock + camera modes — mounts immediately, no asset loading. */
export function FpsControls({ scenario, spawn }: FpsControlsProps) {
  useFpsControls({ bounds: scenario.bounds, spawn });
  return null;
}
