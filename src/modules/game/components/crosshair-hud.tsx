/** Center-screen aim reference for every camera mode; aiming is the camera look itself. */
export function CrosshairHud() {
  return (
    <div
      aria-hidden
      data-testid="crosshair"
      className="pointer-events-none fixed inset-0 z-10 flex items-center justify-center"
    >
      <span className="relative block h-5 w-5 opacity-80 mix-blend-difference">
        <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-white" />
        <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white" />
      </span>
    </div>
  );
}
