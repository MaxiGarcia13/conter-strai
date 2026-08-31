import { test as base, expect } from '@playwright/test';
import { mockGlbCdnToLocal } from './mock-glb-cdn';

const test = base.extend({
  context: async ({ context }, runFixture) => {
    await mockGlbCdnToLocal(context);
    await runFixture(context);
  },
});

export { expect, test };
