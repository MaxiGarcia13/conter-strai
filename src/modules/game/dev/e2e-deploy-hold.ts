export const E2E_DEPLOY_HOLD_RELEASE = 'e2e-deploy-hold-release';

declare global {
  interface Window {
    /** Playwright: keep the deploy loader up after assets finish loading. */
    __E2E_HOLD_DEPLOY_COMPLETE__?: boolean;
  }
}

export function isE2eDeployCompleteHeld(): boolean {
  return window.__E2E_HOLD_DEPLOY_COMPLETE__ === true;
}

export function releaseE2eDeployCompleteHold(): void {
  window.__E2E_HOLD_DEPLOY_COMPLETE__ = false;
  window.dispatchEvent(new Event(E2E_DEPLOY_HOLD_RELEASE));
}

export function canClearDeployLoader(
  hasStarted: boolean,
  active: boolean,
  progress: number,
): boolean {
  return hasStarted && !active && progress >= 100 && !isE2eDeployCompleteHeld();
}
