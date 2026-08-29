import type { ScenarioMaterials } from '../hooks/use-scenario-material';
import type { ScenarioConfig } from '../types';
import { useMemo } from 'react';
import { interiorWalls, outerWalls } from '../utils/wall-mesh-builders';

const DEFAULT_WALL_THICKNESS = 0.5;

interface ScenarioWallsProps {
  scenario: ScenarioConfig;
  materials: ScenarioMaterials;
}

export function ScenarioWalls({ scenario, materials }: ScenarioWallsProps) {
  const { width, depth, wallHeight } = scenario.bounds;
  const thickness = scenario.walls.thickness ?? DEFAULT_WALL_THICKNESS;
  const outerHeight = scenario.walls.height ?? wallHeight;
  const openPerimeter = scenario.perimeter?.mode === 'open';

  const walls = useMemo(() => {
    const boxes = openPerimeter
      ? []
      : outerWalls(width, depth, outerHeight, thickness, scenario.walls.assetId, materials);
    boxes.push(
      ...interiorWalls(scenario.wallSegments ?? [], wallHeight, scenario.walls.assetId, thickness, materials),
    );
    return boxes;
  }, [
    depth,
    materials,
    openPerimeter,
    outerHeight,
    scenario.wallSegments,
    scenario.walls.assetId,
    thickness,
    wallHeight,
    width,
  ]);

  return (
    <group>
      {walls.map((wall) => (
        <mesh
          key={wall.key}
          geometry={wall.geometry}
          material={wall.material}
          position={wall.position}
          rotation={[0, wall.rotationY, 0]}
          castShadow
          receiveShadow
        />
      ))}
    </group>
  );
}
