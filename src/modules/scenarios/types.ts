import type { Team } from '../teams';
import type { TextureId } from '@/modules/textures';

export type Vec3 = [number, number, number];

export type ScenarioId = 'arena-01';

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

export interface ScenarioConfig {
  id: string;
  name: string;
  theme?: string;
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
  teamSpawns: Record<Team, Vec3[]>;
  spawnYaw?: Record<Team, number>;
  lighting?: {
    ambient: number;
    sunIntensity: number;
  };
}
