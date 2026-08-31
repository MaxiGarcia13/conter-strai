import type { ReactNode } from 'react';
import { useCallback, useRef, useState } from 'react';

interface ActionButtonProps {
  label: string;
  icon: ReactNode;
  mode: 'fire' | 'kneel' | 'sprint';
  onAction: () => void;
  onHoldStart?: () => void;
  onHoldEnd?: () => void;
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

const SIZE_CLASSES = {
  small: 'size-10',
  medium: 'size-14',
  large: 'size-18',
};

export function ActionButton({
  label,
  icon,
  mode,
  onAction,
  onHoldStart,
  onHoldEnd,
  className = '',
  size = 'medium',
}: ActionButtonProps) {
  const [pressed, setPressed] = useState(false);
  const activeTouchIdRef = useRef<number | null>(null);

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      e.stopPropagation();
      activeTouchIdRef.current = e.changedTouches[0].identifier;

      if (mode === 'fire' || mode === 'kneel') {
        onAction();
      } else {
        setPressed(true);
        onHoldStart?.();
      }
    },
    [mode, onAction, onHoldStart],
  );

  const resetButton = useCallback(() => {
    activeTouchIdRef.current = null;
    setPressed(false);
    onHoldEnd?.();
  }, [onHoldEnd]);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      e.stopPropagation();
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === activeTouchIdRef.current) {
          resetButton();
          break;
        }
      }
    },
    [resetButton],
  );

  return (
    <div
      role="button"
      aria-label={label}
      className={`pointer-events-auto flex ${SIZE_CLASSES[size]} touch-none items-center justify-center rounded-full border border-surface-border select-none ${
        pressed ? 'bg-accent/70 text-background-deep' : 'bg-background-deep/50 text-foreground'
      } ${className}`}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchEnd}
    >
      {icon}
    </div>
  );
}
