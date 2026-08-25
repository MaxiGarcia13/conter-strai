/* eslint-disable jsdoc/require-returns-description */
/**
 * Adjusts Mixamo hips translation keyframes so animated poses sit on Y=0.
 *
 * Mixamo rigs anchor hips above the floor in rest pose; crouch / death / kneel
 * clips keep positive Y offsets and make characters float unless corrected in
 * the asset. Locomotion clips that strip hips at runtime are unaffected.
 *
 * Usage:
 *   node scripts/snap-animation-floor.mjs <input.glb> <output.glb>
 *   node scripts/snap-animation-floor.mjs in.glb out.glb --clip dying --auto
 *   node scripts/snap-animation-floor.mjs in.glb out.glb --clip jump --auto --boost 1.15
 *   node scripts/snap-animation-floor.mjs in.glb out.glb \
 *     --clip dying --auto --clip kneel --auto --clip jump --y-offset 9.55
 *
 * With no --clip flags, every animation in the file is auto-snapped.
 */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import draco3d from 'draco3dgltf';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

const HIPS_NODE_PATTERN = /^(?:mixamorig:?)?Hips$/i;

/** @typedef {'auto' | 'manual'} SnapMode */

/**
 * @typedef {object} ClipSnapSettings
 * @property {SnapMode} mode - Auto floor snap or manual Y offset.
 * @property {number} [yOffset] - Manual delta applied to every hips Y keyframe.
 * @property {number} [boost] - Auto mode: scale arc height from floor anchor (default 1).
 */

/**
 * @param {string[]} argv
 * @returns {{ input: string, output: string, clipSettings: Map<string, ClipSnapSettings> }}
 */
function parseArgs(argv) {
  const positional = [];
  /** @type {Map<string, ClipSnapSettings>} */
  const clipSettings = new Map();
  /** @type {string | null} */
  let pendingClip = null;

  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--clip') {
      const name = argv[++i];
      if (!name) {
        throw new Error('Missing value for --clip');
      }
      pendingClip = name;
      if (!clipSettings.has(name)) {
        clipSettings.set(name, { mode: 'auto' });
      }
      continue;
    }
    if (arg === '--auto') {
      if (!pendingClip) {
        throw new Error('--auto must follow --clip <name>');
      }
      clipSettings.set(pendingClip, { mode: 'auto' });
      continue;
    }
    if (arg === '--y-offset') {
      if (!pendingClip) {
        throw new Error('--y-offset must follow --clip <name>');
      }
      const value = Number(argv[++i]);
      if (!Number.isFinite(value)) {
        throw new TypeError(`Invalid --y-offset: ${argv[i]}`);
      }
      clipSettings.set(pendingClip, { ...clipSettings.get(pendingClip), mode: 'manual', yOffset: value });
      continue;
    }
    if (arg === '--boost') {
      if (!pendingClip) {
        throw new Error('--boost must follow --clip <name>');
      }
      const value = Number(argv[++i]);
      if (!Number.isFinite(value) || value <= 0) {
        throw new TypeError(`Invalid --boost: ${argv[i]}`);
      }
      clipSettings.set(pendingClip, { ...clipSettings.get(pendingClip), boost: value });
      continue;
    }
    if (arg.startsWith('-')) {
      throw new Error(`Unknown option: ${arg}`);
    }
    positional.push(arg);
  }

  if (positional.length < 2) {
    throw new Error(
      'Usage: node scripts/snap-animation-floor.mjs <input.glb> <output.glb> [--clip <name> [--auto | --y-offset <n>]]…',
    );
  }

  const [input, output] = positional;
  return { input, output, clipSettings };
}

/**
 * @param {import('@gltf-transform/core').Animation} animation
 * @returns {import('@gltf-transform/core').Accessor | null}
 */
function findHipsTranslationOutput(animation) {
  for (const channel of animation.listChannels()) {
    if (channel.getTargetPath() !== 'translation') {
      continue;
    }
    const node = channel.getTargetNode();
    const nodeName = node?.getName() ?? '';
    if (!HIPS_NODE_PATTERN.test(nodeName)) {
      continue;
    }
    const sampler = channel.getSampler();
    const output = sampler?.getOutput();
    if (!output) {
      continue;
    }
    if (output.getType() !== 'VEC3') {
      throw new Error(
        `${animation.getName()}: hips translation accessor must be VEC3 (got ${output.getType()})`,
      );
    }
    return output;
  }
  return null;
}

