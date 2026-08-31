import { useCallback, useRef } from 'react';
import { IconMenu } from '@/components/icons';
import { useGamePauseStore } from '@/modules/game/stores/game-pause-store';

export function PauseButton() {
  const setPaused = useGamePauseStore((s) => s.setPaused);
  const activeTouchIdRef = useRef<number | null>(null);

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      e.stopPropagation();
      activeTouchIdRef.current = e.changedTouches[0].identifier;
      setPaused(true);
    },
    [setPaused],
  );

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
      role="button"
      aria-label="Pause menu"
      className="pointer-events-auto fixed top-4 left-4 z-10 flex size-12 touch-none items-center justify-center rounded-full border border-surface-border bg-background-deep/50 text-foreground select-none"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchEnd}
    >
      <IconMenu className="size-6" />
    </div>
  );
}
