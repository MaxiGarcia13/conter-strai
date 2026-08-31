import { useCallback, useRef } from 'react';
import { applyLookDelta } from '@/modules/game/input/utils/apply-look-delta';

export function LookZone() {
  const activeTouchIdRef = useRef<number | null>(null);
  const prevPosRef = useRef({ x: 0, y: 0 });

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    e.stopPropagation();
    const touch = e.changedTouches[0];
    activeTouchIdRef.current = touch.identifier;
    prevPosRef.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    e.stopPropagation();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === activeTouchIdRef.current) {
        const deltaX = touch.clientX - prevPosRef.current.x;
        const deltaY = touch.clientY - prevPosRef.current.y;
        prevPosRef.current = { x: touch.clientX, y: touch.clientY };
        applyLookDelta(deltaX, deltaY);
        break;
      }
    }
  }, []);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    e.stopPropagation();
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === activeTouchIdRef.current) {
        activeTouchIdRef.current = null;
        break;
      }
    }
  }, []);

  return (
    <div
      className="pointer-events-auto fixed left-[40%] top-0 right-0 bottom-0 z-10 touch-none"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchEnd}
    />
  );
}
