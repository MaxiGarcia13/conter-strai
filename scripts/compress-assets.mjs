/**
 * Downscales embedded GLB textures to 1K and writes optimized copies in place.
 * Jacaranda: keep a single LOD, simplify geometry, WebP 1K textures.
 * Barrier: keep LOD1, strip other LODs, WebP 1K textures.
 * Run: node scripts/compress-assets.mjs
 *      node scripts/compress-assets.mjs public/assets/greenery/jacaranda.glb
 *      node scripts/compress-assets.mjs public/assets/Infrastructure/concrete_road_barrier.glb
 *      node scripts/compress-assets.mjs public/assets/Infrastructure/covered_car.glb
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import {
  dedup,
  prune,
  quantize,
  simplify,
  textureCompress,
  weld,
} from '@gltf-transform/functions';
import draco3d from 'draco3dgltf';
import { MeshoptSimplifier } from 'meshoptimizer';
import sharp from 'sharp';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const TEXTURE_SIZE = 1024;
const JACARANDA_REL = 'public/assets/greenery/jacaranda.glb';
const JACARANDA_KEEP_NODE = 'jacaranda_tree_LOD1';
const BARRIER_REL = 'public/assets/Infrastructure/concrete_road_barrier.glb';
const BARRIER_KEEP_NODE = 'concrete_road_barrier_LOD1';
const COVERED_CAR_REL = 'public/assets/Infrastructure/covered_car.glb';
/** Skip geometry work when the packed LODs are already stripped. */
const JACARANDA_SIMPLIFY_MIN_VERTS = 200_000;
/** Unconstrained error so the ratio is actually reached on dense foliage. */
const JACARANDA_SIMPLIFY_RATIO = 0.03;

const RESIZE_TARGETS = [
  'public/assets/textures/floor/forrest_ground.glb',
  'public/assets/textures/floor/asphalt.glb',
  'public/assets/textures/floor/brown_floor_tiles.glb',
  'public/assets/textures/wall/castle_brick_broken.glb',
  'public/assets/textures/wall/broken_brick.glb',
  'public/assets/textures/wall/cliff_side.glb',
  'public/assets/characters/shared/base-animations.glb',
  'public/assets/characters/civilians/remy.glb',
  'public/assets/characters/civilians/liza.glb',
  'public/assets/characters/civilians/james.glb',
  'public/assets/characters/soldiers/swat-1.glb',
  'public/assets/characters/soldiers/swat-2.glb',
  'public/assets/characters/soldiers/swat-3.glb',
  'public/assets/weapons/pistol_a.glb',
];

