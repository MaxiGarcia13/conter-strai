import type { CircleBlocker } from './resolve-player-collision';
import type { ScenarioConfig } from '@/modules/scenarios';
import { getPropById } from '@/modules/props';

/** Fixed XZ disc for every collidable prop in a scenario (trunk discs, meters). */
export function propBlockersFromScenario(
  scenario: ScenarioConfig,
  defaultRadius: number = 0.9,
): CircleBlocker[] {
  const blockers: CircleBlocker[] = [];
  const props = scenario.props ?? [];

  for (let index = 0; index < props.length; index += 1) {
    const prop = props[index]!;
    const definition = getPropById(prop.id);
    const collidable = prop.collidable ?? definition.collidable ?? false;
    if (!collidable) {
      continue;
    }
    blockers.push({
      x: prop.position[0],
      z: prop.position[2],
      radius: definition.collisionRadius ?? defaultRadius,
      entityId: `${prop.id}-${index}`,
    });
  }

  return blockers;
}
