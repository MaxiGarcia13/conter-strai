import { useEffect } from 'react';
import { E2E_DEPLOY_HOLD_RELEASE } from './e2e-deploy-hold';

/** Playwright: re-run loader clear when the deploy hold is released. */
export function useE2eDeployHoldRelease(onRelease: () => void): void {
  useEffect(() => {
    window.addEventListener(E2E_DEPLOY_HOLD_RELEASE, onRelease);
    return () => window.removeEventListener(E2E_DEPLOY_HOLD_RELEASE, onRelease);
  }, [onRelease]);
}
