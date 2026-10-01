import { performance } from 'node:perf_hooks';
import { setTimeout as delay } from 'node:timers/promises';

export function createUntil(signal) {
  return async (name, predicate, options = 10000) => {
    const value = typeof options === 'number' ? { timeoutMs: options } : options;
    if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).some(key => !['timeoutMs', 'intervalMs'].includes(key)))
      throw new Error('Invalid journey polling options');
    const timeoutMs = value.timeoutMs ?? 10000, intervalMs = value.intervalMs ?? 50;
    if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 120000 || !Number.isInteger(intervalMs) || intervalMs < 1 || intervalMs > 1000 || typeof predicate !== 'function')
      throw new Error('Invalid bounded journey polling');
    const end = performance.now() + timeoutMs;
    while (performance.now() < end) {
      signal.throwIfAborted();
      const result = await predicate();
      signal.throwIfAborted();
      if (result) return result;
      const remaining = end - performance.now();
      if (remaining > 0) await delay(Math.min(intervalMs, remaining), undefined, { signal });
    }
    throw new Error(`Timed out: ${name}`);
  };
}
