import type { TextureId } from '@/modules/textures';

export type Vec3 = [number, number, number];

export interface ScenarioProp {
  id: string;
  position: Vec3;
  rotationY?: number;
  scale?: number;
  collidable?: boolean;
}

export interface ScenarioFloorZone {
  id: string;
  assetId: TextureId;
  /** Center on the ground plane (Y is ignored). */
  position: Vec3;
  size: [number, number];
  repeat?: [number, number];
}

export interface ScenarioWallSegment {
  id?: string;
  start: Vec3;
  end: Vec3;
  height?: number;
  assetId?: TextureId;
}

/** Interior collider line — blocks movement without rendering a wall. */
export interface CollisionSegment {
  start: Vec3;
  end: Vec3;
  height?: number;
}

export interface ArenaLayout {
  bounds: {
    width: number;
    depth: number;
    wallHeight: number;
  };
  floor: {
    assetId: TextureId;
    repeat?: [number, number];
  };
  floorZones?: ScenarioFloorZone[];
  walls: {
    assetId: TextureId;
    thickness?: number;
    /** Outer perimeter height (meters). Defaults to bounds.wallHeight. */
    height?: number;
  };
  wallSegments?: ScenarioWallSegment[];
  props?: ScenarioProp[];
  collisionSegments?: CollisionSegment[];
}
