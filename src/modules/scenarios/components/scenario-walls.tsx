import type { ScenarioMaterials } from '../hooks/use-scenario-material';
import type { ScenarioConfig } from '../types';
import { useMemo } from 'react';
import { outerWalls, segmentWall } from '../utils/wall-mesh-builders';

const DEFAULT_WALL_THICKNESS = 0.5;

interface ScenarioWallsProps {
  scenario: ScenarioConfig;
  materials: ScenarioMaterials;
}

export function ScenarioWalls({ scenario, materials }: ScenarioWallsProps) {
  const { width, depth, wallHeight } = scenario.bounds;
  const thickness = scenario.walls.thickness ?? DEFAULT_WALL_THICKNESS;
  const outerHeight = scenario.walls.height ?? wallHeight;

  const walls = useMemo(() => {
    const boxes = outerWalls(width, depth, outerHeight, thickness, scenario.walls.assetId, materials);
    (scenario.wallSegments ?? []).forEach((segment, index) => {
      const wall = segmentWall(segment, index, wallHeight, scenario.walls.assetId, thickness, materials);
      if (wall) {
        boxes.push(wall);
      }
    });
    return boxes;
  }, [
    depth,
    materials,
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
          material={wall.material}
          position={wall.position}
          rotation={[0, wall.rotationY, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={wall.size} />
        </mesh>
      ))}
    </group>
  );
}
