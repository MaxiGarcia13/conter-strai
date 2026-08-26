/**
 * Dev-only free / ghost camera flag. Never imported from production modules —
 * only from `game/dev/*`, which is lazy-loaded when `import.meta.env.DEV`.
 */

export type FreeCameraListener = (enabled: boolean) => void;

let freeCamera = false;
const listeners = new Set<FreeCameraListener>();

export function isFreeCamera(): boolean {
  return freeCamera;
}

export function setFreeCamera(enabled: boolean): void {
  if (freeCamera === enabled) {
    return;
  }
  freeCamera = enabled;
  for (const listener of listeners) {
    listener(enabled);
  }
}

export function toggleFreeCamera(): boolean {
  setFreeCamera(!freeCamera);
  return freeCamera;
}

export function subscribeFreeCamera(listener: FreeCameraListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
