import type { Team } from '../teams';

export type Vec3 = [number, number, number];

export type ScenarioId = 'arena-01';

export interface ScenarioProp {
  id: string;
  position: Vec3;
  rotationY?: number;
  scale?: number;
  collidable?: boolean;
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
    assetId: string;
    repeat?: [number, number];
  };
  walls: {
    assetId: string;
    thickness?: number;
  };
  wallSegments?: {
    start: Vec3;
    end: Vec3;
    height?: number;
  }[];
  props?: ScenarioProp[];
  teamSpawns: Record<Team, Vec3[]>;
  spawnYaw?: Record<Team, number>;
  lighting?: {
    ambient: number;
    sunIntensity: number;
  };
}
