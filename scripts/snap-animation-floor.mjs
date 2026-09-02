/* eslint-disable jsdoc/require-returns-description */
/**
 * Adjusts Mixamo hips translation keyframes so animated poses sit on Y=0.
 *
 * Mixamo rigs anchor hips above the floor in rest pose; crouch / death / kneel
 * clips keep positive Y offsets and make characters float unless corrected in
 * the asset. Locomotion clips that strip hips at runtime are unaffected.
 *
 * Usage:
 *   npm run assets:snap-animation-floor
 *   node scripts/snap-animation-floor.mjs --list
 *   node scripts/snap-animation-floor.mjs --dry-run
 *   node scripts/snap-animation-floor.mjs [relative-or-absolute.glb…]
 *   node scripts/snap-animation-floor.mjs <input.glb> [output.glb]
 *   node scripts/snap-animation-floor.mjs in.glb out.glb --clip dying --auto
 *   node scripts/snap-animation-floor.mjs in.glb out.glb --clip jump --auto --boost 1.15
 *   node scripts/snap-animation-floor.mjs in.glb out.glb \
 *     --clip dying --auto --clip kneel --auto --clip jump --y-offset 9.55
 *
 * With no paths, snaps preset clips in the shared animation GLBs in place.
 * With one path, writes back to the same file using that file's preset when known.
 * With two paths, writes a copy; without --clip flags every animation is auto-snapped.
 */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import draco3d from 'draco3dgltf';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const GLB_ROOT = path.join(ROOT, 'assets/glb');

const HIPS_NODE_PATTERN = /^(?:mixamorig:?)?Hips$/i;

const DEFAULT_TARGETS = [
  path.join(GLB_ROOT, 'characters/shared/base-animations.glb'),
  path.join(GLB_ROOT, 'characters/shared/character-preview-animation.glb'),
];

/** @typedef {'auto' | 'manual'} SnapMode */

/**
 * @typedef {object} ClipSnapSettings
 * @property {SnapMode} mode - Auto floor snap or manual Y offset.
 * @property {number} [yOffset] - Manual delta applied to every hips Y keyframe.
 * @property {number} [boost] - Auto mode: scale arc height from floor anchor (default 1).
 */

/**
 * Clips that keep hips translation at runtime (`resolve-soldier-clips.ts`).
 * Locomotion clips strip hips in code and are omitted from the default preset.
 *
 * @type {Record<string, ClipSnapSettings>}
 */
const BASE_ANIMATIONS_SNAP_CLIPS = {
  jump: { mode: 'auto', boost: 1.15 },
  'jump-idle': { mode: 'auto' },
  kneel: { mode: 'auto' },
  dying: { mode: 'auto' },
  reloading: { mode: 'auto' },
  'reloading-kneel': { mode: 'auto' },
  'hit-reaction': { mode: 'auto' },
  shooting: { mode: 'auto' },
};

/** Lobby preview pack — hips are stripped at runtime but source Y is normalized too. */
const PREVIEW_ANIMATION_SNAP_CLIPS = {
  figth: { mode: 'auto' },
  'looking-around': { mode: 'auto' },
  'looking-bihind': { mode: 'auto' },
};

/** @type {Map<string, Record<string, ClipSnapSettings>>} */
const PRESET_BY_RELATIVE_PATH = new Map([
  ['characters/shared/base-animations.glb', BASE_ANIMATIONS_SNAP_CLIPS],
  ['characters/shared/character-preview-animation.glb', PREVIEW_ANIMATION_SNAP_CLIPS],
]);

/**
 * @typedef {object} ParsedArgs
 * @property {string[]} targets - Absolute GLB paths to process.
 * @property {string | null} explicitOutput - Copy destination when provided.
 * @property {boolean} inPlace - True when output is omitted or matches input.
 * @property {Map<string, ClipSnapSettings>} clipSettings - CLI clip overrides.
 * @property {boolean} dryRun
 * @property {boolean} listOnly
 */

/**
 * @param {string[]} argv
 * @returns {ParsedArgs}
 */
