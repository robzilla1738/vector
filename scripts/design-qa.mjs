#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { readFileSync, mkdirSync, writeFileSync, existsSync, realpathSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import { PNG } from 'pngjs';
import { retainPackagedRuntimePair } from '../tests/host/lib/packaged-runtime-pair-artifact.mjs';
import { normalizePrivateWindowObservation } from '../tests/host/lib/private-window-observation.mjs';
import { decodeWarmWindowHelperIdentity } from '../tests/host/lib/native-warm-helper-identity.mjs';
import { normalizeNativeAppearance, normalizePipAppearance, normalizeTrustedPreferences } from '../tests/host/lib/appearance-provenance.mjs';

const cells = ['L', 'D', 'LR', 'DR'];
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const hex = (value, length) => typeof value === 'string' && new RegExp(`^[a-f0-9]{${length}}$`).test(value);
const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const require = (condition, message) => { if (!condition) throw new Error(message); };
const same = (a, b, label) => require(isDeepStrictEqual(a, b), `Mismatched ${label}`);
function artifact(reference, parent, rawOnly = false) {
  require(reference && typeof reference.path === 'string' && hex(reference.sha256, 64), 'Missing hashed artifact reference');
  const path = resolve(dirname(parent), reference.path), bytes = readFileSync(path);
  same(hash(bytes), reference.sha256, `artifact digest: ${path}`);
  return { path, bytes, json: rawOnly ? undefined : JSON.parse(bytes.toString('utf8')) };
}
function identity(manifest, expected, privatePair) {
  const product = manifest.productIdentity;
  const privateCapture = manifest.kind === 'aux-private-observation';
  if (privateCapture) {
    require(privatePair && manifest.schema === 1 && manifest.runtimeStatus === 'inactive-private' && !('runtime' in manifest) && manifest.qualification === 'none', 'Private capture requires externally admitted inactive artifact');
    privatePair.validate(); same(product, privatePair.productIdentity, 'private packaged product');
    same(manifest.native, privatePair.native, 'private compiled native');
    same(manifest.packagedRuntimeArtifact, privatePair.artifact, 'private packaged artifact proof');
    same(manifest.shellDigest, privatePair.shellDigest, 'private packaged resource digest');
  }
  require((privateCapture ? manifest.schema === 1 : manifest.schema === 2) && product?.dirty === false && hex(product.commit, 40) && hex(product.tree, 40) && product.label === product.commit, 'Manifest needs clean product identity');
  if (!privateCapture) same(manifest.runtime, product, 'runtime/product identity');
  same(manifest.native?.sourceCommit, product.commit, 'native/product identity');
  require(typeof manifest.native.buildId === 'string' && manifest.native.buildId.length > 0 && hex(manifest.native.manifestHash, 64) && hex(manifest.shellDigest, 64) && hex(manifest.moduleSha256, 64) && hex(manifest.harnessCommit, 40), 'Missing native/shell/harness identity');
  const candidate = { productIdentity: product, native: { sourceCommit: manifest.native.sourceCommit, buildId: manifest.native.buildId, manifestHash: manifest.native.manifestHash }, shellDigest: manifest.shellDigest };
  same(candidate, Object.fromEntries(Object.entries(expected ?? {}).filter(([key]) => key !== 'provenanceProducers')), 'frozen candidate');
  return { ...candidate, harnessCommit: manifest.harnessCommit, moduleSha256: manifest.moduleSha256 };
}
function time(value) {
  require(typeof value === 'string' && Number.isFinite(Date.parse(value)), 'Missing capture observation timestamp');
  return Date.parse(value);
}
function snapshot(reference, parent, capture, candidate, kind, privatePair) {
  const { json } = artifact(reference, parent);
  same(json.windowId, capture.windowId, `${kind} target window`);
  require(Number.isInteger(json.pid) && json.pid > 0, 'Missing observed PID');
  same(json.candidate, candidate, `${kind} observation candidate`);
  time(json.observedAt);
  if (kind === 'system') {
    require(json.accessibility === true && json.screenRecording === true, 'Native capture permissions not proved');
    require(json.producer === 'native-window.trusted' && hex(json.helperSha256, 64) && hex(json.helperSourceSha256, 64), 'Unrecognized system preference producer');
  } else {
    require(['aux-native-appearance-snapshot', 'aux-native-pip-appearance'].includes(json.producer) && json.version === 1, 'Missing distinct native appearance producer');
  }
  const privateWindow = privatePair && kind === 'window';
  const raw = artifact(json.rawReply, referencePath(reference, parent), privateWindow);
  let derived;
  if (kind === 'system') {
    derived = normalizeTrustedPreferences(raw.json, { candidate, targetPid: json.pid, windowId: capture.windowId,
      observedAt: json.observedAt, pins: { helperSha256: json.helperSha256, helperSourceSha256: json.helperSourceSha256, nativeSnapshotVersion: 1 } });
  } else if (privateWindow) {
    const receipt = normalizePrivateWindowObservation(raw.bytes.toString('utf8'), { candidate, targetPid: json.pid, windowId: capture.windowId, startedAt: json.requestStartedAt, completedAt: json.requestCompletedAt });
    derived = { ...receipt.window, runtimeStatus: receipt.runtimeStatus, privateNativeIdentity: receipt.native };
  } else {
    require(raw.json.frame && isDeepStrictEqual(Object.keys(raw.json.frame).sort(), ['height', 'width', 'x', 'y']), 'Unexpected raw window frame fields');
    const normalize = json.producer === 'aux-native-pip-appearance' ? normalizePipAppearance : normalizeNativeAppearance;
    derived = normalize(raw.bytes.toString('utf8'), { candidate, targetPid: json.pid, windowId: capture.windowId,
      startedAt: json.requestStartedAt, completedAt: json.requestCompletedAt });
  }
  same(derived, Object.fromEntries(Object.entries(json).filter(([key]) => !['rawReply', 'requestStartedAt', 'requestCompletedAt'].includes(key))), `${kind} raw producer projection`);
  return json;
}
function referencePath(reference, parent) { return resolve(dirname(parent), reference.path); }
function observedCell(before, after, capture) {
  for (const side of [before, after]) {
    for (const kind of ['system', 'window']) require(kind in side, 'Missing before/after producer');
    same(side.system.pid, side.window.pid, 'system/window target PID');
  }
  same(before.system.pid, after.system.pid, 'capture target PID');
  same(before.system.helperSha256, after.system.helperSha256, 'helper executable stability');
  same(before.system.helperSourceSha256, after.system.helperSourceSha256, 'helper source stability');
  same(before.window.frame, after.window.frame, 'window frame stability');
  const frame = before.window.frame;
  require(frame && ['x', 'y', 'width', 'height'].every(key => Number.isFinite(frame[key])) && frame.width > 0 && frame.height > 0, 'Missing actual window point frame');
  same(capture.windowFrame, frame, 'capture point frame');
  const timestamp = time(capture.capturedAt), completed = time(capture.captureCompletedAt);
  require(completed >= timestamp && Math.max(time(before.system.observedAt), time(before.window.observedAt)) <= timestamp && completed <= Math.min(time(after.system.observedAt), time(after.window.observedAt)), 'Observations do not bracket capture');
  const reasons = [];
  for (const key of ['reduceMotion', 'reduceTransparency']) {
    if (typeof before.system[key] !== 'boolean' || typeof after.system[key] !== 'boolean') reasons.push(`Unknown system ${key}`);
    else if (before.system[key] !== after.system[key]) reasons.push(`Changed system ${key}`);
  }
  same(before.window.producer, after.window.producer, 'window producer stability');
  const child = before.window.producer === 'aux-native-pip-appearance';
  if (child) {
    for (const key of ['surfaceKind', 'ownerWindowId', 'ownerPageId', 'registrationGeneration', 'windowLayer']) same(before.window[key], after.window[key], `child ${key} stability`);
  }
  same(before.window.windowKind, after.window.windowKind, 'window kind');
  require(child || ['normal', 'private', 'quick-ask', 'little'].includes(before.window.windowKind), 'Unknown normal window kind; child requires its distinct producer');
  for (const side of [before, after]) {
    if (!['light', 'dark'].includes(side.window.nativeTheme)) reasons.push('Unknown native effective appearance');
    if (side.window.backing === null || side.window.material === null) reasons.push('Unknown actual native backing/material');
    if (child) {
      if (!['light', 'dark'].includes(side.window.viewTheme)) reasons.push('Unknown child view theme');
      else if (side.window.viewTheme !== side.window.nativeTheme) reasons.push('Child view/native theme mismatch');
      for (const [nativeKey, systemKey] of [['nativeReduceMotion', 'reduceMotion'], ['nativeReduceTransparency', 'reduceTransparency']])
        if (side.window[nativeKey] !== side.system[systemKey]) reasons.push(`Child/system ${systemKey} mismatch`);
    } else {
      const shell = side.window.shell;
      if (!shell || !['light', 'dark'].includes(shell.theme)) reasons.push('Unknown observed Aux theme');
      else if (shell.theme !== side.window.nativeTheme) reasons.push('Aux/native theme mismatch');
      if (!shell || !['vertical', 'horizontal'].includes(shell.layout)) reasons.push('Unknown observed layout');
      for (const key of ['reduceMotion', 'reduceTransparency']) if (!shell || typeof shell[key] !== 'boolean' || shell[key] !== side.system[key]) reasons.push(`Shell/system ${key} mismatch`);
    }
  }
  if (before.window.nativeTheme !== after.window.nativeTheme || before.window.viewTheme !== after.window.viewTheme || before.window.backing !== after.window.backing || before.window.material !== after.window.material || !isDeepStrictEqual(before.window.shell, after.window.shell)) reasons.push('Changed appearance during capture');
  return { cell: reasons.length ? null : (before.window.nativeTheme === 'light' ? 'L' : 'D') + (before.system.reduceTransparency ? 'R' : ''), reasons: [...new Set(reasons)], reduceMotion: before.system.reduceMotion, layout: before.window.shell?.layout ?? null };
}
function captureEntry(entry, feature, indexPath, expected, privatePair) {
  require(!('cell' in entry) && !('appearanceEvidence' in entry), 'Caller appearance labels are not evidence');
  const manifestFile = artifact(entry.manifest, indexPath), manifest = manifestFile.json;
  require(manifest.features?.includes(feature.id), 'Manifest does not claim indexed feature');
  const privateCapture = manifest.kind === 'aux-private-observation';
  const candidate = identity(manifest, expected, privatePair);
  const matches = manifest.captures.filter(record => record.name === entry.captureName);
  require(matches.length === 1, 'Capture name must identify one manifest record');
  const capture = matches[0];
  require(Number.isInteger(capture.windowId) && capture.windowId > 0 && hex(capture.sha256, 64), 'Invalid manifest capture identity');
  same(capture.state, entry.state, 'capture state');
  same(capture.provenanceObservationId, entry.observationId, 'capture observation ID');
  require(typeof entry.observationId === 'string' && entry.observationId.length > 0, 'Missing observation ID');
  same(capture.provenance, entry.provenance, 'manifest provenance reference');
  const provenanceFile = artifact(capture.provenance, manifestFile.path), provenance = provenanceFile.json;
  require(provenance.schema === 1, 'Unsupported provenance schema');
  same(provenance.candidate, candidate, 'provenance candidate');
  if (privateCapture) {
    same(provenance.runtimeStatus, 'inactive-private', 'private provenance status');
    same(provenance.packagedRuntimeArtifact, privatePair.artifact, 'private provenance artifact');
  }
  const records = provenance.observations.filter(record => record.id === entry.observationId);
  require(records.length === 1, 'Provenance observation must be unique');
  const observation = records[0];
  const captureData = Object.fromEntries(Object.entries(capture).filter(([key]) => key !== 'provenance'));
  same(observation.capture, captureData, 'provenance capture record');
  const path = resolve(dirname(manifestFile.path), capture.path), bytes = readFileSync(path);
  require(bytes.length >= 33 && bytes.subarray(0, 8).toString('hex') === '89504e470d0a1a0a' && bytes.subarray(12, 16).toString() === 'IHDR', 'Capture must be a PNG with IHDR');
  same(hash(bytes), capture.sha256, 'capture digest'); same(bytes.length, capture.bytes, 'capture bytes');
  const { width, height } = PNG.sync.read(bytes);
  require(width > 0 && height > 0, 'PNG has empty dimensions');
  same(capture.pixelDimensions, { width, height }, 'capture pixel dimensions');
  require(manifest.provenanceProducers && hex(manifest.provenanceProducers.helperSha256, 64) && hex(manifest.provenanceProducers.helperSourceSha256, 64) && manifest.provenanceProducers.nativeSnapshotVersion === 1, 'Missing paired provenance producer pins');
  same(manifest.provenanceProducers, expected.provenanceProducers, 'frozen provenance producers');
  const before = {}, after = {};
  for (const [name, target] of [['before', before], ['after', after]]) for (const kind of ['system', 'window']) target[kind] = snapshot(observation[name]?.[kind], provenanceFile.path, capture, candidate, kind, privateCapture ? privatePair : undefined);
  for (const side of [before, after]) {
    same(side.system.helperSha256, manifest.provenanceProducers.helperSha256, 'paired helper executable');
    same(side.system.helperSourceSha256, manifest.provenanceProducers.helperSourceSha256, 'paired helper source');
    same(side.window.version, manifest.provenanceProducers.nativeSnapshotVersion, 'paired snapshot version');
  }
  if (privateCapture) {
    const kernels = [];
    for (const name of ['before', 'after']) {
      const kernel = artifact(observation[name]?.kernel, provenanceFile.path).json;
      same(Object.keys(kernel).sort(), ['after', 'before'], 'private kernel brackets');
      same(kernel.before, kernel.after, 'private observation original kernel generation');
      decodeWarmWindowHelperIdentity(kernel.before, { targetPid: before.window.pid, helperPid: kernel.before.helperPid, artifact: privatePair.compilerArtifact.artifact });
      same(kernel.before.targetProcessUuid, privatePair.image.imageUuid, 'private kernel original app image');
      kernels.push(kernel.before);
    }
    same(kernels[0], kernels[1], 'private capture kernel generation');
    for (const side of [before, after]) {
      same(side.system.helperSha256, privatePair.compilerArtifact.artifact.binarySha256, 'private compiled helper');
      same(side.system.helperSourceSha256, privatePair.compilerArtifact.artifact.sourceSha256, 'private compiled helper source');
      same(side.window.windowKind, 'private', 'private native window');
      same(side.window.privateNativeIdentity, privatePair.native, 'private receipt compiled identity');
    }
    privatePair.validate();
  }
  const observed = observedCell(before, after, capture);
  return { ...observed, path, bytes, width, height, capture, manifestSha256: entry.manifest.sha256, functionalStatus: manifest.error || manifest.steps.some(step => step.status !== 'passed') ? 'failed diagnostic' : 'passed steps; qualification not inferred' };
}
function writeContactSheets(input, output, privatePair) {
  const indexPath = resolve(input), indexBytes = readFileSync(indexPath), index = JSON.parse(indexBytes);
  require(index.schema === 2 && Array.isArray(index.features) && index.features.length > 0, 'Structured capture index schema2 required');
  const ledger = [], pages = [], features = new Set();
  for (const feature of index.features) {
    require(/^[A-Za-z][A-Za-z0-9]*$/.test(feature.id) && !features.has(feature.id), 'Invalid or duplicate feature'); features.add(feature.id);
    const inventory = artifact(feature.requiredStateInventory, indexPath).json;
    require(inventory.schema === 1 && inventory.feature === feature.id && Array.isArray(inventory.states) && inventory.states.length > 0 && inventory.states.every(state => typeof state === 'string' && state.length > 0) && new Set(inventory.states).size === inventory.states.length, 'Required state inventory is invalid');
    require(Array.isArray(feature.captures), 'Missing feature capture references');
    const seen = new Set(), used = new Set(), cards = new Map([...cells, 'Unknown'].map(cell => [cell, []])), records = [];
    for (const entry of feature.captures) {
      require(inventory.states.includes(entry.state), 'Capture state is not in required inventory');
      const record = captureEntry(entry, feature, indexPath, index.candidate, privatePair);
      const unique = `${entry.manifest.sha256}:${entry.captureName}`;
      require(!used.has(unique), 'Manifest capture reused'); used.add(unique);
      if (record.cell) {
        const key = `${record.cell}:${entry.state}`; require(!seen.has(key), 'Duplicate observed cell/state'); seen.add(key);
      }
      records.push({ state: entry.state, cell: record.cell, reasons: record.reasons, reduceMotion: record.reduceMotion, layout: record.layout, path: record.path, sha256: record.capture.sha256, windowId: record.capture.windowId, manifestSha256: record.manifestSha256, provenanceSha256: entry.provenance.sha256, functionalStatus: record.functionalStatus });
      cards.get(record.cell ?? 'Unknown').push(`<figure><a href="${escape(record.path)}"><img src="data:image/png;base64,${record.bytes.toString('base64')}" width="${record.width}" height="${record.height}" alt="${escape(entry.state)}"></a><figcaption>${escape(entry.state)} · ${record.width}×${record.height} · window ${record.capture.windowId}<br>${record.capture.sha256}<br>${escape(record.functionalStatus)}<br>${escape(record.reasons.join('; '))}</figcaption></figure>`);
    }
    const missing = cells.flatMap(cell => inventory.states.filter(state => !seen.has(`${cell}:${state}`)).map(state => `${cell}:${state}`));
    ledger.push({ feature: feature.id, cells: seen.size, missing, records, requiredStateInventorySha256: feature.requiredStateInventory.sha256, motionGeometryAndOwnerApproval: 'pending independent evidence and inspection', visualApproval: 'pending reviewer inspection' });
    pages.push([`${feature.id}.html`, `<!doctype html><meta charset="utf-8"><title>Aux ${escape(feature.id)} diagnostic contact sheet</title><style>body{margin:24px;font:14px system-ui}main{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px}section{min-width:0}img{width:100%;height:auto}figure{margin:0}figcaption{overflow-wrap:anywhere}</style><h1>Aux · ${escape(feature.id)}</h1><p>Original native images linked. Appearance counts are derived from paired producer observations; static sheets do not prove motion, geometry or qualification. Reviewer and owner approval pending.</p><p>Missing: ${escape(missing.join(', ') || 'none in indexed appearance/state inventory')}</p><main>${[...cards].map(([cell, images]) => `<section><h2>${cell}</h2>${images.join('')}</section>`).join('')}</main>`]);
  }
  const coverage = { schema: 2, candidate: index.candidate, sourceIndexSha256: hash(indexBytes), features: ledger };
  const destination = resolve(output); mkdirSync(destination, { recursive: true });
  for (const [name, html] of pages) writeFileSync(join(destination, name), html);
  writeFileSync(join(destination, 'coverage.json'), `${JSON.stringify(coverage, null, 2)}\n`);
  return coverage;
}
export function buildContactSheets(input, output, { privateAdmission } = {}) {
  const pair = privateAdmission === undefined ? undefined : retainPackagedRuntimePair(privateAdmission);
  try { return writeContactSheets(input, output, pair); }
  finally { pair?.release(); }
}
if (process.argv[1] && existsSync(process.argv[1]) && realpathSync(fileURLToPath(import.meta.url)) === realpathSync(process.argv[1])) {
  const [input, output, admissionPath, ...extra] = process.argv.slice(2);
  require(!extra.length, 'Unexpected QA arguments');
  if (!input || !output) throw new Error('Usage: node scripts/design-qa.mjs <capture-index.json> <output-directory>');
  const coverage = buildContactSheets(input, output, admissionPath ? { privateAdmission: JSON.parse(readFileSync(resolve(admissionPath), 'utf8')) } : {});
  console.log(`Wrote ${coverage.features.length} diagnostic feature sheets; final visual approval remains pending.`);
  if (coverage.features.some(feature => feature.missing.length)) process.exitCode = 1;
}
