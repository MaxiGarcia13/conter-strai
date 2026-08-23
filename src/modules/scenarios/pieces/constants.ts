import type { TextureId } from '@/modules/textures';

/** Standard ruin wall heights (meters). */
export const WALL_HEIGHT = {
  full: 3.5,
  mid: 2.4,
  low: 1.5,
} as const;

/** Common reusable wall lengths (meters). */
export const WALL_LENGTH = {
  short: 6,
  medium: 8,
  long: 12,
} as const;

export const FLOOR_TILE_SIZE = 4;
export const STREET_WIDTH = 8;

export type WallMaterialId = Extract<TextureId, 'castle_brick_broken' | 'broken_brick' | 'cliff_side'>;

export const WALL_MATERIAL = {
  fort: 'castle_brick_broken',
  plaster: 'broken_brick',
  cliff: 'cliff_side',
} as const satisfies Record<string, WallMaterialId>;

export const FLOOR_MATERIAL = {
  forest: 'forrest_ground',
  street: 'asphalt',
  tile: 'brown_floor_tiles',
} as const satisfies Record<string, TextureId>;
