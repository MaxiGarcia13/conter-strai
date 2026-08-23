import { describe, expect, it } from 'vitest';
import { getTextureById } from '@/modules/textures';

import { getScenarioById } from './get-scenario-by-id';

describe('scenario-registry', () => {
  const scenario = getScenarioById('arena-01');

  it('defines arena-01 Ruined Village bounds', () => {
    expect(scenario.id).toBe('arena-01');
    expect(scenario.bounds).toEqual({ width: 100, depth: 50, wallHeight: 3.5 });
  });

  it('spawns puma west and lion east', () => {
    expect(scenario.teamSpawns.puma.length).toBeGreaterThan(0);
    expect(scenario.teamSpawns.lion.length).toBeGreaterThan(0);
    for (const [spawnX] of scenario.teamSpawns.puma) {
      expect(spawnX).toBeLessThan(0);
    }
    for (const [spawnX] of scenario.teamSpawns.lion) {
      expect(spawnX).toBeGreaterThan(0);
    }
  });

  it('resolves every texture id in the registry', () => {
    expect(() => getTextureById(scenario.floor.assetId)).not.toThrow();
    expect(() => getTextureById(scenario.walls.assetId)).not.toThrow();
    for (const zone of scenario.floorZones ?? []) {
      expect(() => getTextureById(zone.assetId)).not.toThrow();
    }
    for (const segment of scenario.wallSegments ?? []) {
      const { assetId } = segment;
      if (!assetId) {
        continue;
      }
      expect(() => getTextureById(assetId)).not.toThrow();
    }
  });
});
