import { validateStockStartupPresentation, stockStartupPrefix } from './native-stock-startup-protocol.mjs';

/** Only original direct-child stderr supplied by the retained helper channel.
 * A resolved raw line is not a measured result; original launch and helper pins
 * must pass the strict Stock decoder. Keep late duplicates/cleanup refusals. */
export function createStockStartupNativeStream() {
  const decoder = new TextDecoder('utf-8', { fatal: true });
  let tail = '', total = 0, original, failure, ended = false;
  let resolveRaw, rejectRaw;
  const pending = new Promise((resolve, reject) => { resolveRaw = resolve; rejectRaw = reject; });
  pending.catch(() => {});
  function refuse(error) {
    failure ??= error instanceof Error ? error : new Error(String(error));
    rejectRaw(failure);
  }
  return Object.freeze({
    push(chunk) {
      if (ended) throw new Error('Retired original Stock startup stream');
      try {
        if (!Buffer.isBuffer(chunk)) throw new Error('Original Stock stderr bytes required');
        total += chunk.length;
        if (total > 4 * 1024 * 1024 || chunk.includes(0)) throw new Error('Stock native stderr overflow or NUL');
        tail += decoder.decode(chunk, { stream: true });
        for (;;) {
          const end = tail.indexOf('\n'); if (end < 0) break;
          const raw = tail.slice(0, end + 1); tail = tail.slice(end + 1);
          if (Buffer.byteLength(raw) > 16384) throw new Error('Stock native line overflow');
          if (!raw.startsWith(stockStartupPrefix)) continue;
          if (original) throw new Error('Repeated original Stock startup record');
          original = raw;
          resolveRaw(raw);
        }
        if (Buffer.byteLength(tail) > 16384) throw new Error('Unterminated Stock native line overflow');
        if (failure) throw failure;
      } catch (error) { refuse(error); throw failure; }
    },
    finish() {
      if (ended) return;
      ended = true;
      try {
        tail += decoder.decode();
        if (tail.startsWith(stockStartupPrefix) || !original) throw new Error('Missing or truncated original Stock startup record');
        if (failure) throw failure;
      } catch (error) { refuse(error); }
    },
    refuse,
    async measured(launch, helper) {
      await pending;
      if (failure) throw failure;
      return validateStockStartupPresentation(original, launch, helper);
    },
    assertComplete() {
      if (!ended || failure || !original) throw failure ?? new Error('Unfinished original Stock startup stream');
    },
  });
}
