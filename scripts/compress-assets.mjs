/**
 * Downscales embedded GLB textures to 1K and writes optimized copies in place.
 * Run: node scripts/compress-assets.mjs
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const TEXTURE_SIZE = 1024;

const TARGETS = [
  'public/assets/textures/floor/forrest_ground.glb',
  'public/assets/textures/floor/asphalt.glb',
  'public/assets/textures/floor/brown_floor_tiles.glb',
  'public/assets/textures/wall/castle_brick_broken.glb',
  'public/assets/textures/wall/broken_brick.glb',
  'public/assets/textures/wall/cliff_side.glb',
  'public/assets/soldiers/swat-soldier.glb',
];

function formatMb(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

for (const relativePath of TARGETS) {
  const input = path.join(ROOT, relativePath);
  if (!fs.existsSync(input)) {
    console.warn(`skip (missing): ${relativePath}`);
    continue;
  }

  const before = fs.statSync(input).size;
  const temp = `${input}.tmp.glb`;

  execFileSync(
    'npx',
    [
      '@gltf-transform/cli',
      'resize',
      input,
      temp,
      '--width',
      String(TEXTURE_SIZE),
      '--height',
      String(TEXTURE_SIZE),
    ],
    { cwd: ROOT, stdio: 'inherit' },
  );

  fs.renameSync(temp, input);
  const after = fs.statSync(input).size;
  console.log(`${relativePath}: ${formatMb(before)} → ${formatMb(after)}`);
}
