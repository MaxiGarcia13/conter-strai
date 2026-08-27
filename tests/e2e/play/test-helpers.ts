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

export async function waitForPlayTest(page: Page): Promise<PlayTestSnapshot> {
  await expect
    .poll(async () => (await readPlayTest(page))?.mixerReady, { timeout: 30_000 })
    .toBe(true);
  const snapshot = await readPlayTest(page);
  expect(snapshot).toBeDefined();
  return snapshot as PlayTestSnapshot;
}

export function expectNoConsoleErrors(consoleErrors: string[]): void {
  expect(consoleErrors.filter((error) => /PropertyBinding/i.test(error))).toEqual([]);
  expect(consoleErrors).toEqual([]);
}