function parseArgs(argv) {
  const positional = [];
  /** @type {Map<string, ClipSnapSettings>} */
  const clipSettings = new Map();
  /** @type {string | null} */
  let pendingClip = null;
  let dryRun = false;
  let listOnly = false;

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
    if (arg === '--dry-run') {
      dryRun = true;
      continue;
    }
    if (arg === '--list') {
      listOnly = true;
      continue;
    }
    if (arg.startsWith('-')) {
      throw new Error(`Unknown option: ${arg}`);
    }
    positional.push(arg);
  }

  let targets;
  /** @type {string | null} */
  let explicitOutput = null;

  if (positional.length === 0) {
    targets = DEFAULT_TARGETS;
  } else if (positional.length === 1) {
    targets = [resolvePath(positional[0])];
  } else if (positional.length === 2) {
    targets = [resolvePath(positional[0])];
    explicitOutput = resolvePath(positional[1]);
  } else {
    throw new Error(
      'Usage: node scripts/snap-animation-floor.mjs [input.glb [output.glb]] '
      + '[--clip <name> [--auto | --y-offset <n> | --boost <n>]]… [--dry-run] [--list]',
    );
  }

  const inPlace = explicitOutput === null;

  return { targets, explicitOutput, inPlace, clipSettings, dryRun, listOnly };
}

/**
 * @param {string} filePath
 * @returns {string | null}
 */
function presetKeyForPath(filePath) {
  const relative = path.relative(GLB_ROOT, filePath).split(path.sep).join('/');
  return PRESET_BY_RELATIVE_PATH.has(relative) ? relative : null;
}

/**
 * @param {string} filePath
 * @param {Map<string, ClipSnapSettings>} cliClipSettings
 * @param {boolean} inPlace
 * @returns {Map<string, ClipSnapSettings>}
 */
