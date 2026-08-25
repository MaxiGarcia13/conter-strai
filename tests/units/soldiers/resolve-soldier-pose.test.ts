import { describe, expect, it } from 'vitest';

import { LOCAL_PLAYER_ENTITY_ID } from '@/modules/game/constants/player';
import {
  acknowledgeHitReaction,
  requestHitReaction,
} from '@/modules/soldiers/state/hit-reaction-state';
import { resolveLocalPlayerPose, resolveNpcPose } from '@/modules/soldiers/utils/resolve-soldier-pose';

describe('resolveLocalPlayerPose', () => {
  it('prioritizes dying over everything else', () => {
    requestHitReaction(LOCAL_PLAYER_ENTITY_ID);
    expect(resolveLocalPlayerPose('dying', LOCAL_PLAYER_ENTITY_ID)).toBe('dying');
    acknowledgeHitReaction(LOCAL_PLAYER_ENTITY_ID);
  });

  it('prioritizes jump over hit reaction and shooting', () => {
    requestHitReaction(LOCAL_PLAYER_ENTITY_ID);
    expect(resolveLocalPlayerPose('jump', LOCAL_PLAYER_ENTITY_ID)).toBe('jump');
    expect(resolveLocalPlayerPose('shooting', LOCAL_PLAYER_ENTITY_ID)).toBe('hitReaction');
    acknowledgeHitReaction(LOCAL_PLAYER_ENTITY_ID);
  });

  it('returns explicit pose when no higher-priority pose is active', () => {
    acknowledgeHitReaction(LOCAL_PLAYER_ENTITY_ID);
    expect(resolveLocalPlayerPose('shooting', LOCAL_PLAYER_ENTITY_ID)).toBe('shooting');
    expect(resolveLocalPlayerPose('kneel', LOCAL_PLAYER_ENTITY_ID)).toBe('kneel');
  });
});

describe('resolveNpcPose', () => {
  const entityId = 'npc-1';

  it('returns dying when eliminated', () => {
    requestHitReaction(entityId);
    expect(resolveNpcPose(entityId, true)).toBe('dying');
  });

  it('returns hit reaction when queued and still alive', () => {
    requestHitReaction(entityId);
    expect(resolveNpcPose(entityId, false)).toBe('hitReaction');
  });

  it('returns null when idle', () => {
    acknowledgeHitReaction(entityId);
    expect(resolveNpcPose(entityId, false)).toBeNull();
  });
});
