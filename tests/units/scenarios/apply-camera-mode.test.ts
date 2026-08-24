import type { PlayerTransform } from '@/modules/game/state/player-state';
import { PerspectiveCamera } from 'three';

import { describe, expect, it } from 'vitest';
import { DEFAULT_BODY_ANCHOR_Y } from '@/modules/game/constants/player';
import { applyCameraMode } from '@/modules/game/utils/apply-camera-mode';

function makeTransform(partial: Partial<PlayerTransform> = {}): PlayerTransform {
  return { x: 0, z: 0, yaw: 0, pitch: 0, ...partial };
}

function place(mode: 'fps' | 'ots' | 'tps', transform: PlayerTransform, bodyAnchorY: number): PerspectiveCamera {
  const camera = new PerspectiveCamera();
  applyCameraMode(camera, mode, transform, bodyAnchorY);
  return camera;
}

describe('applyCameraMode', () => {
  it('pivots the OTS boom on the body anchor so kneeling lowers and jumping raises it', () => {
    const standing = place('ots', makeTransform(), 1.57).position.y;
    const kneel = place('ots', makeTransform(), 1.1).position.y;
    const jump = place('ots', makeTransform(), 2.5).position.y;

    expect(standing).toBeCloseTo(2.0, 3);
    expect(kneel).toBeCloseTo(standing - 0.47, 5);
    expect(jump).toBeCloseTo(standing + 0.93, 5);
  });

  it('carries TPS with the anchor as well', () => {
    const standing = place('tps', makeTransform(), 1.57).position.y;
    expect(standing).toBeCloseTo(2.2, 3);
    expect(place('tps', makeTransform(), 1.1).position.y).toBeCloseTo(standing - 0.47, 5);
  });

  it('keeps the pitch tilt: looking up pulls the boom down behind the soldier', () => {
    const level = place('ots', makeTransform(), 1.57).position.y;
    const lookingUp = place('ots', makeTransform({ pitch: Math.PI / 4 }), 1.57).position.y;
    const lookingDown = place('ots', makeTransform({ pitch: -Math.PI / 4 }), 1.57).position.y;

    expect(lookingUp).toBeLessThan(level);
    expect(lookingDown).toBeGreaterThan(level);
  });

  it('never drops below the floor clearance', () => {
    const camera = place('ots', makeTransform({ pitch: Math.PI / 2 - 0.01 }), 0.05);
    expect(camera.position.y).toBeGreaterThanOrEqual(0.25);
  });

  it('lands the FPS pre-mount fallback at eye height while the anchor is still at rest', () => {
    // Before LocalPlayer resolves, the anchor holds its default → PLAYER_EYE_HEIGHT - 0.08.
    const camera = place('fps', makeTransform(), DEFAULT_BODY_ANCHOR_Y);
    expect(camera.position.y).toBeCloseTo(1.7 - 0.08, 3);
  });
});
