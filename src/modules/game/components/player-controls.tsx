import type { LocalSpawn } from '../utils/local-spawn';

import type { ScenarioConfig } from '@/modules/scenarios';
import { usePlayerControls } from '../hooks/use-player-controls';

const DEFAULT_WALL_THICKNESS = 0.4;

interface PlayerControlsProps {
  scenario: ScenarioConfig;
  spawn: LocalSpawn;
}

/** WASD + pointer-lock + camera modes — mounts immediately, no asset loading. */
export function PlayerControls({ scenario, spawn }: PlayerControlsProps) {
  usePlayerControls({
    bounds: scenario.bounds,
    collisionSegments: scenario.collisionSegments ?? [],
    spawn,
    wallThickness: scenario.walls.thickness ?? DEFAULT_WALL_THICKNESS,
  });
  return null;
}
