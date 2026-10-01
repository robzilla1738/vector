import assert from 'node:assert/strict';
import { StringDecoder } from 'node:string_decoder';
import { normalizeNativeAppearance } from './appearance-provenance.mjs';

const prefix = 'AUX_NATIVE_APPEARANCE_V1 ';

/** Direct-child stderr only. Inputs are transport bytes, never reconstructed logs. */
export function createAppearanceStream({ pid, generation, candidate, maxRecords = 4000, maxLineBytes = 16384, maxBytes = 2 * 1024 * 1024 }) {
  assert.ok(Number.isInteger(pid) && pid > 0 && Number.isInteger(generation) && generation > 0, 'Missing direct-child generation');
  for (const [value, limit] of [[maxRecords, 4000], [maxLineBytes, 16384], [maxBytes, 2 * 1024 * 1024]])
    assert.ok(Number.isInteger(value) && value > 0 && value <= limit, 'Invalid stream bound');
  candidate = structuredClone(candidate);
  let decoder = new StringDecoder('utf8'), partial = '', bytes = 0, count = 0, sequence = 0, disposed = false, failure;
  const pending = new Map(), seen = new Set();
  function fail(error) {
    failure ??= error;
    for (const waiter of pending.values()) { clearTimeout(waiter.timer); waiter.reject(failure); }
    pending.clear(); partial = '';
  }
  function line(text) {
    if (!text.startsWith(prefix)) return; // Other browser diagnostics have no authority.
    if (++count > maxRecords) throw new Error('Native appearance record limit exhausted');
    const rawJson = text.slice(prefix.length), raw = JSON.parse(rawJson);
    const receivedAt = new Date().toISOString();
    assert.deepEqual(Object.keys(raw.frame ?? {}).sort(), ['height', 'width', 'x', 'y'], 'Unexpected native frame fields');
    normalizeNativeAppearance(rawJson, { candidate, targetPid: pid, windowId: raw.windowId,
      startedAt: new Date(0).toISOString(), completedAt: receivedAt });
    const key = `${raw.windowId}:${raw.observedAtUnixMs}`;
    assert.ok(!seen.has(key), 'Duplicate native appearance observation'); seen.add(key);
    const waiter = pending.get(raw.windowId);
    const recordSequence = ++sequence;
    if (waiter && recordSequence > waiter.sequence && raw.observedAtUnixMs >= waiter.notBefore) {
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
        assert.ok(!pending.has(windowId), 'Ambiguous concurrent observation for window');
      } catch (error) { return Promise.reject(error); }
      return new Promise((resolve, reject) => {
        const waiter = { resolve, reject, sequence, notBefore: Date.parse(notBefore), timer: undefined };
        waiter.timer = setTimeout(() => { pending.delete(windowId); reject(new Error('No fresh native appearance record')); }, timeoutMs);
        pending.set(windowId, waiter);
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
