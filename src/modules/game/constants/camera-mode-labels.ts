import type { CameraMode } from '../types';

/** Human-readable labels for each {@link CameraMode} — shared by HUD overlay and pause panel. */
export const CAMERA_MODE_LABELS: Record<CameraMode, string> = {
  fps: 'First-person',
  ots: 'Over-the-shoulder',
  tps: 'Third-person',
};
