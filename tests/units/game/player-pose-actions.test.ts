import { beforeEach, describe, expect, it, vi } from 'vitest';
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
import {
  resetReloadGunSoundForTests,
  scheduleReloadGunSound,
  stopReloadGunSound,
} from '@/modules/game/utils/reload-gun-sound';

vi.mock('@/modules/game/utils/reload-gun-sound', () => ({
  scheduleReloadGunSound: vi.fn(),
  stopReloadGunSound: vi.fn(),
  resetReloadGunSoundForTests: vi.fn(),
}));

const scheduleReloadGunSoundMock = vi.mocked(scheduleReloadGunSound);
const stopReloadGunSoundMock = vi.mocked(stopReloadGunSound);

describe('player pose actions', () => {
  beforeEach(() => {
    setPlayerPose(null);
    setPlayerLocomotion('idle');
    resetPlayerPoseEpoch();
    scheduleReloadGunSoundMock.mockClear();
    stopReloadGunSoundMock.mockClear();
    resetReloadGunSoundForTests();
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
      expect(scheduleReloadGunSoundMock).toHaveBeenCalledOnce();
    });

    it('kneel-reloads while kneeling', () => {
      setPlayerPose('kneel');
      requestReload();
      expect(getPlayerPose()).toBe('reloadingKneel');
      expect(scheduleReloadGunSoundMock).toHaveBeenCalledOnce();
    });

    it('does not reload while walking', () => {
      setPlayerLocomotion('walk');
      requestReload();
      expect(getPlayerPose()).toBeNull();
      expect(scheduleReloadGunSoundMock).not.toHaveBeenCalled();
    });

    it('cancels standing reload and stops reload SFX', () => {
      setPlayerPose('reloading');
      cancelReload();
      expect(getPlayerPose()).toBeNull();
      expect(stopReloadGunSoundMock).toHaveBeenCalledOnce();
    });

    it('returns to kneel after kneel-reload cancel and stops reload SFX', () => {
      setPlayerPose('reloadingKneel');
      cancelReload();
      expect(getPlayerPose()).toBe('kneel');
      expect(stopReloadGunSoundMock).toHaveBeenCalledOnce();
    });
  });
});
