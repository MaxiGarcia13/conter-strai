import type { ScenarioFloorZone } from '@/modules/scenarios/types';
import { floorZone } from '@/modules/scenarios/pieces/floor-helpers';

/** Street grid matching the ruined-village diagram (green rectangles). */
export const arena01GroundFloors: ScenarioFloorZone[] = [
  floorZone('street-main', 'asphalt', 0, -8, 92, 6),
  floorZone('street-v-left', 'asphalt', -22, 6, 6, 28),
  floorZone('street-v-right', 'asphalt', 26, 5, 6, 30),
  floorZone('street-bl', 'asphalt', -36, 17, 26, 6),
  floorZone('street-r-spur', 'asphalt', 39, 14, 18, 6),
];
