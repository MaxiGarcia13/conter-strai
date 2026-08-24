import type { ScenarioConfig } from '../types';
import type { Team } from '@/modules/teams';
import { SoldierModel } from '@/modules/soldiers';

import { spawnKey, spawnYawFor } from '../utils/spawn-helpers';

interface ScenarioSoldiersProps {
  scenario: ScenarioConfig;
  /** Spawn whose model is skipped — the local player occupies it in first person. */
  skipKey?: string;
}

export function ScenarioSoldiers({ scenario, skipKey }: ScenarioSoldiersProps) {
  const teams = Object.keys(scenario.teamSpawns) as Team[];

  return (
    <>
      {teams.map((team) =>
        scenario.teamSpawns[team].map((position, index) => {
          const key = spawnKey(team, index);
          if (key === skipKey) {
            return null;
          }
          return (
            <SoldierModel
              key={key}
              position={position}
              rotationY={spawnYawFor(scenario, team, position)}
            />
          );
        }),
      )}
    </>
  );
}
