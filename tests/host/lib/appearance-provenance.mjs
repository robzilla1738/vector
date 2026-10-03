import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { lstatSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { PNG } from 'pngjs';
import { evidenceBytes } from '../../../scripts/lib/qualification.mjs';

const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const hex = (value, size) => typeof value === 'string' && new RegExp(`^[a-f0-9]{${size}}$`).test(value);
const timestamp = value => {
  assert.ok(typeof value === 'string' && Number.isFinite(Date.parse(value)), 'Invalid observation timestamp');
  return Date.parse(value);
};
const frame = value => {
  assert.ok(value && ['x', 'y', 'width', 'height'].every(key => Number.isFinite(value[key])) && value.width > 0 && value.height > 0, 'Invalid native window frame');
  return { x: value.x, y: value.y, width: value.width, height: value.height };
};
export function validateAppearanceCandidate(candidate) {
  const product = candidate?.productIdentity;
  assert.ok(product?.dirty === false && hex(product.commit, 40) && hex(product.tree, 40) && product.label === product.commit, 'Appearance needs clean product identity');
  assert.equal(candidate.native?.sourceCommit, product.commit, 'Native/product identity mismatch');
  assert.ok(typeof candidate.native.buildId === 'string' && candidate.native.buildId && hex(candidate.native.manifestHash, 64) && hex(candidate.shellDigest, 64) && hex(candidate.harnessCommit, 40) && hex(candidate.moduleSha256, 64), 'Missing paired appearance candidate');
}
function validateIdentity(actual, candidate) {
  assert.deepEqual(actual.runtime, candidate.productIdentity, 'Appearance runtime identity changed');
  for (const key of ['sourceCommit', 'buildId', 'manifestHash']) assert.equal(actual.native?.[key], candidate.native[key], `Appearance native ${key} changed`);
}

/** Parse only the actual zero-argument native getter reply. Caller labels are not inputs. */
export function normalizeNativeAppearance(rawJson, { candidate, targetPid, windowId, startedAt, completedAt }) {
  validateAppearanceCandidate(candidate);
  assert.equal(typeof rawJson, 'string', 'Missing raw native getter JSON');
  const raw = JSON.parse(rawJson);
  assert.equal(raw.producer, 'aux-native-appearance-snapshot', 'Wrong native appearance producer');
  assert.equal(raw.version, 1, 'Unknown native appearance version');
  assert.ok(Number.isInteger(targetPid) && targetPid > 0 && Number.isInteger(windowId) && windowId > 0, 'Missing owned appearance target');
  assert.equal(raw.pid, targetPid, 'Native target PID mismatch'); assert.equal(raw.windowId, windowId, 'Native target window mismatch');
  assert.ok(Number.isFinite(raw.observedAtUnixMs) && raw.observedAtUnixMs >= timestamp(startedAt) && raw.observedAtUnixMs <= timestamp(completedAt), 'Stale or unbracketed native readback');
  assert.ok(['normal', 'private', 'quick-ask', 'little'].includes(raw.windowKind), 'Unsupported appearance window kind');
  assert.ok(['light', 'dark', null].includes(raw.nativeTheme), 'Invalid native theme');
  assert.ok(['solid', 'liquid-glass', 'visual-effect', null].includes(raw.backing) && ['solid', 'liquid-glass', 'titlebar', 'sidebar', 'under-window', null].includes(raw.material), 'Invalid actual native material');
  const shell = raw.shell;
  assert.ok(shell && ['light', 'dark', null].includes(shell.theme) && ['vertical', 'horizontal', null].includes(shell.layout) && ['translucent', 'solid', null].includes(shell.sidebarAppearance), 'Invalid actual Aux shell readback');
  for (const key of ['systemDark', 'reduceMotion', 'reduceTransparency']) assert.equal(typeof shell[key], 'boolean', `Missing observed shell ${key}`);
  assert.deepEqual(Object.keys(raw).sort(), ['producer', 'version', 'pid', 'windowId', 'frame', 'nativeTheme', 'backing', 'material', 'observedAtUnixMs', 'shell', 'windowKind'].sort(), 'Unexpected native getter fields');
  assert.deepEqual(Object.keys(shell).sort(), ['theme', 'layout', 'sidebarAppearance', 'systemDark', 'reduceMotion', 'reduceTransparency'].sort(), 'Unexpected shell observation fields');
  return { producer: raw.producer, version: raw.version, candidate, pid: targetPid, windowId, windowKind: raw.windowKind,
    observedAt: new Date(raw.observedAtUnixMs).toISOString(), frame: frame(raw.frame), nativeTheme: raw.nativeTheme,
    backing: raw.backing, material: raw.material, shell: structuredClone(shell) };
}
/** Only the actual registered child's distinct native stderr/getter record. */
export function normalizePipAppearance(rawJson, { candidate, targetPid, windowId, startedAt, completedAt }) {
  validateAppearanceCandidate(candidate);
  assert.equal(typeof rawJson, 'string', 'Missing native child JSON');
  const raw = JSON.parse(rawJson);
  assert.equal(raw.producer, 'aux-native-pip-appearance', 'Wrong child appearance producer');
  assert.equal(raw.version, 1, 'Unknown child appearance version');
  assert.ok(Number.isInteger(targetPid) && targetPid > 0 && Number.isInteger(windowId) && windowId > 0, 'Missing owned child target');
  assert.equal(raw.pid, targetPid, 'Native child PID mismatch');
  assert.equal(raw.windowId, windowId, 'Native child window mismatch');
  assert.ok(['video-pip', 'document-pip'].includes(raw.surfaceKind), 'Unknown native child kind');
  assert.ok(Number.isInteger(raw.ownerWindowId) && raw.ownerWindowId > 0 && raw.ownerWindowId !== raw.windowId, 'Missing actual child owner window');
  assert.ok(typeof raw.ownerPageId === 'string' && raw.ownerPageId.length > 0 && raw.ownerPageId.length <= 512, 'Missing actual child owner page');
  assert.ok(Number.isInteger(raw.windowLayer), 'Missing actual native window layer');
  assert.ok(typeof raw.registrationGeneration === 'string' && /^[1-9][0-9]{0,19}$/.test(raw.registrationGeneration)
    && BigInt(raw.registrationGeneration) <= 18446744073709551615n, 'Invalid child registration generation');
  assert.deepEqual(Object.keys(raw.frame ?? {}).sort(), ['height', 'width', 'x', 'y'], 'Unexpected child frame fields');
  assert.ok(Object.values(raw.frame).every(Number.isFinite) && raw.frame.width > 0 && raw.frame.height > 0, 'Invalid child frame');
  for (const key of ['nativeTheme', 'viewTheme']) assert.ok(['light', 'dark', null].includes(raw[key]), `Invalid actual child ${key}`);
  assert.equal(raw.auxTheme, null, 'Child cannot inherit an unobserved Aux theme');
  for (const key of ['windowOpaque', 'nativeReduceTransparency', 'nativeReduceMotion']) assert.equal(typeof raw[key], 'boolean', `Missing actual child ${key}`);
  assert.ok(['solid', 'liquid-glass', 'visual-effect', null].includes(raw.backing), 'Invalid actual child backing');
  assert.ok(['solid', 'liquid-glass', 'titlebar', 'sidebar', 'under-window', null].includes(raw.material), 'Invalid actual child material');
  const start = Date.parse(startedAt), end = Date.parse(completedAt);
  assert.ok(Number.isFinite(start) && Number.isFinite(end) && Number.isFinite(raw.nativeUnixMs)
    && raw.nativeUnixMs >= start && raw.nativeUnixMs <= end, 'Stale or unbracketed child readback');
  assert.deepEqual(Object.keys(raw).sort(), ['producer', 'version', 'pid', 'windowId', 'ownerWindowId', 'ownerPageId', 'surfaceKind', 'windowLayer', 'registrationGeneration', 'frame', 'nativeTheme', 'viewTheme', 'auxTheme', 'windowOpaque', 'backing', 'material', 'nativeReduceTransparency', 'nativeReduceMotion', 'nativeUnixMs'].sort(), 'Unexpected child getter fields');
  return { ...raw, candidate: structuredClone(candidate), observedAt: new Date(raw.nativeUnixMs).toISOString() };
}

export function normalizeTrustedPreferences(raw, { candidate, targetPid, windowId, observedAt, pins }) {
  validateAppearanceCandidate(candidate); timestamp(observedAt);
  assert.ok(raw?.accessibility === true && raw.screenRecording === true, 'Actual helper permissions unavailable');
  assert.deepEqual(Object.keys(raw).sort(), ['accessibility', 'screenRecording', 'reduceMotion', 'reduceTransparency'].sort(), 'Unexpected trusted helper fields');
  for (const key of ['reduceMotion', 'reduceTransparency']) assert.equal(typeof raw[key], 'boolean', `Missing actual helper ${key}`);
  assert.ok(Number.isInteger(targetPid) && targetPid > 0 && Number.isInteger(windowId) && windowId > 0 && hex(pins.helperSha256, 64) && hex(pins.helperSourceSha256, 64) && pins.nativeSnapshotVersion === 1, 'Missing helper target/pins');
  return { producer: 'native-window.trusted', candidate, pid: targetPid, windowId, observedAt,
    helperSha256: pins.helperSha256, helperSourceSha256: pins.helperSourceSha256, ...raw };
}

/** No debugger/RPC/settings fallback: the owner must supply a real authorized shell observer. */
export function createAppearanceProvenance(options) { return createNativeProvenance(options, false); }
export function createPipAppearanceProvenance(options) { return createNativeProvenance(options, true); }
function createNativeProvenance({ outputDir, candidate, targetPid, helper, helperExecutable, helperSource, observeWindow, readIdentity }, child) {
  validateAppearanceCandidate(candidate);
  candidate = structuredClone(candidate);
  assert.ok(Number.isInteger(targetPid) && targetPid > 0 && typeof observeWindow === 'function' && typeof readIdentity === 'function' && typeof helper?.trusted === 'function' && typeof helper.windows === 'function', 'Missing authorized appearance producer access');
  assert.equal(basename(helperSource), 'native-window.swift', 'Unexpected helper source');
  assert.ok(/^native-window-[a-f0-9]{12}$/.test(basename(helperExecutable)), 'Unexpected helper executable');
  for (const path of [helperSource, helperExecutable]) assert.ok(lstatSync(path).isFile() && !lstatSync(path).isSymbolicLink(), 'Producer must be a regular file');
  const pins = { helperSourceSha256: hash(readFileSync(helperSource)), helperSha256: hash(readFileSync(helperExecutable)), nativeSnapshotVersion: 1 };
  assert.equal(basename(helperExecutable), `native-window-${pins.helperSourceSha256.slice(0, 12)}`, 'Helper executable/source cache mismatch');
  const requested = resolve(outputDir);
  assert.ok(lstatSync(requested).isDirectory() && !lstatSync(requested).isSymbolicLink(), 'Appearance output must be a real evidence directory');
  const directory = realpathSync(requested);
  Object.freeze(pins);
  const pending = new WeakMap();
  const producerPaths = [helperSource, helperExecutable].map(path => realpathSync(path));
  async function sample(windowId) {
    assert.ok(Number.isInteger(windowId) && windowId > 0, 'Explicit owned capture window required');
    for (const [index, path] of [helperSource, helperExecutable].entries()) {
      assert.ok(lstatSync(path).isFile() && !lstatSync(path).isSymbolicLink(), 'Producer file changed type');
      assert.equal(realpathSync(path), producerPaths[index], 'Producer file changed location');
    }
    assert.equal(hash(readFileSync(helperSource)), pins.helperSourceSha256, 'Helper source changed');
    assert.equal(hash(readFileSync(helperExecutable)), pins.helperSha256, 'Helper executable changed');
    validateIdentity(await readIdentity(), candidate);
    const startedAt = new Date().toISOString();
    // Transport selection only; the native shell getter still takes zero arguments.
    // A periodic observer must wait for a fresh record from this exact window.
    const rawJson = await observeWindow({ windowId, notBefore: startedAt });
    const completedAt = new Date().toISOString();
    const window = (child ? normalizePipAppearance : normalizeNativeAppearance)(rawJson, { candidate, targetPid, windowId, startedAt, completedAt });
    const matches = (await helper.windows()).filter(item => item.id === windowId && item.layer === (child ? window.windowLayer : 0));
    assert.equal(matches.length, 1, 'Appearance window not in owned helper inventory');
    assert.deepEqual(frame(matches[0]), window.frame, 'Helper/native point frame mismatch');
    const rawSystem = structuredClone(await helper.trusted());
    const system = normalizeTrustedPreferences(rawSystem, { candidate, targetPid, windowId, pins, observedAt: new Date().toISOString() });
    if (child) {
      assert.equal(window.nativeReduceMotion, system.reduceMotion, "Child/helper motion preference mismatch");
      assert.equal(window.nativeReduceTransparency, system.reduceTransparency, "Child/helper transparency preference mismatch");
    }
    validateIdentity(await readIdentity(), candidate);
    return { window, system, rawJson, rawSystem, startedAt, completedAt };
  }
  return { pins,
    async observeWindowKind(windowId) {
      const before = await sample(windowId), after = await sample(windowId);
      assert.equal(before.window.pid, after.window.pid, 'Setup window PID changed');
      assert.equal(before.window.windowKind, after.window.windowKind, 'Setup window kind changed');
      assert.deepEqual(before.window.frame, after.window.frame, 'Setup window frame changed');
      for (const key of ['accessibility', 'screenRecording', 'reduceMotion', 'reduceTransparency'])
        assert.equal(before.system[key], after.system[key], 'Setup system preference changed');
      return { before, after };
    },
    async before(windowId, expectedOwner) {
      const value = await sample(windowId), ticket = Object.freeze({ windowId, ...(child ? { windowLayer: value.window.windowLayer, surfaceKind: value.window.surfaceKind, registrationGeneration: value.window.registrationGeneration } : {}) });
      if (child) {
        assert.deepEqual(Object.keys(expectedOwner ?? {}).sort(), ['ownerPageId', 'ownerWindowId', 'registrationGeneration', 'surfaceKind'].sort(), 'Child capture requires discovered ownership fences');
        for (const key of ['ownerPageId', 'ownerWindowId', 'registrationGeneration', 'surfaceKind'])
          assert.equal(value.window[key], expectedOwner[key], `Discovered child ${key} changed before capture`);
      } else assert.equal(expectedOwner, undefined, 'Normal capture cannot use child ownership');
      pending.set(ticket, value); return ticket;
    },
    async finish(ticket, capture, { state, capturedAt, captureCompletedAt }) {
      const before = pending.get(ticket);
      assert.ok(before && pending.delete(ticket), 'Capture must use its own unconsumed before observation');
      assert.ok(typeof state === 'string' && state.length > 0 && typeof capture.name === 'string' && /^[A-Za-z0-9][A-Za-z0-9_-]{0,120}$/.test(capture.name), 'Missing capture state/name');
      assert.deepEqual(Object.keys(capture).sort(), ['name', 'path', 'sha256', 'bytes', 'windowId'].sort(), 'Unexpected capture fields');
      assert.equal(capture.windowId, before.window.windowId, 'Capture/before window mismatch');
      const after = await sample(capture.windowId);
      assert.deepEqual(before.window.frame, after.window.frame, 'Capture point frame changed');
      assert.equal(before.window.windowKind, after.window.windowKind, 'Capture window kind changed');
      if (child) for (const key of ['registrationGeneration', 'ownerWindowId', 'ownerPageId', 'surfaceKind', 'windowLayer'])
        assert.equal(before.window[key], after.window[key], `Capture child ${key} changed`);
      const at = timestamp(capturedAt), end = timestamp(captureCompletedAt);
      assert.ok(end >= at && Math.max(timestamp(before.window.observedAt), timestamp(before.system.observedAt)) <= at && end <= Math.min(timestamp(after.window.observedAt), timestamp(after.system.observedAt)), 'Producers do not bracket capture');
      const bytes = evidenceBytes(directory, capture.path);
      assert.equal(hash(bytes), capture.sha256, 'Original capture digest mismatch'); assert.equal(bytes.length, capture.bytes, 'Original capture byte count mismatch');
      const { width, height } = PNG.sync.read(bytes);
      assert.ok(width > 0 && height > 0, 'Empty capture PNG');
      const name = `.appearance-${capture.name}`;
      const target = join(directory, name); mkdirSync(target); // Refuse reuse, even after partial output.
      const put = (file, content) => {
        const data = typeof content === 'string' ? content : `${JSON.stringify(content, null, 2)}\n`;
        writeFileSync(join(target, file), data, { flag: 'wx', mode: 0o600 });
        return { path: file, sha256: hash(Buffer.from(data)) };
      };
      const observations = {};
      for (const [side, value] of [['before', before], ['after', after]]) {
        const rawWindow = put(`${side}-native-raw.json`, value.rawJson), rawSystem = put(`${side}-helper-raw.json`, value.rawSystem);
        observations[side] = {
          window: put(`${side}-window.json`, { ...value.window, rawReply: rawWindow, requestStartedAt: value.startedAt, requestCompletedAt: value.completedAt }),
          system: put(`${side}-system.json`, { ...value.system, rawReply: rawSystem }),
        };
      }
      const record = { ...capture, state, capturedAt, captureCompletedAt, pixelDimensions: { width, height }, windowFrame: before.window.frame, provenanceObservationId: capture.name };
      const provenance = put('provenance.json', { schema: 1, candidate, observations: [{ id: capture.name, capture: record, ...observations }] });
      return { ...record, provenance: { ...provenance, path: `${name}/${provenance.path}` } };
    },
  };
}
