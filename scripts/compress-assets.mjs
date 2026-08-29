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
  // floors
  'public/assets/textures/floor/forrest_ground.glb',
  'public/assets/textures/floor/asphalt.glb',
  'public/assets/textures/floor/brown_floor_tiles.glb',

  // Walls
  'public/assets/textures/wall/castle_brick_broken.glb',
  'public/assets/textures/wall/broken_brick.glb',
  'public/assets/textures/wall/cliff_side.glb',

  // Animations
  'public/assets/characters/shared/base-animations.glb',

  // Civilians
  'public/assets/characters/civilians/remy.glb',
  'public/assets/characters/civilians/liza.glb',
  'public/assets/characters/civilians/james.glb',

  // Soldiers
  'public/assets/characters/soldiers/swat-1.glb',
  'public/assets/characters/soldiers/swat-2.glb',
  'public/assets/characters/soldiers/swat-3.glb',

  // Weapons
  'public/assets/weapons/pistol_a.glb',

  // Greenery
  'public/assets/greenery/celandine.glb',
  'public/assets/greenery/jacaranda.glb',
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
