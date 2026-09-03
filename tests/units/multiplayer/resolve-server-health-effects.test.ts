import type { MatchPlayerSnapshot, PlayersUpdatePayload } from '@/modules/multiplayer/adapters/colyseus-adapter';
import { describe, expect, it } from 'vitest';
import { resolveServerHealthEffects } from '@/modules/multiplayer/services/resolve-server-health-effects';

const LOCAL = 'local-session';

function snapshot(partial: Partial<MatchPlayerSnapshot> & { sessionId: string }): MatchPlayerSnapshot {
  return {
    x: 0,
    y: 0,
    z: 0,
    rotY: 0,
    hp: 100,
    eliminated: false,
    team: 'soldier',
    skin: 'swat-1',
    ...partial,
  };
}

function payload(players: MatchPlayerSnapshot[]): PlayersUpdatePayload {
  return { localSessionId: LOCAL, players };
}

describe('resolveServerHealthEffects', () => {
  it('mirrors the local player health state', () => {
    const result = resolveServerHealthEffects(
      payload([snapshot({ sessionId: LOCAL, hp: 40 })]),
      new Map([[LOCAL, 40]]),
    );

    expect(result.localHealth).toEqual({ currentHp: 40, maxHp: 100, isEliminated: false });
  });

  it('flinches a peer who loses HP while still alive', () => {
    const peer = snapshot({ sessionId: 'peer', hp: 70 });

    const result = resolveServerHealthEffects(
      payload([snapshot({ sessionId: LOCAL }), peer]),
      new Map([
        [LOCAL, 100],
        ['peer', 100],
      ]),
    );

    expect(result.hitReactions).toEqual(['peer']);
    expect(result.injuredIds).toEqual(['peer']);
  });

  it('does not flinch a peer whose drop is also elimination', () => {
    const peer = snapshot({ sessionId: 'peer', hp: 0, eliminated: true });

    const result = resolveServerHealthEffects(
      payload([snapshot({ sessionId: LOCAL }), peer]),
      new Map([
        [LOCAL, 100],
        ['peer', 60],
      ]),
    );

    expect(result.hitReactions).toEqual([]);
    expect(result.injuredIds).toEqual(['peer']);
  });

  it('does not flinch on first sighting or on unchanged HP', () => {
    const result = resolveServerHealthEffects(
      payload([snapshot({ sessionId: LOCAL }), snapshot({ sessionId: 'peer', hp: 80 })]),
      new Map([[LOCAL, 100]]),
    );

    expect(result.hitReactions).toEqual([]);
    expect(result.injuredIds).toEqual([]);
  });

  it('tracks next HP per session and prunes absent players', () => {
    const result = resolveServerHealthEffects(
      payload([
        snapshot({ sessionId: LOCAL, hp: 90 }),
        snapshot({ sessionId: 'peer', hp: 55 }),
      ]),
      new Map([
        [LOCAL, 100],
        ['peer', 100],
        ['gone', 100],
      ]),
    );

    expect(result.nextById.get(LOCAL)).toBe(90);
    expect(result.nextById.get('peer')).toBe(55);
    expect(result.nextById.has('gone')).toBe(false);
    expect(result.injuredIds).toEqual([LOCAL, 'peer']);
  });
});
