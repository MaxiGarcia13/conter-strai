import { useFreeCamera } from './use-free-camera';

/**
 * DOM chrome for DEV free-cam: status overlay + hide aim crosshair.
 * Lazy-loaded only when `import.meta.env.DEV`.
 */
export function DevGameChrome() {
  const free = useFreeCamera();

  if (!free) {
    return (
      <p className="pointer-events-none fixed top-14 left-4 z-10 font-mono text-[10px] tracking-widest text-foreground/50 uppercase">
        [V] free cam
      </p>
    );
  }

  return (
    <>
      <div
        role="status"
        aria-label="Camera: Free cam"
        className="pointer-events-none fixed top-4 left-4 z-20 border border-accent bg-background-deep/90 px-3 py-1.5 font-mono text-xs tracking-widest text-foreground uppercase"
      >
        <span className="mr-2 text-accent">[V]</span>
        Free cam — WASD · click look · Q/E · Shift
      </div>
      <style>{'[data-testid="crosshair"]{display:none!important}'}</style>
    </>
  );
}
