import type { Page } from '@playwright/test';
import type { SoldierSkinId } from '@/modules/soldiers';
import type { Team } from '@/modules/teams';
import { expect } from '@playwright/test';
import { GAME_BINDINGS, MOVE_CODES } from '@/modules/game/constants/game-bindings';
import { createMatchRoomViaApi } from './lobby-helpers';

export { GAME_BINDINGS, MOVE_CODES };

export interface PlayTestSnapshot {
  soldierCount: number;
  mixerReady: boolean;
  activeClip: string;
  skinId?: string;
}

export async function readPlayTest(page: Page): Promise<PlayTestSnapshot | undefined> {
  return page.evaluate(() => window.__PLAY_TEST__);
}

export async function readRoomSessionSkin(page: Page, roomId: string): Promise<SoldierSkinId | undefined> {
  return page.evaluate((id) => {
    const raw = sessionStorage.getItem(`cs:room:${id}`);
    if (!raw) {
      return undefined;
    }
    const session = JSON.parse(raw) as { skin?: SoldierSkinId };
    return session.skin;
  }, roomId);
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

/** Canvas up and deploy loader cleared — no R3F probe required. */
export async function waitForPlayReady(page: Page): Promise<void> {
  await waitForCanvas(page);
  await expect(page.locator('[data-testid="play-loader"]')).toBeHidden({ timeout: 30_000 });
}

/**
 * Hard-nav from the waiting room to `/play` without abandoning the lobby seat.
 * Sets the same handoff flag as `navigateToPlay` and waits until match join
 * finished so `reconnectionToken` is persisted before leaving.
 */
export async function navigateToPlayFromWaitingRoom(page: Page, roomId: string): Promise<void> {
  await expect(page.getByRole('button', { name: 'Start Match' })).toBeEnabled({ timeout: 15_000 });
  await navigateToPlayWithHandoff(page, roomId);
}

/** Hard-nav to `/play` with the lobby handoff flag (host or guest). */
export async function navigateToPlayWithHandoff(page: Page, roomId: string): Promise<void> {
  await markPlayHandoff(page, roomId);
  await page.goto(`/room/${roomId}/play`);
}

/** Set the play handoff flag while the waiting-room page is stable (before any nav). */
export async function markPlayHandoff(page: Page, roomId: string): Promise<void> {
  await page.evaluate((id) => {
    sessionStorage.setItem(`cs:room:${id}:handoff`, '1');
  }, roomId);
}

/**
 * Move a guest from the waiting room to `/play` after the host starts the match.
 * Call `markPlayHandoff` on the guest before the host clicks Start Match so a
 * fallback `goto` never needs `evaluate` during an in-flight navigation (CI flake).
 */
export async function ensureGuestReachedPlay(
  page: Page,
  roomId: string,
  options: { handoffPreMarked?: boolean } = {},
): Promise<void> {
  const playUrl = new RegExp(`/room/${roomId}/play$`);

  if (!options.handoffPreMarked) {
    await markPlayHandoff(page, roomId);
  }

  await page.bringToFront();

  try {
    await expect(page).toHaveURL(playUrl, { timeout: 5_000 });
  } catch {
    if (!playUrl.test(page.url())) {
      // Handoff already set — hard-nav without evaluate (avoids destroyed-context races).
      await page.goto(`/room/${roomId}/play`);
    }
    await expect(page).toHaveURL(playUrl, { timeout: 30_000 });
  }
}

/** Locomotion / mixer smoke — requires the DEV play-test probe. */
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

const pauseDialog = (page: Page) => page.getByRole('dialog', { name: 'Game paused' });

async function waitThroughCountdown(page: Page): Promise<void> {
  await waitForPlayReady(page);

  const banner = countdownBanner(page);
  try {
    await expect(banner).toBeVisible({ timeout: 30_000 });
    await expect(banner).toBeHidden({ timeout: 15_000 });
  } catch {
    // Countdown may have finished during deploy — fall through to the live probe.
  }
}

async function probeLiveRound(page: Page): Promise<void> {
  await page.locator('canvas').click({ position: { x: 400, y: 300 }, force: true });
  await page.keyboard.press(GAME_BINDINGS.pause.code);
  await expect(pauseDialog(page)).toBeVisible({ timeout: 15_000 });
}

/** Poll until Esc opens the pause panel, then resume so the caller starts unpaused. */
export async function waitForLiveRound(page: Page): Promise<void> {
  await waitThroughCountdown(page);
  await probeLiveRound(page);

  await page.getByRole('button', { name: 'Resume' }).click();
  await expect(pauseDialog(page)).toBeHidden();
}

/** `/play` through deploy + countdown — no pause probe (for round-end flows). */
export async function waitForPlayThroughCountdown(page: Page): Promise<void> {
  await waitThroughCountdown(page);
}

/** Wait for the 3–2–1 overlay to clear so the server round is `in_progress`. */
export async function waitForCountdownToFinish(page: Page): Promise<void> {
  await waitThroughCountdown(page);
}

/** Host-only play-test API — ends the live round and waits for the round-end banner. */
export async function forceRoundEnd(page: Page, winner: Team = 'civilian'): Promise<void> {
  await expect
    .poll(async () => page.evaluate(() => typeof window.__PLAY_TEST_API__?.endRound === 'function'))
    .toBe(true);

  await expect
    .poll(async () => {
      await page.evaluate((w) => {
        window.__PLAY_TEST_API__?.endRound?.(w);
      }, winner);
      return page.getByRole('alert', { name: /win the round/i }).isVisible();
    }, { timeout: 30_000, intervals: [500, 1_000] })
    .toBe(true);
}

export function expectNoConsoleErrors(consoleErrors: string[]): void {
  expect(consoleErrors.filter((error) => /PropertyBinding/i.test(error))).toEqual([]);
  expect(consoleErrors).toEqual([]);
}

export async function expectLocomotionClip(page: Page, clip: string): Promise<void> {
  await expect.poll(async () => (await readPlayTest(page))?.activeClip).toBe(clip);
}
