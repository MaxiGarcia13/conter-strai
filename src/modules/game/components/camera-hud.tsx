import type { CameraMode } from '../types';
import { useCameraMode } from '../hooks/use-camera-mode';

const CAMERA_MODE_LABELS: Record<CameraMode, string> = {
  fps: 'First-person',
  ots: 'Over-the-shoulder',
  tps: 'Third-person',
};

/** DOM overlay showing the active camera mode; C cycles it. */
export function CameraHud() {
  const mode = useCameraMode();
  return (
    <div
      role="status"
      className="pointer-events-none fixed top-4 left-4 z-10 border border-surface-border bg-background-deep/80 px-3 py-1.5 font-mono text-xs tracking-widest text-foreground uppercase"
    >
      <span className="mr-2 text-accent">[C]</span>
      Camera:
      {' '}
      {CAMERA_MODE_LABELS[mode]}
    </div>
  );
}
