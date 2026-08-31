import { useCallback, useRef, useState } from 'react';
import { setTouchMoveIntent } from '@/modules/game/input/player-input-intent';
import { joystickToAxes } from '@/modules/game/input/utils/joystick-to-axes';

const BASE_SIZE = 120;
const THUMB_SIZE = 48;
const RADIUS = (BASE_SIZE - THUMB_SIZE) / 2;

export function VirtualJoystick() {
  const [thumbOffset, setThumbOffset] = useState({ x: 0, y: 0 });
  const activeTouchIdRef = useRef<number | null>(null);
  const baseRef = useRef<HTMLDivElement>(null);

  const applyTouch = useCallback((touch: React.Touch) => {
    const base = baseRef.current;
    if (!base) {
      return;
    }
    const rect = base.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let dx = touch.clientX - centerX;
    let dy = touch.clientY - centerY;
    const dist = Math.hypot(dx, dy);
    if (dist > RADIUS) {
      dx = (dx / dist) * RADIUS;
      dy = (dy / dist) * RADIUS;
    }

    const normX = dx / RADIUS;
    const normY = dy / RADIUS;

    setThumbOffset({ x: normX, y: normY });

    const { strafe, forward } = joystickToAxes(normX, normY);
    setTouchMoveIntent(strafe, forward);
  }, []);

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      e.stopPropagation();
      activeTouchIdRef.current = e.changedTouches[0].identifier;
      applyTouch(e.changedTouches[0]);
    },
    [applyTouch],
  );

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      e.stopPropagation();
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === activeTouchIdRef.current) {
          applyTouch(touch);
          break;
        }
      }
    },
    [applyTouch],
  );

  const resetJoystick = useCallback(() => {
    activeTouchIdRef.current = null;
    setThumbOffset({ x: 0, y: 0 });
    setTouchMoveIntent(0, 0);
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      e.stopPropagation();
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === activeTouchIdRef.current) {
          resetJoystick();
          break;
        }
      }
    },
    [resetJoystick],
  );

  const thumbX = thumbOffset.x * RADIUS;
  const thumbY = thumbOffset.y * RADIUS;

  return (
    <div
      ref={baseRef}
      className="pointer-events-auto fixed bottom-6 left-6 z-10 touch-none rounded-full border border-surface-border bg-background-deep/40"
      style={{ width: BASE_SIZE, height: BASE_SIZE }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchEnd}
    >
      <div
        className="absolute rounded-full bg-accent/60"
        style={{
          width: THUMB_SIZE,
          height: THUMB_SIZE,
          left: '50%',
          top: '50%',
          transform: `translate(calc(-50% + ${thumbX}px), calc(-50% + ${thumbY}px))`,
        }}
      />
    </div>
  );
}
