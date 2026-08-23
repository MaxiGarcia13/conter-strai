/**
 * Extracts PBR map images from texture GLBs into public/assets/textures/maps/<id>/.
 * Run after compress-assets.mjs: node scripts/extract-texture-maps.mjs
 */
import { Buffer } from 'node:buffer';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { NodeIO } from '@gltf-transform/core';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

const TEXTURES = [
  { id: 'forrest_ground', glb: 'public/assets/textures/floor/forrest_ground.glb' },
  { id: 'cobblestone_embedded_asphalt', glb: 'public/assets/textures/floor/cobblestone_embedded_asphalt.glb' },
  { id: 'brown_floor_tiles', glb: 'public/assets/textures/floor/brown_floor_tiles.glb' },
  { id: 'coral_fort_wall', glb: 'public/assets/textures/wall/coral_fort_wall.glb' },
  { id: 'damaged_plaster', glb: 'public/assets/textures/wall/damaged_plaster.glb' },
  { id: 'cliff_side', glb: 'public/assets/textures/wall/cliff_side.glb' },
];

function mapSlot(name = '') {
  const lower = name.toLowerCase();
  if (lower.includes('nor') || lower.includes('normal')) {
    return 'normal';
  }
  if (lower.includes('rough')) {
    return 'roughness';
  }
  if (lower.includes('ao') || lower.includes('occlusion')) {
    return 'ao';
  }
  if (lower.includes('diff') || lower.includes('albedo') || lower.includes('base')) {
    return 'color';
  }
  return 'color';
}

function extensionForMime(mime) {
  if (mime === 'image/jpeg') {
    return 'jpg';
  }
  if (mime === 'image/png') {
    return 'png';
  }
  if (mime === 'image/webp') {
    return 'webp';
  }
  return 'bin';
}

const io = new NodeIO();

for (const { id, glb } of TEXTURES) {
  const input = path.join(ROOT, glb);
  const outDir = path.join(ROOT, 'public/assets/textures/maps', id);
  fs.mkdirSync(outDir, { recursive: true });

  const doc = await io.read(input);
  const manifest = {};
  const usedSlots = new Set();

  for (const texture of doc.getRoot().listTextures()) {
    const image = texture.getImage();
    const mime = texture.getMimeType() ?? 'image/jpeg';
    if (!image) {
      continue;
    }

    let slot = mapSlot(texture.getName());
    if (usedSlots.has(slot)) {
      slot = `${slot}_${usedSlots.size}`;
    }
    usedSlots.add(slot);

    const ext = extensionForMime(mime);
    const filename = `${slot}.${ext}`;
    const outPath = path.join(outDir, filename);
    fs.writeFileSync(outPath, Buffer.from(image));
    manifest[slot] = `/assets/textures/maps/${id}/${filename}`;
    console.log(`${id}: ${texture.getName() ?? 'unnamed'} → ${filename}`);
  }

  fs.writeFileSync(path.join(outDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
}

console.log('Done.');
