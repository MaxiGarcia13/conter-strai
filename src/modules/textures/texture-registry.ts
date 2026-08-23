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
  cobblestone_embedded_asphalt: {
    id: 'cobblestone_embedded_asphalt',
    maps: {
      color: '/assets/textures/maps/cobblestone_embedded_asphalt/color.jpg',
      normal: '/assets/textures/maps/cobblestone_embedded_asphalt/normal.png',
      roughness: '/assets/textures/maps/cobblestone_embedded_asphalt/roughness.png',
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
  coral_fort_wall: {
    id: 'coral_fort_wall',
    maps: {
      color: '/assets/textures/maps/coral_fort_wall/color.jpg',
      normal: '/assets/textures/maps/coral_fort_wall/normal.png',
      roughness: '/assets/textures/maps/coral_fort_wall/roughness.png',
    },
  },
  damaged_plaster: {
    id: 'damaged_plaster',
    maps: {
      color: '/assets/textures/maps/damaged_plaster/color.jpg',
      normal: '/assets/textures/maps/damaged_plaster/normal.png',
      roughness: '/assets/textures/maps/damaged_plaster/roughness.png',
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
