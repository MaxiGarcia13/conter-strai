import { beforeEach, describe, expect, it } from 'vitest';
import { GAME_BINDINGS, GAME_COMMANDS } from '@/modules/game/constants/game-bindings';
import { useGamePauseStore } from '@/modules/game/state/game-pause-store';

describe('game-bindings', () => {
  it('lists the gameplay bindings from the single source of truth', () => {
    expect(GAME_COMMANDS.map((command) => command.key)).toEqual([
      'WASD',
      'Space',
      'C',
      'F',
      'E',
      'R',
      'LMB',
      'Esc',
      'V (dev)',
    ]);
  });

  it('derives runtime keyboard codes from the same registry', () => {
    expect(GAME_BINDINGS.jump.code).toBe('KeyF');
    expect(GAME_BINDINGS.pause.code).toBe('Escape');
    expect(GAME_BINDINGS.freeCamera.code).toBe('KeyV');
  });

  it('marks free-camera as dev-only in the key label', () => {
    expect(GAME_BINDINGS.freeCamera.devOnly).toBe(true);
    expect(GAME_COMMANDS.find((command) => command.key === 'V (dev)')?.action).toBe(
      'Toggle free camera',
    );
  });
});

describe('useGamePauseStore', () => {
  beforeEach(() => {
    useGamePauseStore.getState().reset();
  });

  it('starts unpaused with commands closed', () => {
    expect(useGamePauseStore.getState()).toMatchObject({ isPaused: false, showCommands: false });
  });

  it('toggles pause', () => {
    useGamePauseStore.getState().togglePause();
    expect(useGamePauseStore.getState().isPaused).toBe(true);

    useGamePauseStore.getState().togglePause();
    expect(useGamePauseStore.getState().isPaused).toBe(false);
  });

  it('closes the commands list when resuming from pause', () => {
    useGamePauseStore.getState().setShowCommands(true);
    useGamePauseStore.getState().togglePause();
    expect(useGamePauseStore.getState().showCommands).toBe(true);

    useGamePauseStore.getState().togglePause();
    expect(useGamePauseStore.getState().isPaused).toBe(false);
    expect(useGamePauseStore.getState().showCommands).toBe(false);
  });

  it('setPaused clears the commands list when closing', () => {
    useGamePauseStore.getState().setPaused(true);
    useGamePauseStore.getState().setShowCommands(true);

    useGamePauseStore.getState().setPaused(false);
    expect(useGamePauseStore.getState().isPaused).toBe(false);
    expect(useGamePauseStore.getState().showCommands).toBe(false);
  });

  it('reset restores the initial state', () => {
    useGamePauseStore.getState().setPaused(true);
    useGamePauseStore.getState().setShowCommands(true);
    useGamePauseStore.getState().reset();

    expect(useGamePauseStore.getState()).toMatchObject({ isPaused: false, showCommands: false });
  });
});
