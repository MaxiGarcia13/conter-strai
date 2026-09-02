import type * as THREE from 'three';
import type { ScenarioMaterials } from '../hooks/use-scenario-material';
import type { ScenarioWallSegment, Vec3 } from '../types';
import type { TextureId } from '@/modules/textures';

import { createTiledBoxGeometry, getScenarioMaterial } from '../hooks/use-scenario-material';
import { findWallCorners, trimSegmentEnds } from '../pieces/wall-corner-helpers';

const WALL_TILE_SIZE = 4;

export interface WallBox {
  key: string;
  size: Vec3;
  position: Vec3;
  rotationY: number;
  material: THREE.MeshStandardMaterial;
  geometry: THREE.BoxGeometry;
}

function wallBox(
  key: string,
  size: Vec3,
  position: Vec3,
  rotationY: number,
  material: THREE.MeshStandardMaterial,
): WallBox {
  return {
    key,
    size,
    position,
    rotationY,
    material,
    geometry: createTiledBoxGeometry(size[0], size[1], size[2], WALL_TILE_SIZE),
  };
}

function segmentWall(
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
  const baseY = segment.baseY ?? 0;
  return wallBox(
    segment.id ?? `seg-${index}`,
    [length, height, thickness],
    [(start[0] + end[0]) / 2, baseY + height / 2, (start[2] + end[2]) / 2],
    Math.atan2(dz, dx),
    getScenarioMaterial(materials, assetId),
  );
}

/** Interior spans plus square posts at 90° unions. Collision still uses full authored segments. */
export function interiorWalls(
  segments: ScenarioWallSegment[],
  defaultHeight: number,
  defaultAssetId: TextureId,
  thickness: number,
  materials: ScenarioMaterials,
): WallBox[] {
  const corners = findWallCorners(segments, defaultHeight, defaultAssetId);
  const boxes: WallBox[] = [];

  segments.forEach((segment, index) => {
    const { start, end } = trimSegmentEnds(segment, corners, thickness);
    const wall = segmentWall({ ...segment, start, end }, index, defaultHeight, defaultAssetId, thickness, materials);
    if (wall) {
      boxes.push(wall);
    }
  });

  corners.forEach((corner, index) => {
    boxes.push(
      wallBox(
        `corner-${index}-${corner.position[0]}-${corner.position[2]}`,
        [thickness, corner.height, thickness],
        [corner.position[0], corner.height / 2, corner.position[2]],
        0,
        getScenarioMaterial(materials, corner.assetId),
      ),
    );
  });

  return boxes;
}

export function outerWalls(
  width: number,
  depth: number,
  wallHeight: number,
  thickness: number,
  assetId: TextureId,
  materials: ScenarioMaterials,
): WallBox[] {
  const material = getScenarioMaterial(materials, assetId);
  const longLength = width + thickness * 2;
  return [
    wallBox(
      'outer-n',
      [longLength, wallHeight, thickness],
      [0, wallHeight / 2, depth / 2 + thickness / 2],
      0,
      material,
    ),
    wallBox(
      'outer-s',
      [longLength, wallHeight, thickness],
      [0, wallHeight / 2, -depth / 2 - thickness / 2],
      0,
      material,
    ),
    wallBox(
      'outer-e',
      [thickness, wallHeight, depth],
      [width / 2 + thickness / 2, wallHeight / 2, 0],
      0,
      material,
    ),
    wallBox(
      'outer-w',
      [thickness, wallHeight, depth],
      [-width / 2 - thickness / 2, wallHeight / 2, 0],
      0,
      material,
    ),
  ];
}
