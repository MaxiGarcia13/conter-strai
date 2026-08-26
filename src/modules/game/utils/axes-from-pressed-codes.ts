export interface WasdCodeMap {
  forward: string;
  back: string;
  left: string;
  right: string;
}

/** Horizontal strafe/forward axes from a pressed-code set (−1 / 0 / 1). */
export function axesFromPressedCodes(
  pressed: Set<string>,
  codes: WasdCodeMap,
): { strafe: number; forward: number } {
  let strafe = 0;
  let forward = 0;

  if (pressed.has(codes.forward)) {
    forward += 1;
  }
  if (pressed.has(codes.back)) {
    forward -= 1;
  }
  if (pressed.has(codes.left)) {
    strafe -= 1;
  }
  if (pressed.has(codes.right)) {
    strafe += 1;
  }

  return { strafe, forward };
}
