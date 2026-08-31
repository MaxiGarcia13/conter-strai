/** True when the primary input is a coarse pointer (touch-primary device, e.g. phone/tablet). */
export function isTouchPrimaryDevice(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return false;
  }
  return window.matchMedia('(pointer: coarse)').matches;
}
