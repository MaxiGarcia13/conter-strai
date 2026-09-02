import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getPlayerPose,
  resetPlayerPoseEpoch,
  setPlayerLocomotion,
  setPlayerPose,
} from '@/modules/game/stores/player-state';
import { playGameSound } from '@/modules/game/utils/play-game-sound';
import {
  cancelReload,
  requestJump,
  requestReload,
  toggleKneel,
} from '@/modules/game/utils/player-pose-actions';

vi.mock('@/modules/game/utils/play-game-sound', () => ({
  playGameSound: vi.fn(),
}));

const playGameSoundMock = vi.mocked(playGameSound);

describe('player pose actions', () => {
  beforeEach(() => {
    setPlayerPose(null);
    setPlayerLocomotion('idle');
    resetPlayerPoseEpoch();
    playGameSoundMock.mockClear();
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
      expect(playGameSoundMock).toHaveBeenCalledOnce();
      expect(playGameSoundMock).toHaveBeenCalledWith('reloadingGun');
    });

    it('kneel-reloads while kneeling', () => {
      setPlayerPose('kneel');
      requestReload();
      expect(getPlayerPose()).toBe('reloadingKneel');
      expect(playGameSoundMock).toHaveBeenCalledOnce();
      expect(playGameSoundMock).toHaveBeenCalledWith('reloadingGun');
    });

    it('does not reload while walking', () => {
      setPlayerLocomotion('walk');
      requestReload();
      expect(getPlayerPose()).toBeNull();
      expect(playGameSoundMock).not.toHaveBeenCalled();
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
