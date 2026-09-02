import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RELOAD_CLIP_SECONDS, RELOAD_SOUND_BEFORE_END_SECONDS } from '@/modules/game/constants/reload';
import { playStoppableGameSound } from '@/modules/game/utils/play-game-sound';
import {
  resetReloadGunSoundForTests,
  scheduleReloadGunSound,
  stopReloadGunSound,
} from '@/modules/game/utils/reload-gun-sound';

vi.mock('@/modules/game/utils/play-game-sound', () => ({
  playStoppableGameSound: vi.fn(),
}));

const playStoppableGameSoundMock = vi.mocked(playStoppableGameSound);

describe('reload gun sound', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    playStoppableGameSoundMock.mockReturnValue({ stop: vi.fn() });
    playStoppableGameSoundMock.mockClear();
  });

  afterEach(() => {
    resetReloadGunSoundForTests();
    vi.useRealTimers();
  });

  it('schedules reload SFX near the end of the reload clip', () => {
    scheduleReloadGunSound();

    expect(playStoppableGameSoundMock).not.toHaveBeenCalled();

    vi.advanceTimersByTime((RELOAD_CLIP_SECONDS - RELOAD_SOUND_BEFORE_END_SECONDS) * 1000 - 1);
    expect(playStoppableGameSoundMock).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(playStoppableGameSoundMock).toHaveBeenCalledOnce();
    expect(playStoppableGameSoundMock).toHaveBeenCalledWith('reloadingGun');
  });

  it('cancels pending reload SFX before it plays', () => {
    scheduleReloadGunSound();
    stopReloadGunSound();

    vi.advanceTimersByTime(RELOAD_CLIP_SECONDS * 1000);
    expect(playStoppableGameSoundMock).not.toHaveBeenCalled();
  });

  it('stops active reload SFX when cancelled after playback starts', () => {
    const stop = vi.fn();
    playStoppableGameSoundMock.mockReturnValue({ stop });

    scheduleReloadGunSound();
    vi.advanceTimersByTime((RELOAD_CLIP_SECONDS - RELOAD_SOUND_BEFORE_END_SECONDS) * 1000);
    stopReloadGunSound();

    expect(stop).toHaveBeenCalledOnce();
  });
});
