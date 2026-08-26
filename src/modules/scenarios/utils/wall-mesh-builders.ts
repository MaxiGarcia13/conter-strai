import type * as THREE from 'three';
import type { ScenarioMaterials } from '../hooks/use-scenario-material';
import type { ScenarioWallSegment, Vec3 } from '../types';
import type { TextureId } from '@/modules/textures';

import { getScenarioMaterial, materialWithRepeat } from '../hooks/use-scenario-material';

const WALL_TILE_SIZE = 4;

export interface WallBox {
  key: string;
  size: Vec3;
  position: Vec3;
  rotationY: number;
  material: THREE.MeshStandardMaterial;
}

export function segmentWall(
  segment: ScenarioWallSegment,
  index: number,
  defaultHeight: number,
  defaultAssetId: TextureId,
  thickness: number,
  materials: ScenarioMaterials,
): WallBox | null {
  const { start, end } = segment;
  const dx = end[0] - start[0];
  const dz = end[2] - start[2];
  const length = Math.hypot(dx, dz);
  if (length < 0.05) {
    return null;
  }
  const height = segment.height ?? defaultHeight;
  const assetId = segment.assetId ?? defaultAssetId;
  return {
    key: segment.id ?? `seg-${index}`,
    size: [length, height, thickness],
    position: [(start[0] + end[0]) / 2, height / 2, (start[2] + end[2]) / 2],
    rotationY: Math.atan2(dz, dx),
    material: materialWithRepeat(getScenarioMaterial(materials, assetId), [
      length / WALL_TILE_SIZE,
      height / WALL_TILE_SIZE,
    ]),
  };
}

export function outerWalls(
  width: number,
  depth: number,
  wallHeight: number,
  thickness: number,
  assetId: TextureId,
  materials: ScenarioMaterials,
): WallBox[] {
  const baseMaterial = getScenarioMaterial(materials, assetId);
  const longLength = width + thickness * 2;
  const longMaterial = materialWithRepeat(baseMaterial, [
    longLength / WALL_TILE_SIZE,
    wallHeight / WALL_TILE_SIZE,
  ]);
  const shortMaterial = materialWithRepeat(baseMaterial, [
    depth / WALL_TILE_SIZE,
    wallHeight / WALL_TILE_SIZE,
  ]);
  return [
    {
      key: 'outer-n',
      size: [longLength, wallHeight, thickness],
      position: [0, wallHeight / 2, depth / 2 + thickness / 2],
      rotationY: 0,
      material: longMaterial,
    },
    {
      key: 'outer-s',
      size: [longLength, wallHeight, thickness],
      position: [0, wallHeight / 2, -depth / 2 - thickness / 2],
      rotationY: 0,
      material: longMaterial,
    },
    {
      key: 'outer-e',
      size: [thickness, wallHeight, depth],
      position: [width / 2 + thickness / 2, wallHeight / 2, 0],
      rotationY: 0,
      material: shortMaterial,
    },
    {
      key: 'outer-w',
      size: [thickness, wallHeight, depth],
      position: [-width / 2 - thickness / 2, wallHeight / 2, 0],
      rotationY: 0,
      material: shortMaterial,
    },
  ];
}
