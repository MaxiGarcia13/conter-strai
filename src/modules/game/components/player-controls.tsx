import type { LocalSpawn } from '../utils/local-spawn';

import type { ScenarioConfig } from '@/modules/scenarios';
import { usePlayerControls } from '../hooks/use-player-controls';

interface PlayerControlsProps {
  scenario: ScenarioConfig;
  spawn: LocalSpawn;
}

/** WASD + pointer-lock + camera modes — mounts immediately, no asset loading. */
export function PlayerControls({ scenario, spawn }: PlayerControlsProps) {
  usePlayerControls({ bounds: scenario.bounds, spawn });
  return null;
}
