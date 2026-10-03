import assert from 'node:assert/strict';
import { normalizePrivateWindowObservation, privateWindowPrefix } from './private-window-observation.mjs';

/** Direct-child stderr only. All identities are bound by the original launcher;
 * no log-file recovery, caller-selected PID, restart or guessed window route. */
export function createPrivateWindowStream({ pid, generation, candidate }) {
  assert.ok(Number.isInteger(pid) && pid > 0 && Number.isInteger(generation) && generation > 0);
  const startedAt = new Date().toISOString();
  let buffer = '', bytes = 0, records = 0, retired, waiting;
  function retire(error) {
    if (retired) return;
    retired = error; buffer = '';
    if (waiting) { clearTimeout(waiting.timer); waiting.reject(error); waiting = undefined; }
  }
  function wait(windowId, notBefore, timeoutMs) {
    if (retired) return Promise.reject(retired);
    try {
      assert.ok(!waiting, 'Overlapping private observation');
      const now = Date.now(), start = Date.parse(notBefore);
      assert.ok(Number.isFinite(start) && start >= Date.parse(startedAt) && start <= now && now - start <= 5000);
      assert.ok(Number.isInteger(timeoutMs) && timeoutMs > 0 && timeoutMs <= 5000);
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => { waiting = undefined; reject(new Error('No fresh original private native receipt')); }, timeoutMs);
        waiting = { windowId, notBefore: start, timer, resolve, reject };
      });
    } catch (error) { return Promise.reject(error); }
  }
  return Object.freeze({
    write(chunk, source) {
      if (retired) return;
      try {
        assert.equal(source?.pid, pid); assert.equal(source?.generation, generation);
        assert.ok(Buffer.isBuffer(chunk)); bytes += chunk.length;
        assert.ok(bytes <= 4 * 1024 * 1024, 'Private stderr byte budget exhausted');
        buffer += chunk.toString('utf8');
        let newline;
        while ((newline = buffer.indexOf('\n')) !== -1) {
          const line = buffer.slice(0, newline + 1); buffer = buffer.slice(newline + 1);
          assert.ok(Buffer.byteLength(line) <= 16384, 'Oversized direct-child stderr line');
          if (!line.startsWith(privateWindowPrefix)) continue;
          assert.ok(++records <= 4000, 'Private receipt budget exhausted');
          // Decode using the actual native identity for preliminary window lookup;
          // the decoder then validates all original candidate/native fields.
          const value = JSON.parse(line.slice(privateWindowPrefix.length));
          const receipt = normalizePrivateWindowObservation(line, { candidate, targetPid: pid,
            windowId: value.appearance?.windowId, startedAt, completedAt: new Date().toISOString() });
          if (waiting && (waiting.windowId === null || receipt.window.windowId === waiting.windowId) &&
              Date.parse(receipt.window.observedAt) >= waiting.notBefore) {
            const current = waiting; waiting = undefined; clearTimeout(current.timer); current.resolve(receipt);
          }
        }
        assert.ok(Buffer.byteLength(buffer) <= 16384, 'Unterminated direct-child stderr line');
      } catch (error) { retire(error); }
    },
    discover() { return wait(null, new Date().toISOString(), 5000); },
    observe({ windowId, notBefore, timeoutMs = 5000 }) {
      if (!Number.isInteger(windowId) || windowId <= 0) return Promise.reject(new Error('Missing original private window'));
      return wait(windowId, notBefore, timeoutMs);
    },
    dispose() { retire(new Error('Original private child observation retired')); },
  });
}