/**
 * @param {Float32Array | Int32Array | Uint32Array | Uint16Array | Uint8Array | Int8Array | Int16Array} array
 * @returns {number}
 */
function minTranslationY(array) {
  let minY = Infinity;
  for (let i = 1; i < array.length; i += 3) {
    minY = Math.min(minY, array[i]);
  }
  return minY;
}

function maxTranslationY(array) {
  let maxY = -Infinity;
  for (let i = 1; i < array.length; i += 3) {
    maxY = Math.max(maxY, array[i]);
  }
  return maxY;
}

/**
 * @param {import('@gltf-transform/core').Accessor} accessor
 * @param {ClipSnapSettings} settings
 */
function adjustHipsTranslationY(accessor, settings) {
  const source = accessor.getArray();
  if (!source || source.length % 3 !== 0) {
    throw new Error('Hips translation accessor length must be a multiple of 3');
  }

  const minYBefore = minTranslationY(source);
  const maxYBefore = maxTranslationY(source);
  const next = source.slice();

  if (settings.mode === 'manual') {
    const deltaY = settings.yOffset ?? 0;
    for (let i = 1; i < next.length; i += 3) {
      next[i] += deltaY;
    }
    accessor.setArray(next);
    return {
      keyCount: next.length / 3,
      minYBefore,
      maxYBefore,
      minYAfter: minTranslationY(next),
      maxYAfter: maxTranslationY(next),
      boost: 1,
    };
  }

  const boost = settings.boost ?? 1;
  for (let i = 1; i < next.length; i += 3) {
    next[i] = (next[i] - minYBefore) * boost;
  }
  accessor.setArray(next);

  return {
    keyCount: next.length / 3,
    minYBefore,
    maxYBefore,
    minYAfter: minTranslationY(next),
    maxYAfter: maxTranslationY(next),
    boost,
  };
}

/**
 * @param {import('@gltf-transform/core').Animation} animation
 * @param {ClipSnapSettings} settings
 */
function snapAnimationHipsY(animation, settings) {
  const output = findHipsTranslationOutput(animation);
  if (!output) {
    throw new Error(`${animation.getName()}: no hips translation channel found`);
  }

  return {
    animationName: animation.getName(),
    mode: settings.mode,
    ...adjustHipsTranslationY(output, settings),
  };
}

/**
 * @param {import('@gltf-transform/core').Document} doc
 * @param {Map<string, ClipSnapSettings>} clipSettings
 */
function snapDocumentAnimations(doc, clipSettings) {
  const animations = doc.getRoot().listAnimations();
  if (animations.length === 0) {
    throw new Error('GLB contains no animations');
  }

  const targets = clipSettings.size > 0
    ? [...clipSettings.entries()]
    : animations.map((animation) => [animation.getName(), { mode: 'auto' }]);

  /** @type {ReturnType<typeof snapAnimationHipsY>[]} */
  const results = [];

  for (const [clipName, settings] of targets) {
    const animation = animations.find((candidate) => candidate.getName() === clipName);
    if (!animation) {
      const available = animations.map((candidate) => candidate.getName()).join(', ');
      throw new Error(`Animation "${clipName}" not found. Available: ${available}`);
    }
    results.push(snapAnimationHipsY(animation, settings));
  }

  return results;
}

function resolvePath(filePath) {
  return path.isAbsolute(filePath) ? filePath : path.join(ROOT, filePath);
}

const { input, output, clipSettings } = parseArgs(process.argv);
const inputPath = resolvePath(input);
const outputPath = resolvePath(output);

if (!fs.existsSync(inputPath)) {
  console.error(`Input file not found: ${inputPath}`);
  process.exit(1);
}

const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({
    'draco3d.decoder': await draco3d.createDecoderModule(),
    'draco3d.encoder': await draco3d.createEncoderModule(),
  });

const doc = await io.read(inputPath);
const results = snapDocumentAnimations(doc, clipSettings);

await io.write(outputPath, doc);

for (const result of results) {
  const modeLabel = result.mode === 'auto'
    ? `auto boost=${result.boost.toFixed(2)}`
    : `manual ΔY=${(result.minYAfter - result.minYBefore).toFixed(4)}`;
  console.log(
    `${result.animationName}: ${modeLabel}, keys=${result.keyCount}, `
    + `minY ${result.minYBefore.toFixed(4)} → ${result.minYAfter.toFixed(4)}, `
    + `maxY ${result.maxYBefore.toFixed(4)} → ${result.maxYAfter.toFixed(4)}`,
  );
}
console.log(`Wrote ${path.relative(ROOT, outputPath)}`);
