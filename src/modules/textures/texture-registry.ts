import type { TextureDefinition, TextureId } from './types';

export const textures: Record<TextureId, TextureDefinition> = {
  forrest_ground: {
    id: 'forrest_ground',
    url: '/assets/textures/floor/forrest_ground.glb',
  },
  cobblestone_embedded_asphalt: {
    id: 'cobblestone_embedded_asphalt',
    url: '/assets/textures/floor/cobblestone_embedded_asphalt.glb',
  },
  brown_floor_tiles: {
    id: 'brown_floor_tiles',
    url: '/assets/textures/floor/brown_floor_tiles.glb',
  },
  coral_fort_wall: {
    id: 'coral_fort_wall',
    url: '/assets/textures/wall/coral_fort_wall.glb',
  },
  damaged_plaster: {
    id: 'damaged_plaster',
    url: '/assets/textures/wall/damaged_plaster.glb',
  },
  cliff_side: {
    id: 'cliff_side',
    url: '/assets/textures/wall/cliff_side.glb',
  },
};
