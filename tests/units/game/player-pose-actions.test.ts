import { beforeEach, describe, expect, it } from 'vitest';
import {
  getPlayerPose,
  resetPlayerPoseEpoch,
  setPlayerLocomotion,
  setPlayerPose,
} from '@/modules/game/stores/player-state';
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
    resetPlayerPoseEpoch();
  });

  describe('requestJump', () => {
    it('starts an in-place jump from idle', () => {
      requestJump();
      expect(getPlayerPose()).toBe('jumpIdle');
    });

    it('starts a forward jump from a moving gait', () => {
      setPlayerLocomotion('walk');
      requestJump();
      expect(getPlayerPose()).toBe('jump');
    });

    it('jumps immediately from kneel (kneel lifts as the clip plays)', () => {
      setPlayerPose('kneel');
      requestJump();
      expect(getPlayerPose()).toBe('jumpIdle');
    });

    it('ignores jump while already jumping', () => {
      setPlayerPose('jump');
      requestJump();
      expect(getPlayerPose()).toBe('jump');
    });

    it('ignores jump while reloading', () => {
      setPlayerPose('reloading');
      requestJump();
      expect(getPlayerPose()).toBe('reloading');
    });
  });

  describe('toggleKneel', () => {
    it('enters kneel when idle', () => {
      toggleKneel();
      expect(getPlayerPose()).toBe('kneel');
    });

    it('kneels while moving (crouch-walk)', () => {
      setPlayerLocomotion('walk');
      toggleKneel();
      expect(getPlayerPose()).toBe('kneel');
    });

    it('stands up from kneel', () => {
      setPlayerPose('kneel');
      toggleKneel();
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
