/** Request pointer lock; swallow rejections (rapid re-lock after Esc, iframe limits). */
export function requestPointerLock(domElement: HTMLElement): void {
  try {
    const request = domElement.requestPointerLock() as unknown;
    if (request instanceof Promise) {
      request.catch(() => undefined);
    }
  } catch {
    // Pointer lock unavailable (iframe permissions, etc.).
  }
}
