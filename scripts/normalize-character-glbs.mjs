/**
 * Normalizes Mixamo character GLBs for the shared animation / PBR contract:
 * 1. Rewrite numbered bone prefixes (`mixamorig9:` / `mixamorig6:`) → `mixamorig:`
 * 2. Drop glossiness maps miswired as metallicRoughness; set cloth-like roughness
 * 3. Force body materials off full BLEND (hair / lashes stay BLEND)
 *
 * Run after re-export or `assets:compress`:
 *   npm run assets:normalize-characters
 *   node scripts/normalize-character-glbs.mjs [optional relative glb paths…]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import draco3d from 'draco3dgltf';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

/** Cloth-like roughness matching `swat-1` (no miswired Mixamo glossiness-as-MR). */
const TARGET_ROUGHNESS = 0.75;

const DEFAULT_TARGETS = [
  'public/assets/characters/civilians/remy.glb',
  'public/assets/characters/civilians/liza.glb',
  'public/assets/characters/civilians/james.glb',
  'public/assets/characters/soldiers/swat-1.glb',
  'public/assets/characters/soldiers/swat-2.glb',
  'public/assets/characters/soldiers/swat-3.glb',
];

const NUMBERED_MIXAMO_PREFIX = /^mixamorig\d+:/;

function resolveTargets(argv) {
  const args = argv.slice(2);
  return args.length > 0 ? args : DEFAULT_TARGETS;
}

/**
 * @param {import('@gltf-transform/core').Document} doc
 * @returns {{ renamedBones: number, clearedMr: number, forcedOpaque: number }}
 */
function normalizeCharacterDocument(doc) {
  let renamedBones = 0;
  let clearedMr = 0;
  let forcedOpaque = 0;

  for (const node of doc.getRoot().listNodes()) {
    const name = node.getName();
    if (NUMBERED_MIXAMO_PREFIX.test(name)) {
      node.setName(name.replace(NUMBERED_MIXAMO_PREFIX, 'mixamorig:'));
      renamedBones++;
    }
  }

  for (const mat of doc.getRoot().listMaterials()) {
    const mr = mat.getMetallicRoughnessTexture();
    const mrName = mr?.getName() ?? '';
    if (mr && /glossiness/i.test(mrName)) {
      mat.setMetallicRoughnessTexture(null);
      mat.setRoughnessFactor(TARGET_ROUGHNESS);
      mat.setMetallicFactor(0);
      clearedMr++;
    }

    const matName = mat.getName() ?? '';
    if (
      mat.getAlphaMode() === 'BLEND'
      && /body/i.test(matName)
      && !/hair|lash|eye/i.test(matName)
    ) {
      mat.setAlphaMode('OPAQUE');
      forcedOpaque++;
    }
  }

  return { renamedBones, clearedMr, forcedOpaque };
}

const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({
    'draco3d.decoder': await draco3d.createDecoderModule(),
    'draco3d.encoder': await draco3d.createEncoderModule(),
  });

const targets = resolveTargets(process.argv);
let changed = 0;

for (const relativePath of targets) {
  const input = path.isAbsolute(relativePath)
    ? relativePath
    : path.join(ROOT, relativePath);
  const label = path.relative(ROOT, input);

  if (!fs.existsSync(input)) {
    console.warn(`skip (missing): ${label}`);
    continue;
  }

  const doc = await io.read(input);
  const { renamedBones, clearedMr, forcedOpaque } = normalizeCharacterDocument(doc);

  if (renamedBones === 0 && clearedMr === 0 && forcedOpaque === 0) {
    console.log(`${label}: already ok`);
    continue;
  }

  await io.write(input, doc);
  changed++;
  console.log(
    `${label}: bones ${renamedBones}, cleared glossiness-MR ${clearedMr}, body→OPAQUE ${forcedOpaque}`,
  );
}

console.log(`done (${changed} updated)`);
