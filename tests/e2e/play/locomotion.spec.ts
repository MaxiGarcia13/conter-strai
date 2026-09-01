import type { BrowserContext, Page } from '@playwright/test';
import type { SoldierSkinId } from '@/modules/soldiers/types';
import type { Team } from '@/modules/teams/types';
import { expect, test } from '../fixtures/fixtures';
import {
  expectLocomotionClip,
  MOVE_CODES,
  navigateToRoomPlay,
  readPlayTest,
  waitForPlayTest,
} from '../utils/test-helpers';

const characters: [SoldierSkinId, Team][] = [
  ['swat-1', 'soldier'],
  ['remy', 'civilian'],
] as const;

for (const character of characters) {
  const [skin, team] = character;

  test.describe.serial(`room play as ${skin} ${team}`, () => {
    let context: BrowserContext;
    let page: Page;

    test.beforeAll(async ({ browser }) => {
      context = await browser.newContext();
      page = await context.newPage();
      await navigateToRoomPlay(page, { team, skin });
      await waitForPlayTest(page);
    });

    test.afterAll(async () => {
      await context?.close();
    });

    test('idle', async () => {
      expect((await readPlayTest(page))?.skinId).toBe(skin);
      await expectLocomotionClip(page, 'idle');
    });

    test('walk', async () => {
      const moveCodes = [MOVE_CODES.forward, MOVE_CODES.left, MOVE_CODES.right];
      for (const moveCode of moveCodes) {
        await page.keyboard.down(moveCode);
        await expectLocomotionClip(page, 'walk');

        await page.keyboard.up(moveCode);
        await expectLocomotionClip(page, 'idle');
      }
    });

    test('walkBackward', async () => {
      await page.keyboard.down(MOVE_CODES.back);
      await expectLocomotionClip(page, 'walkBackward');
      await page.keyboard.up(MOVE_CODES.back);
      await expectLocomotionClip(page, 'idle');
    });

    test('kneel', async () => {
      await page.keyboard.press(MOVE_CODES.kneelToggle);
      await expectLocomotionClip(page, 'kneel');
      await page.keyboard.press(MOVE_CODES.kneelToggle);
      await expectLocomotionClip(page, 'idle');
    });

    test('crouchWalking', async () => {
      await page.keyboard.press(MOVE_CODES.kneelToggle);
      await expectLocomotionClip(page, 'kneel');

      await page.keyboard.down(MOVE_CODES.forward);
      await expectLocomotionClip(page, 'crouchWalking');
      await page.keyboard.up(MOVE_CODES.forward);
      await expectLocomotionClip(page, 'kneel');

      await page.keyboard.press(MOVE_CODES.kneelToggle);
      await expectLocomotionClip(page, 'idle');
    });

    test.skip('jumpIdle', async () => {
      await page.keyboard.press(MOVE_CODES.jump);
      await expectLocomotionClip(page, 'jumpIdle');
      await page.keyboard.up(MOVE_CODES.jump);
      await expectLocomotionClip(page, 'idle');
    });

    test.skip('jump', async () => {
      await page.keyboard.down(MOVE_CODES.forward);
      await page.keyboard.press(MOVE_CODES.jump);
      await expectLocomotionClip(page, 'jump');
      await page.keyboard.up(MOVE_CODES.forward);
      await expectLocomotionClip(page, 'idle');
    });

    test('run', async () => {
      await page.keyboard.down(MOVE_CODES.forward);
      await page.keyboard.down(MOVE_CODES.runModifier);
      await expectLocomotionClip(page, 'run');
      await page.keyboard.up(MOVE_CODES.runModifier);
      await page.keyboard.up(MOVE_CODES.forward);
      await expectLocomotionClip(page, 'idle');
    });
  });
}
