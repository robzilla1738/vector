import assert from 'node:assert/strict';
import { StringDecoder } from 'node:string_decoder';
import { normalizeNativeAppearance, normalizePipAppearance } from './appearance-provenance.mjs';

export function createAppearanceStream(options) {
  return createRecordStream(options, 'AUX_NATIVE_APPEARANCE_V1 ', normalizeNativeAppearance, 'observedAtUnixMs');
}
export function createPipAppearanceStream(options) {
  return createRecordStream(options, 'AUX_NATIVE_PIP_APPEARANCE_V1 ', normalizePipAppearance, 'nativeUnixMs');
}

/** Direct-child stderr only. Inputs are transport bytes, never reconstructed logs. */
function createRecordStream({ pid, generation, candidate, maxRecords = 4000, maxLineBytes = 16384, maxBytes = 2 * 1024 * 1024 }, prefix, normalize, timeKey) {
  assert.ok(Number.isInteger(pid) && pid > 0 && Number.isInteger(generation) && generation > 0, 'Missing direct-child generation');
  for (const [value, limit] of [[maxRecords, 4000], [maxLineBytes, 16384], [maxBytes, 2 * 1024 * 1024]])
    assert.ok(Number.isInteger(value) && value > 0 && value <= limit, 'Invalid stream bound');
  candidate = structuredClone(candidate);
  let decoder = new StringDecoder('utf8'), partial = '', bytes = 0, count = 0, sequence = 0, disposed = false, failure;
  const pending = new Map(), seen = new Set();
  let discovery;
  function fail(error) {
    failure ??= error;
    for (const waiter of pending.values()) { clearTimeout(waiter.timer); waiter.reject(failure); }
    pending.clear(); partial = '';
    if (discovery) { clearTimeout(discovery.timer); discovery.reject(failure); discovery = undefined; }
  }
  function line(text) {
    if (!text.startsWith(prefix)) return; // Other browser diagnostics have no authority.
    if (++count > maxRecords) throw new Error('Native appearance record limit exhausted');
    const rawJson = text.slice(prefix.length), raw = JSON.parse(rawJson);
    const receivedAt = new Date().toISOString();
    assert.deepEqual(Object.keys(raw.frame ?? {}).sort(), ['height', 'width', 'x', 'y'], 'Unexpected native frame fields');
    normalize(rawJson, { candidate, targetPid: pid, windowId: raw.windowId,
      startedAt: new Date(0).toISOString(), completedAt: receivedAt });
    const key = `${raw.windowId}:${raw[timeKey]}`;
    assert.ok(!seen.has(key), 'Duplicate native appearance observation'); seen.add(key);
    const waiter = pending.get(raw.windowId);
    const recordSequence = ++sequence;
    if (discovery && recordSequence > discovery.sequence && raw[timeKey] >= discovery.notBefore &&
        raw.ownerPageId === discovery.ownerPageId && raw.surfaceKind === discovery.surfaceKind) {
      const ready = discovery; discovery = undefined; clearTimeout(ready.timer); ready.resolve(rawJson);
    }
    if (waiter && recordSequence > waiter.sequence && raw[timeKey] >= waiter.notBefore) {
      pending.delete(raw.windowId); clearTimeout(waiter.timer); waiter.resolve(rawJson);
    }
  }
  return {
    write(chunk, { pid: sourcePid, generation: sourceGeneration } = {}) {
      if (disposed || failure) return;
      try {
        assert.equal(sourcePid, pid, 'Wrong stderr child PID'); assert.equal(sourceGeneration, generation, 'Wrong stderr generation');
        assert.ok(Buffer.isBuffer(chunk), 'Appearance stream needs actual stderr bytes');
        bytes += chunk.length; assert.ok(bytes <= maxBytes, 'Appearance stderr byte limit exhausted');
        partial += decoder.write(chunk);
        let end;
        while ((end = partial.indexOf('\n')) !== -1) {
          const text = partial.slice(0, end); partial = partial.slice(end + 1);
          assert.ok(Buffer.byteLength(text) <= maxLineBytes, 'Appearance stderr line overflow');
          line(text);
        }
        assert.ok(Buffer.byteLength(partial) <= maxLineBytes, 'Appearance stderr partial line overflow');
      } catch (error) { fail(error); }
    },
    observe({ windowId, notBefore, timeoutMs = 5000 }) {
      if (failure || disposed) return Promise.reject(failure ?? new Error('Appearance stream disposed'));
      try {
        assert.ok(Number.isInteger(windowId) && windowId > 0 && typeof notBefore === 'string' && Number.isFinite(Date.parse(notBefore)), 'Invalid owned stream selection');
        assert.ok(Number.isInteger(timeoutMs) && timeoutMs > 0 && timeoutMs <= 10000, 'Invalid bounded observation wait');
        assert.ok(!discovery && !pending.has(windowId), 'Ambiguous concurrent observation for window');
      } catch (error) { return Promise.reject(error); }
      return new Promise((resolve, reject) => {
        const waiter = { resolve, reject, sequence, notBefore: Date.parse(notBefore), timer: undefined };
        waiter.timer = setTimeout(() => { pending.delete(windowId); reject(new Error('No fresh native appearance record')); }, timeoutMs);
        pending.set(windowId, waiter);
      });
    },
    discover({ ownerPageId, surfaceKind, notBefore, timeoutMs = 5000 }) {
      if (failure || disposed) return Promise.reject(failure ?? new Error('Appearance stream disposed'));
      try {
        assert.equal(prefix, 'AUX_NATIVE_PIP_APPEARANCE_V1 ', 'Discovery is private child-only');
        assert.ok(typeof ownerPageId === 'string' && ownerPageId.length > 0 && ownerPageId.length <= 512 &&
          ['video-pip', 'document-pip'].includes(surfaceKind) && typeof notBefore === 'string' && Number.isFinite(Date.parse(notBefore)), 'Invalid owned child discovery');
        assert.ok(Number.isInteger(timeoutMs) && timeoutMs > 0 && timeoutMs <= 30000, 'Invalid discovery deadline');
        assert.ok(!discovery && pending.size === 0, 'Concurrent child discovery is ambiguous');
      } catch (error) { return Promise.reject(error); }
      return new Promise((resolve, reject) => {
        const waiter = { ownerPageId, surfaceKind, notBefore: Date.parse(notBefore), sequence, resolve, reject, timer: undefined };
        waiter.timer = setTimeout(() => { discovery = undefined; reject(new Error('No fresh owned child discovery record')); }, timeoutMs);
        discovery = waiter;
      });
    },
    reset(next) {
      assert.ok(!disposed, 'Disposed appearance stream cannot restart');
      assert.ok(Number.isInteger(next.pid) && next.pid > 0 && Number.isInteger(next.generation) && next.generation > generation, 'Restart requires newer owned generation');
      fail(new Error('Appearance child restarted'));
      pid = next.pid; generation = next.generation; candidate = structuredClone(next.candidate);
      decoder = new StringDecoder('utf8'); partial = ''; bytes = 0; count = 0; sequence = 0; failure = undefined; seen.clear();
    },
    dispose(reason = new Error('Appearance child exited')) { disposed = true; fail(reason); },
  };
}
