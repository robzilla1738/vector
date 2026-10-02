import assert from 'node:assert/strict';
import { validateNativeProcessMemory, validateNativeSubagentPreparation } from './native-process-memory.mjs';
import { assertSubagentMemoryBracket } from './native-subagent-memory-workload.mjs';

const power = reading => assert.match(reading, /Now drawing from 'AC Power'/, 'Original native AC reading required');
function pagesSnapshot(pages, ids) {
  assert.equal(ids.length, 10); assert.equal(new Set(ids).size, 10, 'Ten distinct retained human tabs required');
  return ids.map(pageId => {
    const matches = pages.filter(page => page.pageId === pageId);
    assert.equal(matches.length, 1, 'Retained human tab missing or ambiguous');
    const page = matches[0]; assert.ok(typeof page.sessionId === 'string' && page.sessionId.length > 0);
    assert.ok(Number.isSafeInteger(page.documentEpoch) && page.documentEpoch >= 0, 'Current retained document required');
    assert.ok(typeof page.url === 'string' && /^https?:\/\//.test(page.url), 'Genuine fixture website required');
    return { pageId, sessionId: page.sessionId, documentEpoch: page.documentEpoch, url: page.url };
  });
}
function sourcePair(observation) {
  assert.ok(observation.before?.identity && observation.after?.identity, 'Original paired identities required');
  assert.deepEqual(observation.after.identity, observation.before.identity, 'Source pair changed during observation');
  assert.equal(observation.before.identity.runtime?.dirty, false);
  assert.match(observation.before.identity.runtime?.commit ?? '', /^[a-f0-9]{40}$/);
  assert.equal(observation.before.identity.native?.sourceCommit, observation.before.identity.runtime.commit);
  assert.match(observation.before.identity.native?.manifestHash ?? '', /^[a-f0-9]{64}$/);
  power(observation.before.power); power(observation.after.power);
}

/** Native reader supplies original direct-child evidence. Refusal stays native;
 * the original ready record alone is unwrapped for the genuine launch helper.
 */
export function createNativeWorkloadPreparationAdapter(reader) {
  assert.equal(typeof reader?.readPreparation, 'function');
  const observations = [];
  return {
    observations,
    async readNativePreparation() {
      try {
        const observation = await reader.readPreparation(); observations.push(observation);
        sourcePair(observation);
        const row = validateNativeSubagentPreparation(observation.raw);
        assert.deepEqual(row, observation.native, 'Preparation differs from original native bytes');
        return row.status === 'refused' ? row : row.preparation;
      } catch (error) {
        if (error.observation && !observations.includes(error.observation)) observations.push(error.observation);
        error.preparationObservations = observations; throw error;
      }
    },
  };
}

/** Twenty fresh observations, without transforming a compact native record into
 * an invented legacy record. All raw envelopes, kernels and failed trials stay
 * in the result/error. Stock matching and physical qualification remain separate.
 */
export async function collectNativeMemoryWorkloadTrials({ reader, browserPid, mode, workload, idlePageIds, readPages, signal }) {
  const trials = []; let failure, retainedPages;
  try {
    assert.ok(mode === 'idle' || mode === 'executing');
    assert.equal(typeof reader?.sample, 'function'); assert.equal(typeof readPages, 'function');
    assert.ok(signal instanceof AbortSignal);
    if (mode === 'executing') {
      assert.ok(workload?.expected && typeof workload.cleanup === 'function');
      assert.deepEqual(workload.idlePageIds, idlePageIds, 'Actual workload retained tabs differ');
    } else assert.equal(workload, undefined, 'Idle cannot borrow a running workload');
    for (let trial = 1; trial <= 20; trial++) {
      const evidence = { trial, mode, status: 'running' }; trials.push(evidence);
      assert.ok(!signal.aborted, 'Original journey deadline reached');
      evidence.idleBefore = pagesSnapshot(await readPages(), idlePageIds);
      if (retainedPages) assert.deepEqual(evidence.idleBefore, retainedPages, 'Retained human tabs changed between trials');
      else retainedPages = evidence.idleBefore;
      try { evidence.observation = await reader.sample(); }
      catch (error) { evidence.observation = error.observation; throw error; }
      const observation = evidence.observation; sourcePair(observation);
      const decoded = validateNativeProcessMemory(observation.raw, browserPid);
      assert.deepEqual(decoded.row, observation.native, 'Sample differs from original native bytes');
      assert.deepEqual(decoded, observation.decoded, 'Decoded kernel/workload evidence changed');
      evidence.decoded = decoded;
      if (mode === 'executing') {
        evidence.bracket = assertSubagentMemoryBracket({ workloadBefore: decoded.workload.before, workloadAfter: decoded.workload.after }, workload.expected);
        for (const child of evidence.bracket.before.children) {
          const source = evidence.idleBefore.find(page => page.pageId === child.sourcePageId);
          assert.ok(source, 'Execution source is not a retained human tab');
          assert.equal(child.sourceSessionId, source.sessionId, 'Native source attachment differs from retained tab');
          assert.equal(child.sourceDocumentEpoch, source.documentEpoch, 'Native source document differs from retained tab');
        }
      } else {
        assert.equal(decoded.workload.before.status, 'idle'); assert.equal(decoded.workload.after.status, 'idle');
        assert.equal(decoded.workload.before.activeExecutions, 0); assert.equal(decoded.workload.after.activeExecutions, 0);
        evidence.bracket = decoded.workload;
      }
      evidence.idleAfter = pagesSnapshot(await readPages(), idlePageIds);
      assert.deepEqual(evidence.idleAfter, evidence.idleBefore, 'Retained fixture document/attachment changed');
      assert.ok(!signal.aborted, 'Original journey deadline reached');
      evidence.status = 'sampled';
    }
  } catch (error) { failure = error; if (trials.length) { trials.at(-1).status = 'failed'; trials.at(-1).error = error.message; } }
  let cleanupFailure;
  if (typeof workload?.cleanup === 'function') { try { await workload.cleanup(); } catch (error) { cleanupFailure = error; } }
  if (failure || cleanupFailure) {
    const error = new AggregateError([failure, cleanupFailure].filter(Boolean), 'Native memory workload collection failed');
    error.trials = trials; error.mode = mode; error.cleanupFailure = cleanupFailure; throw error;
  }
  return { mode, trials };
}
