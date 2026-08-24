import type { Team } from '@/modules/teams';
import type { TextureId } from '@/modules/textures';

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

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

export type CollisionAxis = 'x' | 'z';

/** Interior collider line — blocks movement without rendering a wall. */
export interface CollisionSegment {
  start: Vec3;
  end: Vec3;
  axis: CollisionAxis;
  height?: number;
}

/** Open span in an interior wall, measured along its axis. */
export interface CollisionHole {
  axis: CollisionAxis;
  center: Vec3;
  width: number;
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
  collisionHoles?: CollisionHole[];
}

// ---------------------------------------------------------------------------
// Spawns
// ---------------------------------------------------------------------------

export type SpawnPoint = Vec3;

export interface SpawnerConfig {
  teamSpawns: Record<Team, SpawnPoint[]>;
  /** Yaw (radians) per team; individual spawns fall back to facing map center. */
  spawnYaw?: Record<Team, number>;
}

// ---------------------------------------------------------------------------
// Environment
// ---------------------------------------------------------------------------

export interface ArenaEnvironment {
  lighting?: {
    ambient: number;
    sunIntensity: number;
  };
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

export type ScenarioId = 'arena-01';

export interface ScenarioMeta {
  id: ScenarioId;
  name: string;
  theme?: string;
}

export type ScenarioConfig = ScenarioMeta & ArenaLayout & SpawnerConfig & ArenaEnvironment;
