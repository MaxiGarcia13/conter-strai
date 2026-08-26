export const MOVE_CODES = {
  forward: 'KeyW',
  back: 'KeyS',
  left: 'KeyA',
  right: 'KeyD',
  cameraCycle: 'KeyC',
  jump: 'KeyF',
  kneelToggle: 'KeyE',
  reload: 'KeyR',
  runModifier: 'Space',
} as const;

export const MOVE_KEY_CODES = [
  MOVE_CODES.forward,
  MOVE_CODES.back,
  MOVE_CODES.left,
  MOVE_CODES.right,
] as const;

export function isMovePressed(pressed: Set<string>): boolean {
  return MOVE_KEY_CODES.some((code) => pressed.has(code));
}
