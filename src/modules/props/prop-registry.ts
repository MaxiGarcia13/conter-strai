import type { PropDefinition } from './types';

export const props: Record<string, PropDefinition> = {
  jacaranda: {
    id: 'jacaranda',
    modelUrl: '/assets/greenery/jacaranda.glb',
    scale: 0.4,
    collidable: true,
    collisionRadius: 0.9,
  },
};
