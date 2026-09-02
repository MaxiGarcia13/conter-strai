import { describe, expect, it } from 'vitest';
import { PLAYER_RADIUS } from '@/modules/game/constants/player';
import { remoteBlockersFromPlayers } from '@/modules/game/utils/remote-blockers-from-players';
import { arena01 } from '@/modules/scenarios/maps/arena-01';

describe('remoteBlockersFromPlayers', () => {
  it('yields no discs when no remotes are present', () => {
    expect(remoteBlockersFromPlayers([])).toEqual([]);
  });

  it('does not plant discs on unused arena spawn slots', () => {
    const spawnCount
      = (arena01.teamSpawns.soldier?.length ?? 0) + (arena01.teamSpawns.civilian?.length ?? 0);

    expect(spawnCount).toBeGreaterThan(2);
    expect(remoteBlockersFromPlayers([])).toHaveLength(0);
  });

  it('places a disc on a living remote at its current transform', () => {
    const blockers = remoteBlockersFromPlayers([
      { x: 4, z: -2, entityId: 'sess-a' },
    ]);

    expect(blockers).toEqual([
      { x: 4, z: -2, radius: PLAYER_RADIUS, entityId: 'sess-a' },
    ]);
  });

  it('skips eliminated remotes', () => {
    const blockers = remoteBlockersFromPlayers([
      { x: 0, z: 0, entityId: 'alive', isEliminated: false },
      { x: 3, z: 3, entityId: 'dead', isEliminated: true },
    ]);

    expect(blockers).toEqual([
      { x: 0, z: 0, radius: PLAYER_RADIUS, entityId: 'alive' },
    ]);
  });
});
