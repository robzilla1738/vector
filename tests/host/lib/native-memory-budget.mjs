import assert from 'node:assert/strict';
import { collectNativeMemoryWorkloadTrials } from './native-memory-workload-collector.mjs';
import { validateAppearanceCandidate } from './appearance-provenance.mjs';

// Only derived BigInts change representation. Original native strings, raw
// direct-child envelopes and every failed observation remain byte-for-byte.
const serializable = value => JSON.parse(JSON.stringify(value, (_key, field) =>
  typeof field === 'bigint' ? field.toString() : field));

export async function collectNativeMemoryBudget(options, candidate) {
  const report = { schema: 1, metric: 'process-memory',
    endpoint: 'original launch-owned process inventory and bracketed kernel physical footprints',
    candidate: structuredClone(candidate), mode: options.mode, attempts: [], status: 'running',
    stockComparison: 'required separately with the same-tag ten-tab stock workload' };
  try {
    validateAppearanceCandidate(candidate);
    const collection = await collectNativeMemoryWorkloadTrials(options);
    report.attempts = serializable(collection.trials);
    for (const trial of collection.trials) {
      assert.deepEqual(trial.observation.before.identity.runtime, candidate.productIdentity);
      for (const field of ['sourceCommit', 'buildId', 'manifestHash'])
        assert.equal(trial.observation.before.identity.native[field], candidate.native[field], 'Report candidate differs from original native pair');
    }
    const maximum = field => collection.trials.reduce((highest, trial) =>
      trial.decoded[field] > highest ? trial.decoded[field] : highest, 0n);
    report.maximumBytes = { shell: String(maximum('shellMaxBytes')),
      runtime: String(maximum('runtimeMaxBytes')), allProcesses: String(maximum('totalConservativeBytes')) };
    report.budgetBytes = { shell: 150_000_000, runtime: options.mode === 'idle' ? 120_000_000 : 250_000_000 };
    assert.equal(collection.trials.length, 20, 'All twenty original AC trials are required');
    for (const field of ['shell', 'runtime']) assert.ok(BigInt(report.maximumBytes[field]) <= BigInt(report.budgetBytes[field]),
      `${field} physical footprint exceeds its ${options.mode} budget`);
    report.status = 'measured'; return report;
  } catch (error) {
    if (error.trials) report.attempts = serializable(error.trials);
    if (error.cleanupFailure) report.cleanupFailure = error.cleanupFailure.message;
    report.status = 'failed'; report.error = error.message;
    const failure = new Error(`Native memory budget failed: ${error.message}`, { cause: error });
    failure.report = report; throw failure;
  }
}
