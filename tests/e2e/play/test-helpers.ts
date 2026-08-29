import type { Page } from '@playwright/test';
import type { SoldierSkinId } from '@/modules/soldiers';
import type { Team } from '@/modules/teams';
import { expect } from '@playwright/test';
import { createMatchRoomViaApi } from '../lobby-helpers';

export interface PlayTestSnapshot {
  soldierCount: number;
  mixerReady: boolean;
  activeClip: string;
  skinId?: string;
}

export async function readPlayTest(page: Page): Promise<PlayTestSnapshot | undefined> {
  return page.evaluate(() => window.__PLAY_TEST__);
}

export function captureConsoleErrors(page: Page): string[] {
  const consoleErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text());
    }
  });
  page.on('pageerror', (error) => {
    consoleErrors.push(`pageerror: ${error.message}`);
  });
  return consoleErrors;
}

/** Room play boot: create a real match, claim a seat, then open `/play`. */
export async function navigateToRoomPlay(
  page: Page,
  options: { team: Team; skin: SoldierSkinId; scenario?: 'arena-01'; roomId?: string } = {
    team: 'civilian',
    skin: 'remy',
  },
): Promise<string> {
  const roomId = options.roomId ?? (await createMatchRoomViaApi(page.request));
  const scenario = options.scenario ?? 'arena-01';

  const claimResponse = await page.request.put(`/api/v1/room/${roomId}`, {
    data: { team: options.team, skin: options.skin },
  });
  expect(claimResponse.status()).toBe(200);
  const claimed = (await claimResponse.json()) as { reservation: Record<string, unknown> };

  await page.goto('/');
  await page.evaluate(
    ({ roomId: id, team, skin, scenario: scenarioId, reservation }) => {
      sessionStorage.setItem(
        `cs:room:${id}`,
        JSON.stringify({ team, skin, scenario: scenarioId, role: 'host', reservation }),
      );
    },
    { roomId, team: options.team, skin: options.skin, scenario, reservation: claimed.reservation },
  );
  await page.goto(`/room/${roomId}/play`);
  return roomId;
}

export async function waitForCanvas(page: Page): Promise<void> {
  await expect(page.locator('canvas')).toBeVisible();
}

/**
 * Hard-nav from the waiting room to `/play` without abandoning the lobby seat.
 * Sets the same handoff flag as `navigateToPlay` and waits until match join
 * finished so `reconnectionToken` is persisted before leaving.
 */
export async function navigateToPlayFromWaitingRoom(page: Page, roomId: string): Promise<void> {
  await expect(page.getByRole('button', { name: 'Start Match' })).toBeEnabled({ timeout: 15_000 });
  await page.evaluate((id) => {
    sessionStorage.setItem(`cs:room:${id}:handoff`, '1');
  }, roomId);
  await page.goto(`/room/${roomId}/play`);
}

export async function waitForPlayTest(page: Page): Promise<PlayTestSnapshot> {
  await expect
    .poll(async () => (await readPlayTest(page))?.mixerReady, { timeout: 30_000 })
    .toBe(true);
  const snapshot = await readPlayTest(page);
  expect(snapshot).toBeDefined();
  return snapshot as PlayTestSnapshot;
}

/** Create a room, join from the waiting room, and start the match on `/play`. */
export async function startMatchFromWaitingRoom(page: Page): Promise<string> {
  await page.goto('/room');
  await page.getByRole('button', { name: 'Create Room' }).click();
  await expect(page).toHaveURL(/\/room\/[^/]+$/);

  const roomId = new URL(page.url()).pathname.split('/').at(-1) ?? '';
  await expect(page.getByRole('button', { name: 'Start Match' })).toBeEnabled({ timeout: 15_000 });
  await page.getByRole('button', { name: 'Start Match' }).click();
  await expect(page).toHaveURL(new RegExp(`/room/${roomId}/play$`));
  return roomId;
}

export function deployingLoader(page: Page) {
  return page.locator('.play-loader').filter({ hasText: 'Deploying' });
}

export function countdownBanner(page: Page) {
  return page.getByRole('status', { name: /Starting in/i });
}

/** Playwright hook — assets may finish before the test observes the loader. */
export async function holdDeployComplete(page: Page): Promise<void> {
  await page.addInitScript(() => {
    window.__E2E_HOLD_DEPLOY_COMPLETE__ = true;
  });
}

export async function releaseDeployHold(page: Page): Promise<void> {
  await page.evaluate(() => {
    window.__E2E_HOLD_DEPLOY_COMPLETE__ = false;
    window.dispatchEvent(new Event('e2e-deploy-hold-release'));
  });
}

/** Host-only E2E hook — ends the live round and waits for the round-end banner. */
export async function forceRoundEnd(page: Page): Promise<void> {
  await expect
    .poll(async () => {
      const ready = await page.evaluate(() => typeof window.__PLAY_TEST_API__?.forceRoundEnd === 'function');
      if (!ready) {
        return false;
      }
      await page.evaluate(() => {
        window.__PLAY_TEST_API__?.forceRoundEnd?.('civilian');
      });
      return page.getByRole('alert', { name: /win the round/i }).isVisible();
    }, { timeout: 45_000, intervals: [500, 1_000] })
    .toBe(true);
}

export function expectNoConsoleErrors(consoleErrors: string[]): void {
  expect(consoleErrors.filter((error) => /PropertyBinding/i.test(error))).toEqual([]);
  expect(consoleErrors).toEqual([]);
}
