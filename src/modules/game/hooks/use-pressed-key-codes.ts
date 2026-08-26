import type { RefObject } from 'react';
import { useEffect, useRef } from 'react';

interface UsePressedKeyCodesOptions {
  /** When false, listeners detach and the set clears. Default true. */
  enabled?: boolean;
}

/** Tracks currently held keyboard `event.code` values on window. */
export function usePressedKeyCodes(
  options: UsePressedKeyCodesOptions = {},
): RefObject<Set<string>> {
  const { enabled = true } = options;
  const pressedCodesRef = useRef(new Set<string>());

  useEffect(() => {
    if (!enabled) {
      pressedCodesRef.current.clear();
      return;
    }

    const pressed = pressedCodesRef.current;

    const onKeyDown = (event: KeyboardEvent) => {
      pressed.add(event.code);
    };
    const onKeyUp = (event: KeyboardEvent) => {
      pressed.delete(event.code);
    };
    const onBlur = () => {
      pressed.clear();
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
      pressed.clear();
    };
  }, [enabled]);

  return pressedCodesRef;
}
