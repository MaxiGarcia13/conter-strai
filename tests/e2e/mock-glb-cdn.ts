import type { Browser, BrowserContext, Page } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { GLB_CDN_ORIGIN } from '@/modules/assets/glb-cdn-url';

const GLB_ROOT = path.join(process.cwd(), 'assets/glb');
const CDN_HOST = new URL(GLB_CDN_ORIGIN).host;

type RouteTarget = BrowserContext | Page;

/** Intercept workers.dev GLB fetches and serve repo source files from `assets/glb/`. */
export async function mockGlbCdnToLocal(target: RouteTarget): Promise<void> {
  await target.route(`**://${CDN_HOST}/**`, async (route) => {
    const url = new URL(route.request().url());
    const key = url.searchParams.get('q');

    if (!key || key.includes('..')) {
      await route.abort();
      return;
    }

    const filePath = path.join(GLB_ROOT, key);
    if (!fs.existsSync(filePath)) {
      await route.fulfill({ status: 404, body: `missing glb: ${key}` });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'model/gltf-binary',
      path: filePath,
    });
  });
}

/** Browser context with GLB CDN routing — use when tests call `browser.newContext()` manually. */
export async function createE2eContext(browser: Browser): Promise<BrowserContext> {
  const context = await browser.newContext();
  await mockGlbCdnToLocal(context);
  return context;
}
