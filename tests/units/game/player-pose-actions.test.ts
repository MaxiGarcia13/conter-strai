import { beforeEach, describe, expect, it } from 'vitest';
import {
  getPlayerPose,
  setPlayerLocomotion,
  setPlayerPose,
} from '@/modules/game/state/player-state';
import {
  cancelReload,
  requestJump,
  requestReload,
  toggleKneel,
} from '@/modules/game/utils/player-pose-actions';

describe('player pose actions', () => {
  beforeEach(() => {
    setPlayerPose(null);
    setPlayerLocomotion('idle');
  });

  describe('requestJump', () => {
    it('starts a jump from idle', () => {
      requestJump();
      expect(getPlayerPose()).toBe('jump');
    });

    it('clears kneel instead of jumping immediately', () => {
      setPlayerPose('kneel');
      requestJump();
      expect(getPlayerPose()).toBeNull();
    });

    it('ignores jump while already posing', () => {
      setPlayerPose('reloading');
      requestJump();
      expect(getPlayerPose()).toBe('reloading');
    });
  });

  describe('toggleKneel', () => {
    it('enters kneel when idle and not moving', () => {
      toggleKneel(false);
      expect(getPlayerPose()).toBe('kneel');
    });

    it('does not kneel while moving', () => {
      toggleKneel(true);
      expect(getPlayerPose()).toBeNull();
    });

    it('stands up from kneel', () => {
      setPlayerPose('kneel');
      toggleKneel(false);
      expect(getPlayerPose()).toBeNull();
    });
  });

  describe('requestReload / cancelReload', () => {
    it('reloads from idle', () => {
      requestReload();
      expect(getPlayerPose()).toBe('reloading');
    });

    it('kneel-reloads while kneeling', () => {
      setPlayerPose('kneel');
      requestReload();
      expect(getPlayerPose()).toBe('reloadingKneel');
    });

    it('does not reload while walking', () => {
      setPlayerLocomotion('walk');
      requestReload();
      expect(getPlayerPose()).toBeNull();
    });

    it('cancels standing reload', () => {
      setPlayerPose('reloading');
      cancelReload();
      expect(getPlayerPose()).toBeNull();
    });

    it('returns to kneel after kneel-reload cancel', () => {
      setPlayerPose('reloadingKneel');
      cancelReload();
      expect(getPlayerPose()).toBe('kneel');
    });
  });
});
