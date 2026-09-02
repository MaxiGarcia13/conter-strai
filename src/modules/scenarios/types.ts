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
  /** Bottom of the segment above ground (m); default `0`. */
  baseY?: number;
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
  /** Street-level patches rendered in the ground phase, before houses. */
  groundFloorZones?: ScenarioFloorZone[];
  /** Patches under / around buildings rendered with the house phase. */
  houseFloorZones?: ScenarioFloorZone[];
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
  /** Perimeter treatment: `'walls'` closes the outer box, `'open'` uses a vista skirt. */
  perimeter?: {
    mode: 'walls' | 'open';
    /** Meters of extended ground beyond the playable bounds on each side. */
    vistaExtension?: number;
  };
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

export interface ScenarioHemisphereLighting {
  skyColor: string;
  groundColor: string;
  intensity: number;
}

export interface ScenarioLighting {
  ambient: number;
  sunIntensity: number;
  /** Sun position feeding the directional light's shadow setup. */
  sunPosition?: Vec3;
  /** Fill from the sky/ground gradient so dark fabrics keep their form. */
  hemisphere?: ScenarioHemisphereLighting;
  /** ACES filmic tone mapping for a flatter PBR response on dark materials. */
  toneMapping?: boolean;
  toneMappingExposure?: number;
}

export interface ScenarioSky {
  /** `'gradient'` renders a three.js `<Sky>`; `'color'` falls back to a flat horizon. */
  type: 'gradient' | 'color';
  /** Overrides `lighting.sunPosition` when the sky needs its own sun placement. */
  sunPosition?: Vec3;
  horizonColor?: string;
}

export interface ScenarioFog {
  color: string;
  near: number;
  far: number;
}

export interface ArenaEnvironment {
  lighting?: ScenarioLighting;
  sky?: ScenarioSky;
  fog?: ScenarioFog;
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

export type ScenarioId = 'arena-01';

export interface ScenarioMeta {
  id: ScenarioId;
  name: string;
  theme?: string;
  previewImageUrl?: string | null;
}

export type ScenarioConfig = ScenarioMeta & ArenaLayout & SpawnerConfig & ArenaEnvironment;