function formatMb(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function meshVertexCount(mesh) {
  return mesh.listPrimitives().reduce((count, prim) => {
    return count + (prim.getAttribute('POSITION')?.getCount() ?? 0);
  }, 0);
}

async function createIo() {
  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
  io.registerDependencies({
    'draco3d.decoder': await draco3d.createDecoderModule(),
    'draco3d.encoder': await draco3d.createEncoderModule(),
  });
  return io;
}

function keepSingleSceneLod(document, keepNodeName, assetLabel) {
  const scene = document.getRoot().listScenes()[0];
  if (!scene) {
    throw new Error(`${assetLabel} has no scene`);
  }

  const keep = scene.listChildren().find((node) => node.getName() === keepNodeName);
  if (!keep) {
    throw new Error(`missing node ${keepNodeName}`);
  }

  for (const node of [...scene.listChildren()]) {
    if (node !== keep) {
      node.dispose();
    }
  }
}

function keepJacarandaLod(document) {
  keepSingleSceneLod(document, JACARANDA_KEEP_NODE, JACARANDA_REL);
}

function resizeTextureGlb(relativePath) {
  const input = path.join(ROOT, relativePath);
  if (!fs.existsSync(input)) {
    console.warn(`skip (missing): ${relativePath}`);
    return;
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

async function optimizeJacaranda() {
  const input = path.join(ROOT, JACARANDA_REL);
  if (!fs.existsSync(input)) {
    console.warn(`skip (missing): ${JACARANDA_REL}`);
    return;
  }

  const before = fs.statSync(input).size;
  const io = await createIo();
  const document = await io.read(input);
  const keepNode = document
    .getRoot()
    .listNodes()
    .find((node) => node.getName() === JACARANDA_KEEP_NODE);
  const keepVerts = keepNode?.getMesh() ? meshVertexCount(keepNode.getMesh()) : 0;
  const packedLods = document
    .getRoot()
    .listNodes()
    .some((node) => node.getName() === 'jacaranda_tree_LOD0');

  if (packedLods) {
    keepJacarandaLod(document);
  } else if (keepVerts < JACARANDA_SIMPLIFY_MIN_VERTS) {
    console.log(`${JACARANDA_REL}: already stripped (${keepVerts} verts), skip geometry`);
    return;
  }

  await MeshoptSimplifier.ready;
  await document.transform(
    prune(),
    dedup(),
    weld(),
    simplify({
      simplifier: MeshoptSimplifier,
      ratio: JACARANDA_SIMPLIFY_RATIO,
      error: 1,
    }),
    textureCompress({
      encoder: sharp,
      targetFormat: 'webp',
      resize: [TEXTURE_SIZE, TEXTURE_SIZE],
      quality: 80,
    }),
    quantize(),
    prune(),
  );

  const temp = `${input}.tmp.glb`;
  await io.write(temp, document);
  fs.renameSync(temp, input);

  const afterMesh = document.getRoot().listMeshes()[0];
  const afterVerts = afterMesh ? meshVertexCount(afterMesh) : 0;
  const after = fs.statSync(input).size;
  console.log(
    `${JACARANDA_REL}: ${formatMb(before)} → ${formatMb(after)} (${keepVerts} → ${afterVerts} verts)`,
  );
}

async function optimizeTexturePropGlb(relativePath, { stripLod } = {}) {
  const input = path.join(ROOT, relativePath);
  if (!fs.existsSync(input)) {
    console.warn(`skip (missing): ${relativePath}`);
    return;
  }

  const before = fs.statSync(input).size;
  const io = await createIo();
  const document = await io.read(input);
  let keepVerts = 0;

  if (stripLod) {
    const keepNode = document
      .getRoot()
      .listNodes()
      .find((node) => node.getName() === stripLod.keepNode);
    keepVerts = keepNode?.getMesh() ? meshVertexCount(keepNode.getMesh()) : 0;
    const packedLods = document
      .getRoot()
      .listNodes()
      .some((node) => node.getName() === stripLod.packedLod0Node);

    if (packedLods) {
      keepSingleSceneLod(document, stripLod.keepNode, relativePath);
    } else if (keepVerts > 0) {
      console.log(`${relativePath}: already stripped (${keepVerts} verts), skip LOD strip`);
      return;
    } else {
      throw new Error(`missing node ${stripLod.keepNode}`);
    }
  } else {
    for (const mesh of document.getRoot().listMeshes()) {
      keepVerts += meshVertexCount(mesh);
    }
  }

  await document.transform(
    prune(),
    dedup(),
    weld(),
    textureCompress({
      encoder: sharp,
      targetFormat: 'webp',
      resize: [TEXTURE_SIZE, TEXTURE_SIZE],
      quality: 80,
    }),
    quantize(),
    prune(),
  );

  const temp = `${input}.tmp.glb`;
  await io.write(temp, document);
  fs.renameSync(temp, input);

  const afterVerts = document.getRoot().listMeshes().reduce((count, mesh) => {
    return count + meshVertexCount(mesh);
  }, 0);
  const after = fs.statSync(input).size;
  console.log(
    `${relativePath}: ${formatMb(before)} → ${formatMb(after)} (${keepVerts} → ${afterVerts} verts)`,
  );
}

async function optimizeBarrier() {
  await optimizeTexturePropGlb(BARRIER_REL, {
    stripLod: {
      packedLod0Node: 'concrete_road_barrier_LOD0',
      keepNode: BARRIER_KEEP_NODE,
    },
  });
}

async function optimizeCoveredCar() {
  await optimizeTexturePropGlb(COVERED_CAR_REL);
}

async function main() {
  const args = process.argv.slice(2);
  const runAll = args.length === 0;
  const runJacaranda = runAll || args.some((arg) => arg.includes('jacaranda'));
  const runBarrier = runAll || args.some((arg) => arg.includes('concrete_road_barrier'));
  const runCoveredCar = runAll || args.some((arg) => arg.includes('covered_car'));
  const resizeTargets = runAll
    ? RESIZE_TARGETS
    : args.filter(
        (arg) =>
          !arg.includes('jacaranda')
          && !arg.includes('concrete_road_barrier')
          && !arg.includes('covered_car'),
      );

  for (const relativePath of resizeTargets) {
    resizeTextureGlb(relativePath);
  }

  if (runJacaranda) {
    await optimizeJacaranda();
  }

  if (runBarrier) {
    await optimizeBarrier();
  }

  if (runCoveredCar) {
    await optimizeCoveredCar();
  }
}

await main();
