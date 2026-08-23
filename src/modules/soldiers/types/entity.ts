import type { SoldierSkinId } from './skin';
import type { Team } from '@/modules/teams';

/** Runtime entity identifier (Colyseus session id once networking lands). */
export type EntityId = string;

export interface Soldier {
  id: EntityId;
  team: Team;
  skinId: SoldierSkinId;
}
