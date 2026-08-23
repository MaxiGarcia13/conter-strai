import type { ScenarioConfig } from '@/modules/scenarios';
import { useMemo } from 'react';

import { getTeamSpawn } from '@/modules/scenarios';

import { DEFAULT_LOCAL_SPAWN_INDEX, DEFAULT_LOCAL_TEAM } from '../constants/player';
import { useFpsControls } from '../hooks/use-fps-controls';

interface FpsControlsProps {
  scenario: ScenarioConfig;
}

/** WASD + pointer-lock — mounts immediately, no asset loading. */
export function FpsControls({ scenario }: FpsControlsProps) {
  const spawn = useMemo(
    () => getTeamSpawn(scenario, DEFAULT_LOCAL_TEAM, DEFAULT_LOCAL_SPAWN_INDEX),
    [scenario],
  );
  useFpsControls({
    bounds: scenario.bounds,
    origin: spawn.position,
    initialYaw: spawn.yaw,
  });
  return null;
}
