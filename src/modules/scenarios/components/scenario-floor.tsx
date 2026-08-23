import type { ScenarioMaterials } from '../hooks/use-scenario-material';
import type { ScenarioConfig } from '../types';
import { useMemo } from 'react';
import {
  createTiledPlaneGeometry,
  getScenarioMaterial,
} from '../hooks/use-scenario-material';

const BASE_FLOOR_OFFSET = -0.02;
const ZONE_FLOOR_OFFSET = 0.02;

interface ScenarioFloorProps {
  scenario: ScenarioConfig;
  materials: ScenarioMaterials;
}

export function ScenarioFloor({ scenario, materials }: ScenarioFloorProps) {
  const { width, depth } = scenario.bounds;

  const baseGeometry = useMemo(
    () =>
      createTiledPlaneGeometry(
        width,
        depth,
        scenario.floor.repeat ?? [width / 4, depth / 4],
      ),
    [depth, scenario.floor.repeat, width],
  );

  const baseMaterial = useMemo(
    () => getScenarioMaterial(materials, scenario.floor.assetId),
    [materials, scenario.floor.assetId],
  );

  const zoneMeshes = useMemo(() => {
    const zones = scenario.floorZones ?? [];
    return zones.map((zone) => ({
      zone,
      geometry: createTiledPlaneGeometry(
        zone.size[0],
        zone.size[1],
        zone.repeat ?? [zone.size[0] / 4, zone.size[1] / 4],
      ),
      material: getScenarioMaterial(materials, zone.assetId),
    }));
  }, [materials, scenario.floorZones]);

  return (
    <group>
      <mesh
        geometry={baseGeometry}
        material={baseMaterial}
        position={[0, BASE_FLOOR_OFFSET, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      />
      {zoneMeshes.map(({ zone, geometry, material }) => (
        <mesh
          key={zone.id}
          geometry={geometry}
          material={material}
          position={[zone.position[0], ZONE_FLOOR_OFFSET, zone.position[2]]}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
        />
      ))}
    </group>
  );
}
