/* eslint-disable jsdoc/require-returns-description */
/**
 * Trims animation clips to a maximum duration by dropping keyframes after the
 * cutoff and interpolating a final sample at the target time when needed.
 *
 * Usage:
 *   npm run assets:trim-animation-clips
 *   node scripts/trim-animation-clips.mjs --dry-run
 *   node scripts/trim-animation-clips.mjs [relative-or-absolute.glb…]
 *   node scripts/trim-animation-clips.mjs in.glb out.glb --clip reloading --duration 3
 *
 * With no paths, trims preset reload clips in base-animations.glb in place.
 */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import draco3d from 'draco3dgltf';
import { RELOAD_CLIP_SECONDS } from '@/modules/game/constants/reload';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const GLB_ROOT = path.join(ROOT, 'assets/glb');

const DEFAULT_TARGET = path.join(GLB_ROOT, 'characters/shared/base-animations.glb');

/** @typedef {{ duration: number }} ClipTrimSettings */

/** @type {Record<string, ClipTrimSettings>} */
const BASE_ANIMATIONS_TRIM_CLIPS = {
  'reloading': { duration: RELOAD_CLIP_SECONDS },
  'reloading-kneel': { duration: RELOAD_CLIP_SECONDS },
};

/** @type {Map<string, Record<string, ClipTrimSettings>>} */
const PRESET_BY_RELATIVE_PATH = new Map([
  ['characters/shared/base-animations.glb', BASE_ANIMATIONS_TRIM_CLIPS],
]);

/**
 * @param {string[]} argv
 * @returns {{
 *   targets: string[];
 *   explicitOutput: string | null;
 *   clipSettings: Map<string, ClipTrimSettings>;
 *   dryRun: boolean;
 *   listOnly: boolean;
 * }}
 */
function parseArgs(argv) {
  const positional = [];
  /** @type {Map<string, ClipTrimSettings>} */
  const clipSettings = new Map();
  /** @type {string | null} */
  let pendingClip = null;
  let dryRun = false;
  let listOnly = false;

  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--dry-run') {
      dryRun = true;
      continue;
    }
    if (arg === '--list') {
      listOnly = true;
      continue;
    }
    if (arg === '--clip') {
      pendingClip = argv[++i];
      if (!pendingClip) {
        throw new Error('Missing value for --clip');
      }
      if (!clipSettings.has(pendingClip)) {
        clipSettings.set(pendingClip, { duration: 3 });
      }
      continue;
    }
    if (arg === '--duration') {
      if (!pendingClip) {
        throw new Error('--duration must follow --clip <name>');
      }
      const value = Number(argv[++i]);
      if (!Number.isFinite(value) || value <= 0) {
        throw new Error(`Invalid --duration: ${argv[i]}`);
      }
      clipSettings.set(pendingClip, { duration: value });
      pendingClip = null;
      continue;
    }
    if (arg.startsWith('-')) {
      throw new Error(`Unknown flag: ${arg}`);
    }
    positional.push(arg);
    pendingClip = null;
  }

  const targets = positional.length > 0
    ? positional.map((entry) => (path.isAbsolute(entry) ? entry : path.join(ROOT, entry)))
    : [DEFAULT_TARGET];

  return {
    targets,
    explicitOutput: positional.length === 2 ? targets[1] : null,
    clipSettings,
    dryRun,
    listOnly,
  };
}

/**
 * @param {Float32Array | Int8Array | Uint8Array | Uint16Array | Int16Array | Uint32Array | Float64Array} values
 * @param {number} index
 * @param {number} componentCount
 * @returns {number[]}
 */
function readComponents(values, index, componentCount) {
  const out = [];
  const base = index * componentCount;
  for (let c = 0; c < componentCount; c++) {
    out.push(values[base + c]);
  }
  return out;
}

/**
 * @param {number[]} a
 * @param {number[]} b
 * @param {number} alpha
 * @returns {number[]}
 */
function lerpComponents(a, b, alpha) {
  return a.map((value, index) => value + alpha * (b[index] - value));
}

/**
 * @param {import('@gltf-transform/core').Document} doc
 * @param {import('@gltf-transform/core').Animation} animation
 * @param {number} maxDuration
 * @returns {{ channels: number, trimmedKeys: number }}
 */
