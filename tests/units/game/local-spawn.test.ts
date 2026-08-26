import { describe, expect, it } from 'vitest';
import { resolveLocalSpawn } from '@/modules/game/utils/local-spawn';
import { getScenarioById } from '@/modules/scenarios/get-scenario-by-id';

describe('resolveLocalSpawn', () => {
  it('claims the default civilian slot on arena-01', () => {
    const scenario = getScenarioById('arena-01');
    const spawn = resolveLocalSpawn(scenario);

    expect(spawn.key).toBe('civilian-0');
    expect(spawn.position).toEqual(scenario.teamSpawns.civilian[0]);
    expect(spawn.position[0]).toBeGreaterThan(0);
  });
});
