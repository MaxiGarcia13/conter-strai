import type { SoldierSkinId } from '@/modules/soldiers/types';
import type { Team } from '@/modules/teams/types';
import { expect, test } from '@playwright/test';
import {
  MOVE_CODES,
  navigateToRoomPlay,
  readPlayTest,
  waitForCanvas,
  waitForPlayTest,
} from './test-helpers';

const characters: [SoldierSkinId, Team][] = [
  ['swat-1', 'soldier'],
  // ['remy', 'civilian'],
] as const;

for (const character of characters) {
  const [skin, team] = character;

  test.describe(`room play as ${skin} ${team}`, () => {
    test.beforeEach(async ({ page }) => {
      await navigateToRoomPlay(page, { team, skin });
      await waitForCanvas(page);
      await waitForPlayTest(page);
    });

    test('idle', async ({ page }) => {
      expect((await readPlayTest(page))?.skinId).toBe(skin);
      expect((await readPlayTest(page))?.activeClip).toBe('idle');
    });

    test('walk', async ({ page }) => {
      const moveCodes = [MOVE_CODES.forward, MOVE_CODES.left, MOVE_CODES.right];
      for (const moveCode of moveCodes) {
        await page.keyboard.down(moveCode);
        expect((await readPlayTest(page))?.activeClip).toBe('walk');

        await page.keyboard.up(moveCode);
        expect((await readPlayTest(page))?.activeClip).toBe('idle');
      }
    });

    test('walkBackward', async ({ page }) => {
      await page.keyboard.down(MOVE_CODES.back);
      expect((await readPlayTest(page))?.activeClip).toBe('walkBackward');
      await page.keyboard.up(MOVE_CODES.back);
      expect((await readPlayTest(page))?.activeClip).toBe('idle');
    });

    test('kneel', async ({ page }) => {
      await page.keyboard.press(MOVE_CODES.kneelToggle);
      expect((await readPlayTest(page))?.activeClip).toBe('kneel');
    });

    test('crouchWalking', async ({ page }) => {
      await page.keyboard.press(MOVE_CODES.kneelToggle);
      expect((await readPlayTest(page))?.activeClip).toBe('kneel');

      await page.keyboard.down(MOVE_CODES.forward);
      expect((await readPlayTest(page))?.activeClip).toBe('crouchWalking');
      await page.keyboard.up(MOVE_CODES.forward);
      await page.waitForTimeout(1000);
      expect((await readPlayTest(page))?.activeClip).toBe('kneel');
    });

    // TODO: Fix jump clip issue in the e2e tests
    test.skip('jumpIdle', async ({ page }) => {
      await page.keyboard.press(MOVE_CODES.jump);
      expect((await readPlayTest(page))?.activeClip).toBe('jumpIdle');
      await page.keyboard.up(MOVE_CODES.jump);

      await page.waitForTimeout(2000);
      expect((await readPlayTest(page))?.activeClip).toBe('idle');
    });

    // TODO: Fix jump clip issue in the e2e tests
    test.skip('jump', async ({ page }) => {
      await page.keyboard.down(MOVE_CODES.forward);
      await page.keyboard.press(MOVE_CODES.jump);
      await page.waitForTimeout(500);
      expect((await readPlayTest(page))?.activeClip).toBe('jump');
      await page.keyboard.up(MOVE_CODES.forward);
      await page.waitForTimeout(2000);
      expect((await readPlayTest(page))?.activeClip).toBe('idle');
    });

    test('run', async ({ page }) => {
      await page.keyboard.down(MOVE_CODES.forward);
      await page.keyboard.down(MOVE_CODES.runModifier);
      expect((await readPlayTest(page))?.activeClip).toBe('run');
      await page.keyboard.up(MOVE_CODES.runModifier);
      await page.keyboard.up(MOVE_CODES.forward);
      expect((await readPlayTest(page))?.activeClip).toBe('idle');
    });
  });
}
