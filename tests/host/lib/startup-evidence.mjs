const fields = {
  'descriptor-poll': ['descriptorExists'],
  'descriptor-json': ['valid'],
  'peer-response': ['status', 'ready', 'serviceMatches', 'nonceMatches', 'pidMatches', 'instanceMatches', 'startedAtMatches', 'schemaMatches'],
  'peer-unavailable': ['aborted'],
  'authenticated-descriptor-ready': [],
  'native-session-poll': ['workspaceAvailable', 'nativeConnected'],
};

/** Only explicit startup facts leave this owned disposable launch. */
export function createStartupTrace(now = () => performance.now()) {
  const started = now();
  const samples = [{ phase: 'launch-started', firstElapsedMs: 0, latestElapsedMs: 0, count: 1 }];
  let previous = '';
  return {
    record(phase, facts = {}) {
      if (!Object.hasOwn(fields, phase)) throw new Error('Unknown startup phase');
      const safe = {};
      for (const key of fields[phase]) {
        const value = facts[key];
        if (key === 'status' ? !Number.isInteger(value) || value < 100 || value > 599 : typeof value !== 'boolean')
          throw new Error('Invalid startup fact');
        safe[key] = value;
      }
      const elapsed = Math.round(now() - started);
      if (!Number.isFinite(elapsed) || elapsed < samples.at(-1).latestElapsedMs) throw new Error('Startup clock must be monotonic');
      const identity = JSON.stringify([phase, safe]);
      if (identity === previous) {
        const last = samples.at(-1);
        last.latestElapsedMs = elapsed;
        last.count += 1;
      } else {
        samples.push({ phase, firstElapsedMs: elapsed, latestElapsedMs: elapsed, count: 1, ...safe });
        // Keep the actual launch origin plus the most recent fifteen transitions.
        if (samples.length > 16) samples.splice(1, 1);
        previous = identity;
      }
    },
    snapshot(owned) {
      return { phase: 'before-owned-cleanup', samples: samples.map(sample => ({ ...sample })),
        process: { pid: owned.pid, generation: owned.generation, launchKind: owned.launchKind,
          exitCode: owned.exitCode, signal: owned.signal, spawnErrorPresent: !!owned.spawnError,
          exitStatusAvailable: owned.exitStatusAvailable } };
    },
  };
}
