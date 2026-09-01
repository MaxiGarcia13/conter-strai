export type GameCommandIconId = 'menu' | 'fire' | 'run' | 'arrow-down';

export interface GameCommand {
  key: string;
  action: string;
  devOnly?: boolean;
  iconId?: GameCommandIconId;
}

/** Single source for gameplay input bindings and pause-menu command labels (US-9.6). */
export const GAME_BINDINGS = {
  move: {
    codes: {
      forward: 'KeyW',
      back: 'KeyS',
      left: 'KeyA',
      right: 'KeyD',
    },
    label: 'WASD',
    action: 'Move',
  },
  sprint: { code: 'Space', label: 'Space', action: 'Sprint' },
  cameraCycle: { code: 'KeyC', label: 'C', action: 'Cycle camera mode' },
  jump: { code: 'KeyQ', label: 'Q', action: 'Jump' },
  kneelToggle: { code: 'ShiftLeft', label: 'Shift', action: 'Kneel toggle' },
  reload: { code: 'KeyR', label: 'R', action: 'Reload' },
  shoot: { input: 'mouse-primary', label: 'LMB', action: 'Shoot (pointer locked)' },
  pause: { code: 'Escape', label: 'Esc', action: 'Pause menu' },
  freeCamera: { code: 'KeyV', label: 'V (dev)', action: 'Toggle free camera', devOnly: true },
} as const;

/** Keyboard codes used by movement / pose hooks (`axesFromPressedCodes`, sprint modifier). */
export const MOVE_CODES = {
  forward: GAME_BINDINGS.move.codes.forward,
  back: GAME_BINDINGS.move.codes.back,
  left: GAME_BINDINGS.move.codes.left,
  right: GAME_BINDINGS.move.codes.right,
  cameraCycle: GAME_BINDINGS.cameraCycle.code,
  jump: GAME_BINDINGS.jump.code,
  kneelToggle: GAME_BINDINGS.kneelToggle.code,
  reload: GAME_BINDINGS.reload.code,
  runModifier: GAME_BINDINGS.sprint.code,
} as const;

export const MOVE_KEY_CODES = [
  MOVE_CODES.forward,
  MOVE_CODES.back,
  MOVE_CODES.left,
  MOVE_CODES.right,
] as const;

/** Mobile touch control labels — mirrors {@link GAME_BINDINGS} for pause-panel Commands on touch-primary. */
export const MOBILE_BINDINGS = {
  move: { label: 'Joystick', action: 'Move' },
  sprint: {
    label: 'Hold',
    action: 'Sprint',
    iconId: 'run',
  },
  kneelToggle: {
    label: 'Tap',
    action: 'Kneel toggle',
    iconId: 'arrow-down',
  },
  shoot: {
    label: 'Tap',
    action: 'Shoot',
    iconId: 'fire',
  },
  pause: {
    label: 'Tap',
    action: 'Pause menu',
    iconId: 'menu',
  },
  cameraCycle: {
    label: 'Pause menu → Cycle camera',
    action: 'Cycle camera mode',
  },
} as const;

/** Pause panel Commands list — derived from {@link GAME_BINDINGS}. */
export const GAME_COMMANDS: GameCommand[] = [
  { key: GAME_BINDINGS.move.label, action: GAME_BINDINGS.move.action },
  { key: GAME_BINDINGS.sprint.label, action: GAME_BINDINGS.sprint.action },
  { key: GAME_BINDINGS.cameraCycle.label, action: GAME_BINDINGS.cameraCycle.action },
  { key: GAME_BINDINGS.jump.label, action: GAME_BINDINGS.jump.action },
  { key: GAME_BINDINGS.kneelToggle.label, action: GAME_BINDINGS.kneelToggle.action },
  {
    key: GAME_BINDINGS.reload.label,
    action: GAME_BINDINGS.reload.action,
  },
  {
    key: GAME_BINDINGS.shoot.label,
    action: GAME_BINDINGS.shoot.action,
  },
  {
    key: GAME_BINDINGS.pause.label,
    action: GAME_BINDINGS.pause.action,
  },
  {
    key: GAME_BINDINGS.freeCamera.label,
    action: GAME_BINDINGS.freeCamera.action,
    devOnly: GAME_BINDINGS.freeCamera.devOnly,
  },
];

/** Pause panel Commands list for touch-primary devices. */
export const MOBILE_COMMANDS: GameCommand[] = [
  { key: MOBILE_BINDINGS.move.label, action: MOBILE_BINDINGS.move.action },
  {
    key: MOBILE_BINDINGS.sprint.label,
    action: MOBILE_BINDINGS.sprint.action,
    iconId: MOBILE_BINDINGS.sprint.iconId,
  },
  {
    key: MOBILE_BINDINGS.kneelToggle.label,
    action: MOBILE_BINDINGS.kneelToggle.action,
    iconId: MOBILE_BINDINGS.kneelToggle.iconId,
  },
  {
    key: MOBILE_BINDINGS.shoot.label,
    action: MOBILE_BINDINGS.shoot.action,
    iconId: MOBILE_BINDINGS.shoot.iconId,
  },
  {
    key: MOBILE_BINDINGS.pause.label,
    action: MOBILE_BINDINGS.pause.action,
    iconId: MOBILE_BINDINGS.pause.iconId,
  },
  {
    key: MOBILE_BINDINGS.cameraCycle.label,
    action: MOBILE_BINDINGS.cameraCycle.action,
  },
];
