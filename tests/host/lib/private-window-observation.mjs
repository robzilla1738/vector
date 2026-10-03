import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { normalizeNativeAppearance } from './appearance-provenance.mjs';

export const privateWindowPrefix = 'AUX_NATIVE_PRIVATE_WINDOW_V1 ';

/** The native producer, not expected labels, supplies identity. This decoder
 * does not attest a compiler artifact or pretend an inactive runtime answered. */
export function normalizePrivateWindowObservation(line, options) {
  assert.equal(typeof line, 'string');
  assert.ok(Buffer.byteLength(line) <= 8192 && line.startsWith(privateWindowPrefix) && line.endsWith('\n'));
  const raw = JSON.parse(line.slice(privateWindowPrefix.length, -1));
  assert.equal(line, privateWindowPrefix + JSON.stringify(raw) + '\n', 'Noncanonical or duplicate private receipt fields');
  assert.deepEqual(Object.keys(raw).sort(), ['appearance', 'native', 'producer', 'runtimeStatus', 'version']);
  assert.equal(raw.producer, 'aux-native-private-window-observation');
  assert.equal(raw.version, 1);
  assert.equal(raw.runtimeStatus, 'inactive-private');
  assert.deepEqual(Object.keys(raw.native ?? {}).sort(), ['buildId', 'sourceCommit']);
  assert.equal(raw.native.sourceCommit, options.candidate.native.sourceCommit, 'Foreign compiled native source');
  assert.equal(raw.native.buildId, options.candidate.native.buildId, 'Foreign compiled native build');
  const parts = raw.native.buildId.split('+');
  assert.equal(parts.length, 3);
  assert.ok(parts[0].length > 0 && parts[0].length <= 128);
  assert.equal(parts[1], options.candidate.native.manifestHash);
  assert.equal(parts[2], raw.native.sourceCommit);
  assert.deepEqual(Object.keys(raw.appearance?.frame ?? {}).sort(), ['height', 'width', 'x', 'y']);
  const window = normalizeNativeAppearance(JSON.stringify(raw.appearance), options);
  assert.equal(window.windowKind, 'private', 'Receipt is not the observed private window');
  return Object.freeze({ producer: raw.producer, version: raw.version,
    native: Object.freeze({ ...raw.native, manifestHash: parts[1] }), runtimeStatus: raw.runtimeStatus,
    window, raw: Object.freeze({ line, sha256: createHash('sha256').update(line).digest('hex') }) });
}
