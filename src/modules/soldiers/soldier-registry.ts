import type { SoldierDefinition, SoldierId } from './types';

export const soldiers: Record<SoldierId, SoldierDefinition> = {
  'swat-guy': {
    id: 'swat-guy',
    modelUrl: '/assets/soldiers/swat-guy.glb',
    scale: 0.01,
  },
};
