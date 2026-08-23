import type { TextureDefinition, TextureId } from './types';

export const textures: Record<TextureId, TextureDefinition> = {
  forrest_ground: {
    id: 'forrest_ground',
    maps: {
      color: '/assets/textures/maps/forrest_ground/color.jpg',
      normal: '/assets/textures/maps/forrest_ground/normal.png',
      roughness: '/assets/textures/maps/forrest_ground/roughness.png',
    },
  },
  asphalt: {
    id: 'asphalt',
    maps: {
      color: '/assets/textures/maps/asphalt/color.jpg',
      normal: '/assets/textures/maps/asphalt/normal.png',
      roughness: '/assets/textures/maps/asphalt/roughness.png',
    },
  },
  brown_floor_tiles: {
    id: 'brown_floor_tiles',
    maps: {
      color: '/assets/textures/maps/brown_floor_tiles/color.jpg',
      normal: '/assets/textures/maps/brown_floor_tiles/normal.png',
      roughness: '/assets/textures/maps/brown_floor_tiles/roughness.png',
    },
  },
  castle_brick_broken: {
    id: 'castle_brick_broken',
    maps: {
      color: '/assets/textures/maps/castle_brick_broken/color.jpg',
      normal: '/assets/textures/maps/castle_brick_broken/normal.png',
      roughness: '/assets/textures/maps/castle_brick_broken/roughness.png',
    },
  },
  broken_brick: {
    id: 'broken_brick',
    maps: {
      color: '/assets/textures/maps/broken_brick/color.jpg',
      normal: '/assets/textures/maps/broken_brick/normal.png',
      roughness: '/assets/textures/maps/broken_brick/roughness.png',
    },
  },
  cliff_side: {
    id: 'cliff_side',
    maps: {
      color: '/assets/textures/maps/cliff_side/color.jpg',
      normal: '/assets/textures/maps/cliff_side/normal.png',
      roughness: '/assets/textures/maps/cliff_side/roughness.png',
    },
  },
};