function trimAnimationToDuration(doc, animation, maxDuration) {
  let channels = 0;
  let trimmedKeys = 0;

  for (const channel of animation.listChannels()) {
    const sampler = channel.getSampler();
    const input = sampler.getInput();
    const output = sampler.getOutput();
    if (!input || !output) {
      continue;
    }

    const times = input.getArray();
    const values = output.getArray();
    if (!times || !values || times.length === 0) {
      continue;
    }

    const componentCount = values.length / times.length;
    if (!Number.isInteger(componentCount) || componentCount <= 0) {
      throw new Error(
        `${animation.getName()}: invalid sampler output length ${values.length} for ${times.length} keys`,
      );
    }

    /** @type {number[]} */
    const newTimes = [];
    /** @type {number[]} */
    const newValues = [];

    for (let i = 0; i < times.length; i++) {
      if (times[i] <= maxDuration) {
        newTimes.push(times[i]);
        newValues.push(...readComponents(values, i, componentCount));
      }
    }

    const lastIndex = times.length - 1;
    const lastKeptTime = newTimes.length > 0 ? newTimes[newTimes.length - 1] : Number.NEGATIVE_INFINITY;
    if (lastKeptTime < maxDuration && times[lastIndex] > maxDuration) {
      let endIndex = 0;
      while (endIndex < times.length - 1 && times[endIndex + 1] <= maxDuration) {
        endIndex++;
      }
      const t0 = times[endIndex];
      const t1 = times[endIndex + 1];
      const alpha = (maxDuration - t0) / (t1 - t0);
      const start = readComponents(values, endIndex, componentCount);
      const end = readComponents(values, endIndex + 1, componentCount);
      newTimes.push(maxDuration);
      newValues.push(...lerpComponents(start, end, alpha));
    } else if (newTimes.length === 0) {
      newTimes.push(maxDuration);
      newValues.push(...readComponents(values, 0, componentCount));
    }

    if (newTimes.length === times.length && newTimes[newTimes.length - 1] === times[times.length - 1]) {
      continue;
    }

    const document = doc;
    const newInput = document.createAccessor()
      .setType('SCALAR')
      .setArray(new Float32Array(newTimes));
    const newOutput = document.createAccessor()
      .setType(output.getType())
      .setArray(new Float32Array(newValues));

    sampler.setInput(newInput);
    sampler.setOutput(newOutput);
    channels++;
    trimmedKeys += Math.max(0, times.length - newTimes.length);
  }

  return { channels, trimmedKeys };
}

/**
 * @param {import('@gltf-transform/core').Document} doc
 * @param {Map<string, ClipTrimSettings>} clipSettings
 */
function trimDocumentAnimations(doc, clipSettings) {
  const animations = doc.getRoot().listAnimations();
  /** @type {{ animationName: string; channels: number; trimmedKeys: number; durationBefore: number; durationAfter: number }[]} */
  const results = [];

  for (const [clipName, settings] of clipSettings) {
    const animation = animations.find((candidate) => candidate.getName() === clipName);
    if (!animation) {
      const available = animations.map((candidate) => candidate.getName()).join(', ');
      throw new Error(`Animation "${clipName}" not found. Available: ${available}`);
    }

    const durationBefore = readAnimationDuration(animation);
    const { channels, trimmedKeys } = trimAnimationToDuration(doc, animation, settings.duration);
    const durationAfter = readAnimationDuration(animation);
    results.push({
      animationName: clipName,
      channels,
      trimmedKeys,
      durationBefore,
      durationAfter,
    });
  }

  return results;
}

/**
 * @param {import('@gltf-transform/core').Animation} animation
 * @returns {number}
 */
function readAnimationDuration(animation) {
  let max = 0;
  for (const channel of animation.listChannels()) {
    const input = channel.getSampler().getInput();
    const times = input?.getArray();
    if (!times || times.length === 0) {
      continue;
    }
    max = Math.max(max, times[times.length - 1]);
  }
  return max;
}

/**
 * @param {string} inputPath
 * @param {Map<string, ClipTrimSettings>} clipSettings
 * @returns {Map<string, ClipTrimSettings>}
 */
function resolveClipSettingsForFile(inputPath, clipSettings) {
  if (clipSettings.size > 0) {
    return clipSettings;
  }
  const relative = path.relative(GLB_ROOT, inputPath).split(path.sep).join('/');
  const preset = PRESET_BY_RELATIVE_PATH.get(relative);
  return new Map(Object.entries(preset ?? {}));
}

const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({
    'draco3d.decoder': await draco3d.createDecoderModule(),
    'draco3d.encoder': await draco3d.createEncoderModule(),
  });

const { targets, explicitOutput, clipSettings, dryRun, listOnly } = parseArgs(process.argv);

for (const inputPath of targets.slice(0, explicitOutput ? 1 : targets.length)) {
  const label = path.relative(ROOT, inputPath);
  if (!fs.existsSync(inputPath)) {
    console.warn(`skip (missing): ${label}`);
    continue;
  }

  const doc = await io.read(inputPath);
  const perFileClipSettings = resolveClipSettingsForFile(inputPath, clipSettings);

  if (listOnly) {
    for (const animation of doc.getRoot().listAnimations()) {
      console.log(`  ${animation.getName()}: ${readAnimationDuration(animation).toFixed(4)}s`);
    }
    continue;
  }

  if (perFileClipSettings.size === 0) {
    console.warn(`${label}: no clip presets — pass --clip <name> --duration <seconds>`);
    continue;
  }

  const results = trimDocumentAnimations(doc, perFileClipSettings);
  for (const result of results) {
    console.log(
      `${label} :: ${result.animationName}: ${result.durationBefore.toFixed(4)}s → `
      + `${result.durationAfter.toFixed(4)}s (${result.channels} channels, `
      + `${result.trimmedKeys} keys dropped)`,
    );
  }

  if (dryRun) {
    continue;
  }

  const outputPath = explicitOutput ?? inputPath;
  await io.write(outputPath, doc);
}

console.log('done');