function resolveClipSettingsForFile(filePath, cliClipSettings, inPlace) {
  if (cliClipSettings.size > 0) {
    return cliClipSettings;
  }

  if (!inPlace) {
    return cliClipSettings;
  }

  const presetKey = presetKeyForPath(filePath);
  if (presetKey) {
    return new Map(Object.entries(PRESET_BY_RELATIVE_PATH.get(presetKey)));
  }

  return cliClipSettings;
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

/**
 * @param {Float32Array | Int32Array | Uint32Array | Uint16Array | Uint8Array | Int8Array | Int16Array} array
 * @returns {number}
 */
function maxTranslationY(array) {
  let maxY = -Infinity;
  for (let i = 1; i < array.length; i += 3) {
    maxY = Math.max(maxY, array[i]);
  }
  return maxY;
}

/**
 * @param {Float32Array | Int32Array | Uint32Array | Uint16Array | Uint8Array | Int8Array | Int16Array} left
 * @param {Float32Array | Int32Array | Uint32Array | Uint16Array | Uint8Array | Int8Array | Int16Array} right
 * @returns {boolean}
 */
function translationArraysEqual(left, right) {
  if (left.length !== right.length) {
    return false;
  }
  for (let i = 0; i < left.length; i++) {
    if (left[i] !== right[i]) {
      return false;
    }
  }
  return true;
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
    const changed = !translationArraysEqual(source, next);
    if (changed) {
      accessor.setArray(next);
    }
    return {
      keyCount: next.length / 3,
      minYBefore,
      maxYBefore,
      minYAfter: minTranslationY(next),
      maxYAfter: maxTranslationY(next),
      boost: 1,
      changed,
    };
  }

  const boost = settings.boost ?? 1;
  for (let i = 1; i < next.length; i += 3) {
    next[i] = (next[i] - minYBefore) * boost;
  }
  const changed = !translationArraysEqual(source, next);
  if (changed) {
    accessor.setArray(next);
  }

  return {
    keyCount: next.length / 3,
    minYBefore,
    maxYBefore,
    minYAfter: minTranslationY(next),
    maxYAfter: maxTranslationY(next),
    boost,
    changed,
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

/**
 * @param {import('@gltf-transform/core').Document} doc
 * @returns {{ animationName: string, minY: number, maxY: number, hasHips: boolean }[]}
 */
function listDocumentHipsRanges(doc) {
  return doc.getRoot().listAnimations().map((animation) => {
    const output = findHipsTranslationOutput(animation);
    if (!output) {
      return {
        animationName: animation.getName(),
        minY: NaN,
        maxY: NaN,
        hasHips: false,
      };
    }
    const array = output.getArray();
    return {
      animationName: animation.getName(),
      minY: minTranslationY(array),
      maxY: maxTranslationY(array),
      hasHips: true,
    };
  });
}

function resolvePath(filePath) {
  return path.isAbsolute(filePath) ? filePath : path.join(ROOT, filePath);
}

/**
 * @param {ReturnType<typeof snapAnimationHipsY>} result
 * @returns {string}
 */
function formatSnapResult(result) {
  const modeLabel = result.mode === 'auto'
    ? `auto boost=${result.boost.toFixed(2)}`
    : `manual ΔY=${(result.minYAfter - result.minYBefore).toFixed(4)}`;
  const changedLabel = result.changed ? 'updated' : 'unchanged';
  return (
    `${result.animationName}: ${modeLabel}, ${changedLabel}, keys=${result.keyCount}, `
    + `minY ${result.minYBefore.toFixed(4)} → ${result.minYAfter.toFixed(4)}, `
    + `maxY ${result.maxYBefore.toFixed(4)} → ${result.maxYAfter.toFixed(4)}`
  );
}

async function createIo() {
  const io = new NodeIO()
    .registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({
      'draco3d.decoder': await draco3d.createDecoderModule(),
      'draco3d.encoder': await draco3d.createEncoderModule(),
    });
  return io;
}

const { targets, explicitOutput, inPlace, clipSettings, dryRun, listOnly } = parseArgs(process.argv);
const io = await createIo();

if (listOnly) {
  for (const inputPath of targets) {
    const label = path.relative(ROOT, inputPath);
    if (!fs.existsSync(inputPath)) {
      console.warn(`skip (missing): ${label}`);
      continue;
    }
    const doc = await io.read(inputPath);
    console.log(`\n${label}:`);
    for (const row of listDocumentHipsRanges(doc)) {
      if (!row.hasHips) {
        console.log(`  ${row.animationName}: (no hips translation channel)`);
        continue;
      }
      console.log(
        `  ${row.animationName}: hips Y [${row.minY.toFixed(4)}, ${row.maxY.toFixed(4)}]`,
      );
    }
  }
  process.exit(0);
}

let filesUpdated = 0;

for (const inputPath of targets) {
  const label = path.relative(ROOT, inputPath);
  const outputPath = explicitOutput ?? inputPath;

  if (!fs.existsSync(inputPath)) {
    console.warn(`skip (missing): ${label}`);
    continue;
  }

  const perFileClipSettings = resolveClipSettingsForFile(inputPath, clipSettings, inPlace);
  const presetKey = presetKeyForPath(inputPath);
  const presetLabel = inPlace && presetKey && perFileClipSettings.size > 0 && clipSettings.size === 0
    ? ` (${perFileClipSettings.size} preset clips)`
    : '';

  const doc = await io.read(inputPath);
  const results = snapDocumentAnimations(doc, perFileClipSettings);
  const changedCount = results.filter((result) => result.changed).length;

  console.log(`\n${label}${presetLabel}:`);
  for (const result of results) {
    console.log(`  ${formatSnapResult(result)}`);
  }

  if (changedCount === 0) {
    console.log('  already ok');
    continue;
  }

  if (dryRun) {
    console.log(`  dry-run: would write ${path.relative(ROOT, outputPath)}`);
    continue;
  }

  await io.write(outputPath, doc);
  filesUpdated++;
  console.log(`  wrote ${path.relative(ROOT, outputPath)}`);
}

if (dryRun) {
  console.log('\ndry-run complete (no files written)');
} else {
  console.log(`\ndone (${filesUpdated} updated)`);
}
