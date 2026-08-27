/**
 * Bundle `src/server.ts` → `dist/server/custom-entry.mjs` after `astro build`.
 * Local app code is bundled; node_modules stay external (same Colyseus singleton
 * as Astro API routes).
 */
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';

const rootDir = fileURLToPath(new URL('..', import.meta.url));
const outfile = path.join(rootDir, 'dist/server/custom-entry.mjs');

await esbuild.build({
  absWorkingDir: rootDir,
  entryPoints: [path.join(rootDir, 'src/server.ts')],
  outfile,
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node20',
  packages: 'external',
  // Built Astro handler — sibling of custom-entry after `astro build`.
  external: ['./entry.mjs'],
  alias: {
    '@': path.join(rootDir, 'src'),
  },
  logLevel: 'info',
});

console.warn(`[build-server-entry] wrote ${path.relative(rootDir, outfile)}`);
process.exit(0);
