import type { ScenarioProp } from '@/modules/scenarios/types';

/**
 * Cover props for arena-01 — concrete road barriers near map boundaries and
 * covered cars on the main street for mid-lane cover.
 */
export const arena01Infrastructure: ScenarioProp[] = [
  // Main street — pair near centerline (south lane)
  { id: 'coveredCar', position: [-10, 0, -5], rotationY: 20 },
  { id: 'coveredCar', position: [0, 0, -11], rotationY: Math.PI / 2 },
  // Main street — west pair near playable boundary (soldier side)
  { id: 'concreteRoadBarrier', position: [-40, 0, -10], rotationY: Math.PI / 2 },
  { id: 'concreteRoadBarrier', position: [-37, 0, -8], rotationY: Math.PI / 2 },
  // Main street — east pair near playable boundary (civilian side)
  { id: 'concreteRoadBarrier', position: [40, 0, -10], rotationY: Math.PI / 2 },
  { id: 'concreteRoadBarrier', position: [37, 0, -8], rotationY: Math.PI / 2 },
  // street-v-left — west edge, south end near main-street junction
  { id: 'concreteRoadBarrier', position: [-20, 0, 22] },
  { id: 'concreteRoadBarrier', position: [-22, 0, 22] },
  // street-v-right — west (left) edge, south end
  { id: 'concreteRoadBarrier', position: [24, 0, 22] },
  { id: 'concreteRoadBarrier', position: [26, 0, 22] },

  { id: 'coveredCar', position: [26, 0, -4] },
];
