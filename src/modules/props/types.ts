export interface PropDefinition {
  id: string;
  modelUrl: string;
  scale?: number;
  collidable?: boolean;
  /** XZ disc radius in meters (trees, compact props). Ignored when `collisionHalfExtents` is set. */
  collisionRadius?: number;
  /** Local XZ half-size in meters (oriented box; yaw from placement `rotationY`). */
  collisionHalfExtents?: [number, number];
}
