import type { ScenarioMaterials } from '../hooks/use-scenario-material';
import type { ScenarioConfig } from '../types';
import { useMemo } from 'react';
import {
  createTiledPlaneGeometry,
  getScenarioMaterial,
} from '../hooks/use-scenario-material';

const BASE_FLOOR_OFFSET = -0.02;
const ZONE_FLOOR_OFFSET = 0.02;

/** Extra ground beyond the playable bounds on each side of an open perimeter. */
const DEFAULT_VISTA_EXTENSION = 30;

interface ScenarioFloorProps {
  scenario: ScenarioConfig;
  materials: ScenarioMaterials;
}

export function ScenarioFloor({ scenario, materials }: ScenarioFloorProps) {
  const { width, depth } = scenario.bounds;
  const openPerimeter = scenario.perimeter?.mode === 'open';
  const vista = openPerimeter
    ? (scenario.perimeter?.vistaExtension ?? DEFAULT_VISTA_EXTENSION)
    : 0;
  const floorWidth = width + vista * 2;
  const floorDepth = depth + vista * 2;

  const baseGeometry = useMemo(
    () =>
      createTiledPlaneGeometry(
        floorWidth,
        floorDepth,
        scenario.floor.repeat ?? [floorWidth / 4, floorDepth / 4],
      ),
    [depth, floorDepth, floorWidth, scenario.floor.repeat, width],
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
