import type { BoxBlocker, CircleBlocker } from './resolve-player-collision';
import type { ScenarioConfig } from '@/modules/scenarios';
import { getPropById } from '@/modules/props';

export interface PropBlockers {
  circles: CircleBlocker[];
  boxes: BoxBlocker[];
}

/** XZ discs and oriented boxes for every collidable prop in a scenario. */
export function propBlockersFromScenario(
  scenario: ScenarioConfig,
  defaultRadius: number = 0.9,
): PropBlockers {
  const circles: CircleBlocker[] = [];
  const boxes: BoxBlocker[] = [];
  const props = scenario.props ?? [];

  for (let index = 0; index < props.length; index += 1) {
    const prop = props[index]!;
    const definition = getPropById(prop.id);
    const collidable = prop.collidable ?? definition.collidable ?? false;
    if (!collidable) {
      continue;
    }

    const entityId = `${prop.id}-${index}`;
    const halfExtents = definition.collisionHalfExtents;
    if (halfExtents) {
      const scale = prop.scale ?? definition.scale ?? 1;
      boxes.push({
        x: prop.position[0],
        z: prop.position[2],
        halfWidth: halfExtents[0] * scale,
        halfDepth: halfExtents[1] * scale,
        yaw: prop.rotationY ?? 0,
        entityId,
      });
      continue;
    }

    circles.push({
      x: prop.position[0],
      z: prop.position[2],
      radius: definition.collisionRadius ?? defaultRadius,
      entityId,
    });
  }

  return { circles, boxes };
}
