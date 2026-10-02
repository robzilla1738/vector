import { StringDecoder } from 'node:string_decoder';
import { validateStartupPresentation } from './native-startup-protocol.mjs';
const prefix = 'AUX_NATIVE_STARTUP_V1 ';
/** Incremental original browser stderr only. Unknown native diagnostics are
 * bounded and retained by the owner channel; there is no logfile fallback. */
export function createStartupNativeStream() {
  const decoder = new StringDecoder('utf8');
  let tail = '', total = 0, original, failure, ended = false;
  let resolveRaw, rejectRaw;
  const pending = new Promise((resolve, reject) => { resolveRaw = resolve; rejectRaw = reject; });
  pending.catch(() => {});
  function refuse(error) { failure ??= error; rejectRaw(failure); }
  return Object.freeze({
    push(chunk) {
      if (ended) throw new Error('Retired startup native stream');
      if (!Buffer.isBuffer(chunk)) throw new Error('Original startup stderr bytes required');
      total += chunk.length;
      if (total > 4 * 1024 * 1024 || chunk.includes(0)) { refuse(new Error('Native startup stream overflow')); throw failure; }
      tail += decoder.write(chunk);
      for (;;) {
        const end = tail.indexOf('\n'); if (end < 0) break;
        const line = tail.slice(0, end + 1); tail = tail.slice(end + 1);
        if (Buffer.byteLength(line) > 16384) { refuse(new Error('Native startup line overflow')); continue; }
        if (!line.startsWith(prefix)) continue;
        if (original) { refuse(new Error('Repeated original startup native record')); continue; }
        original = line;
        if (!failure) resolveRaw(line);
      }
      if (Buffer.byteLength(tail) > 16384) refuse(new Error('Unterminated native startup line overflow'));
      if (failure) throw failure;
    },
    finish() {
      if (ended) return;
      ended = true; tail += decoder.end();
      if (tail.startsWith(prefix) || !original) refuse(new Error('Missing or truncated native startup record'));
    },
    refuse,
    async measured(launch, helper) {
      await pending;
      if (failure) throw failure;
      return validateStartupPresentation(original, launch, helper);
    },
    assertComplete() {
      if (!ended || failure || !original) throw failure ?? new Error('Unfinished startup native stream');
    },
  });
}
