import type { TextureDefinition, TextureId } from './types';

export const textures: Record<TextureId, TextureDefinition> = {
  forrest_ground: {
    id: 'forrest_ground',
    url: '/assets/textures/floor/forrest_ground.glb',
  },
  coral_fort_wall: {
    id: 'coral_fort_wall',
    url: '/assets/textures/wall/coral_fort_wall.glb',
  },
};
