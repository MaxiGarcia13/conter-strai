import { PerspectiveCamera, Scene } from 'three';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useGamePauseStore } from '@/modules/game/stores/game-pause-store';
import { setPlayerPose } from '@/modules/game/stores/player-state';
import { useRoundStore } from '@/modules/game/stores/round-store';
import { fireWeapon, resetFireWeaponCooldown, setFireWeaponView } from '@/modules/game/utils/fire-weapon';
import { playGameSound } from '@/modules/game/utils/play-game-sound';
import { PISTOL_FIRE_COOLDOWN_MS } from '@/modules/weapons/constants/pistol';

vi.mock('@/modules/game/utils/play-game-sound', () => ({
  playGameSound: vi.fn(),
  playEntityGameSound: vi.fn(),
}));

const playGameSoundMock = vi.mocked(playGameSound);

describe('fireWeapon', () => {
  beforeEach(() => {
    resetFireWeaponCooldown();
    useGamePauseStore.getState().reset();
    useRoundStore.setState({ phase: 'live' });
    setPlayerPose(null);
    setFireWeaponView({ camera: new PerspectiveCamera(), scene: new Scene() });
    playGameSoundMock.mockClear();
  });

  afterEach(() => {
    setFireWeaponView(null);
    setPlayerPose(null);
    useGamePauseStore.getState().reset();
    useRoundStore.setState({ phase: 'live' });
  });

  it('fires when pause, phase, pose, and cooldown allow it', () => {
    expect(fireWeapon(1_000)).toBe(true);
    expect(playGameSoundMock).toHaveBeenCalledOnce();
  });

  it('does not fire while paused', () => {
    useGamePauseStore.getState().setPaused(true);
    expect(fireWeapon(1_000)).toBe(false);
    expect(playGameSoundMock).not.toHaveBeenCalled();
  });

  it('does not fire outside the live phase', () => {
    useRoundStore.setState({ phase: 'countdown' });
    expect(fireWeapon(1_000)).toBe(false);

    useRoundStore.setState({ phase: 'round-end' });
    expect(fireWeapon(1_000)).toBe(false);

    expect(playGameSoundMock).not.toHaveBeenCalled();
  });

  it('does not fire while reloading, kneel-reloading, or dying', () => {
    for (const pose of ['reloading', 'reloadingKneel', 'dying'] as const) {
      setPlayerPose(pose);
      expect(fireWeapon(1_000)).toBe(false);
    }
    expect(playGameSoundMock).not.toHaveBeenCalled();
  });

  it('allows fire while kneeling', () => {
    setPlayerPose('kneel');
    expect(fireWeapon(1_000)).toBe(true);
    expect(playGameSoundMock).toHaveBeenCalledOnce();
  });

  it('does not fire again before the weapon cooldown elapses', () => {
    expect(fireWeapon(1_000)).toBe(true);
    expect(fireWeapon(1_000 + PISTOL_FIRE_COOLDOWN_MS - 1)).toBe(false);
    expect(playGameSoundMock).toHaveBeenCalledOnce();
  });

  it('fires again once the weapon cooldown has elapsed', () => {
    expect(fireWeapon(1_000)).toBe(true);
    expect(fireWeapon(1_000 + PISTOL_FIRE_COOLDOWN_MS)).toBe(true);
    expect(playGameSoundMock).toHaveBeenCalledTimes(2);
  });
});
