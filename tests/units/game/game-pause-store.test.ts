import { beforeEach, describe, expect, it } from 'vitest';
import { GAME_BINDINGS, GAME_COMMANDS, MOVE_CODES, MOVE_KEY_CODES } from '@/modules/game/constants/game-bindings';
import { useGamePauseStore } from '@/modules/game/stores/game-pause-store';

describe('game-bindings', () => {
  it('derives MOVE_CODES from the registry', () => {
    expect(MOVE_CODES).toMatchObject({
      forward: GAME_BINDINGS.move.codes.forward,
      back: GAME_BINDINGS.move.codes.back,
      left: GAME_BINDINGS.move.codes.left,
      right: GAME_BINDINGS.move.codes.right,
      cameraCycle: GAME_BINDINGS.cameraCycle.code,
      jump: GAME_BINDINGS.jump.code,
      kneelToggle: GAME_BINDINGS.kneelToggle.code,
      reload: GAME_BINDINGS.reload.code,
      runModifier: GAME_BINDINGS.sprint.code,
    });
    expect(MOVE_KEY_CODES).toEqual([
      GAME_BINDINGS.move.codes.forward,
      GAME_BINDINGS.move.codes.back,
      GAME_BINDINGS.move.codes.left,
      GAME_BINDINGS.move.codes.right,
    ]);
  });

  it('marks free-camera as dev-only in the key label', () => {
    expect(GAME_BINDINGS.freeCamera.devOnly).toBe(true);
    expect(GAME_COMMANDS.find((command) => command.key === GAME_BINDINGS.freeCamera.label)?.action).toBe(
      GAME_BINDINGS.freeCamera.action,
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
