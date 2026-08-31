import { useTouchLook } from '@/modules/game/input/hooks/use-touch-look';

export function LookZone() {
  const { onTouchStart, onTouchMove, onTouchEnd, onTouchCancel } = useTouchLook();

  return (
    <div
      className="pointer-events-auto fixed left-[40%] top-0 right-0 bottom-0 z-10 touch-none"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchCancel}
    />
  );
}
