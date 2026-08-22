import type { ScenarioMaterials } from '../hooks/use-scenario-material';
import type { ScenarioConfig } from '../types';
import { useMemo } from 'react';
import { getScenarioMaterial, materialWithRepeat } from '../hooks/use-scenario-material';

const BASE_FLOOR_OFFSET = -0.02;
const ZONE_FLOOR_OFFSET = 0.02;

interface ScenarioFloorProps {
  scenario: ScenarioConfig;
  materials: ScenarioMaterials;
}

export function ScenarioFloor({ scenario, materials }: ScenarioFloorProps) {
  const { width, depth } = scenario.bounds;

  const baseMaterial = useMemo(
    () =>
      materialWithRepeat(
        getScenarioMaterial(materials, scenario.floor.assetId),
        scenario.floor.repeat ?? [width / 4, depth / 4],
      ),
    [depth, materials, scenario.floor.assetId, scenario.floor.repeat, width],
  );

  const zoneMaterials = useMemo(() => {
    const zones = scenario.floorZones ?? [];
    return zones.map((zone) => ({
      zone,
      material: materialWithRepeat(
        getScenarioMaterial(materials, zone.assetId),
        zone.repeat ?? [zone.size[0] / 4, zone.size[1] / 4],
      ),
    }));
  }, [materials, scenario.floorZones]);

  return (
    <group>
      <mesh
        material={baseMaterial}
        position={[0, BASE_FLOOR_OFFSET, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[width, depth]} />
      </mesh>
      {zoneMaterials.map(({ zone, material }) => (
        <mesh
          key={zone.id}
          material={material}
          position={[zone.position[0], ZONE_FLOOR_OFFSET, zone.position[2]]}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
        >
          <planeGeometry args={zone.size} />
        </mesh>
      ))}
    </group>
  );
}
