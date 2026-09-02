import { describe, expect, it } from 'vitest';
import { getScenarioById } from '@/modules/scenarios/get-scenario-by-id';
import { getScenarioPhaseTextureIds } from '@/modules/scenarios/get-scenario-texture-ids';
import { getTextureById } from '@/modules/textures';

describe('scenario-registry', () => {
  const scenario = getScenarioById('arena-01');

  it('defines arena-01 Ruined Village bounds', () => {
    expect(scenario.id).toBe('arena-01');
    expect(scenario.bounds).toEqual({ width: 100, depth: 50, wallHeight: 3.5 });
  });

  it('spawns soldiers west and civilians east', () => {
    expect(scenario.teamSpawns.soldier.length).toBeGreaterThan(0);
    expect(scenario.teamSpawns.civilian.length).toBeGreaterThan(0);
    for (const [spawnX] of scenario.teamSpawns.soldier) {
      expect(spawnX).toBeLessThan(0);
    }
    for (const [spawnX] of scenario.teamSpawns.civilian) {
      expect(spawnX).toBeGreaterThan(0);
    }
  });

  it('uses unique spawn coordinates per team', () => {
    for (const team of ['soldier', 'civilian'] as const) {
      const keys = scenario.teamSpawns[team].map(([x, , z]) => `${x},${z}`);
      expect(new Set(keys).size).toBe(keys.length);
    }
  });

  it('resolves every texture id in the registry', () => {
    expect(() => getTextureById(scenario.floor.assetId)).not.toThrow();
    expect(() => getTextureById(scenario.walls.assetId)).not.toThrow();
    for (const zone of [...(scenario.groundFloorZones ?? []), ...(scenario.houseFloorZones ?? [])]) {
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

  it('keeps the base floor texture in the ground phase only', () => {
    expect(getScenarioPhaseTextureIds(scenario, 'ground')).toContain(scenario.floor.assetId);
    expect(getScenarioPhaseTextureIds(scenario, 'houses')).not.toContain(scenario.floor.assetId);
  });

  it('publishes axis-aligned collision spans and doorway holes', () => {
    const walls = scenario.wallSegments ?? [];
    const segments = scenario.collisionSegments ?? [];
    const holes = scenario.collisionHoles ?? [];

    expect(segments.length).toBeGreaterThan(0);
    expect(segments).toHaveLength(walls.length);
    expect(segments.every(({ axis }) => axis === 'x' || axis === 'z')).toBe(true);

    expect(holes.length).toBeGreaterThan(0);
    expect(holes.every(({ axis, width }) => (axis === 'x' || axis === 'z') && width > 0)).toBe(true);
  });
});
