import { useEffect } from 'react';

/** Run `callback` when the page is restored from the back-forward cache. */
export function useBfcacheRestore(callback: () => void): void {
  useEffect(() => {
    function onPageshow(event: PageTransitionEvent) {
      if (event.persisted) {
        callback();
      }
    }
    window.addEventListener('pageshow', onPageshow);
    return () => {
      window.removeEventListener('pageshow', onPageshow);
    };
  }, [callback]);
}
