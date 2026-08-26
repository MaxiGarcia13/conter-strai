import type { SchemaType } from '@colyseus/schema';
import { schema, t } from '@colyseus/schema';
import { DEFAULT_PLAY_SKIN_ID, DEFAULT_TEAM } from '@/modules/game/constants/play-defaults';

/**
 * Per-player authoritative state — one instance per connected session.
 *
 * Field names and semantics mirror client types:
 * - `hp` / `eliminated` align with `combat/HealthState`
 * - `team` aligns with `teams/Team`
 * - `skin` aligns with `soldiers/SoldierSkinId`
 */
export const PlayerStateSchema = schema(
  {
    x: t.float32(),
    y: t.float32(),
    z: t.float32(),
    rotY: t.float32(),
    hp: t.number(),
    eliminated: t.boolean(),
    team: t.string(),
    skin: t.string(),
  },
  'PlayerState',
);

export type PlayerState = SchemaType<typeof PlayerStateSchema>;

export function createPlayerState(
  opts: Partial<Pick<PlayerState, 'team' | 'skin'>> = {},
): PlayerState {
  const state = new PlayerStateSchema();
  state.hp = 100;
  state.eliminated = false;
  state.team = opts.team ?? DEFAULT_TEAM;
  state.skin = opts.skin ?? DEFAULT_PLAY_SKIN_ID;
  return state;
}
