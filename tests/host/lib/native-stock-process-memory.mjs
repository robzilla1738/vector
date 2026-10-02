import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { validateNativeProcessMemory } from './native-process-memory.mjs';

const integer = (value, positive = true) => {
  assert.ok(typeof value === 'string' && /^(0|[1-9][0-9]{0,19})$/.test(value));
  const number = BigInt(value); assert.ok(number <= 18446744073709551615n && (!positive || number > 0n)); return number;
};
const pid = value => assert.ok(Number.isInteger(value) && value > 0 && value <= 0x7fffffff);
const nonce = value => assert.match(value, /^(?!0{32}$)[a-f0-9]{32}$/i);
const keys = (row, expected) => assert.deepEqual(Object.keys(row).sort(), expected.sort());

export function validateNativeStockProcessMemory(raw, browserPid, expectedChromium) {
  assert.ok(typeof raw === 'string' && Buffer.byteLength(raw) <= 12288);
  const row = JSON.parse(raw); assert.equal(row.producer, 'aux-native-stock-process-memory'); assert.equal(row.version, 1);
  if (row.status === 'refused') { keys(row, ['producer', 'version', 'status']); return { row }; }
  assert.equal(row.status, 'sampled');
  keys(row, ['producer', 'version', 'status', 'auxShellEnabled', 'chromiumVersion', 'chromiumLastChange', 'windowId', 'requestNonce', 'sampleSequence', 'sampleStartUs', 'sampleEndUs', 'tabs', 'processes']);
  assert.equal(row.auxShellEnabled, false, 'Stock must compile without the Aux shell');
  assert.match(expectedChromium?.version ?? '', /^\d+\.\d+\.\d+\.\d+$/); assert.ok(typeof expectedChromium.lastChange === 'string' && expectedChromium.lastChange.length > 0);
  assert.equal(row.chromiumVersion, expectedChromium.version); assert.equal(row.chromiumLastChange, expectedChromium.lastChange);
  pid(browserPid); pid(row.windowId); nonce(row.requestNonce); integer(row.sampleSequence);
  const start = integer(row.sampleStartUs), end = integer(row.sampleEndUs);
  assert.ok(end >= start && end - start <= 5000000n);
  assert.ok(Array.isArray(row.tabs) && row.tabs.length === 10);
  const documents = new Set();
  for (const tab of row.tabs) {
    keys(tab, ['documentReceipt', 'url']); nonce(tab.documentReceipt); assert.ok(!documents.has(tab.documentReceipt)); documents.add(tab.documentReceipt);
    assert.ok(typeof tab.url === 'string' && Buffer.byteLength(tab.url) <= 512 && /^https?:\/\//.test(tab.url));
  }
  assert.ok(Array.isArray(row.processes) && row.processes.length >= 3 && row.processes.length <= 32);
  const ids = new Set(), hosts = new Set(), roles = new Map(), processes = [];
  for (const tuple of row.processes) {
    assert.ok(Array.isArray(tuple) && tuple.length === 7);
    const [processPid, role, type, hostIds, uuid, processStart, readings] = tuple;
    pid(processPid); assert.ok(!ids.has(processPid)); ids.add(processPid);
    assert.ok(['browser', 'renderer', 'gpu', 'browser-child'].includes(role), 'Stock cannot invent a shell/runtime role');
    assert.ok(Number.isInteger(type) && type >= 1 && type < 22); roles.set(role, (roles.get(role) ?? 0) + 1);
    assert.ok(Array.isArray(hostIds));
    if (role === 'browser') { assert.equal(processPid, browserPid); assert.equal(type, 2); assert.deepEqual(hostIds, []); }
    else {
      assert.ok(hostIds.length > 0 && hostIds.length <= 128); assert.deepEqual([...hostIds].sort((a, b) => a - b), hostIds);
      for (const host of hostIds) { pid(host); assert.ok(!hosts.has(host)); hosts.add(host); }
      if (role === 'renderer') assert.equal(type, 3); else if (role === 'gpu') assert.equal(type, 9); else assert.ok(![2, 3, 9].includes(type));
    }
    nonce(uuid); integer(processStart); assert.ok(Array.isArray(readings) && readings.length === 2);
    let previous = 0n, minBytes, maxBytes = 0n;
    for (const reading of readings) {
      assert.ok(Array.isArray(reading) && reading.length === 3);
      const bytes = integer(reading[0]), began = integer(reading[1], false), finished = integer(reading[2], false);
      assert.ok(began >= previous && finished >= began && finished <= end - start); previous = finished;
      if (minBytes === undefined || bytes < minBytes) minBytes = bytes; if (bytes > maxBytes) maxBytes = bytes;
    }
    processes.push({ pid: processPid, role, type, hostIds, uuid, processStart, readings, minBytes, maxBytes });
  }
  assert.equal(roles.get('browser'), 1); assert.equal(roles.get('gpu'), 1); assert.ok(roles.get('renderer') >= 1); assert.ok(hosts.size <= 128);
  return { row, processes, totalLowerBytes: processes.reduce((sum, process) => sum + process.minBytes, 0n), totalUpperBytes: processes.reduce((sum, process) => sum + process.maxBytes, 0n) };
}

/** Same fixed private transport and direct-child originals as Aux; no caller PID
 * selector. browserPid is the original launched child's identity, never a query.
 */
export function createNativeStockMemoryReader({ transport, browserPid, expectedIdentity, expectedChromium, expectedUrls, readIdentity,
  readPower = () => execFileSync('/usr/bin/pmset', ['-g', 'batt'], { encoding: 'utf8', timeout: 5000 }) }) {
  pid(browserPid); assert.equal(typeof transport?.invoke, 'function'); assert.equal(typeof readIdentity, 'function');
  assert.equal(expectedIdentity?.dirty, false); assert.match(expectedIdentity.sourceCommit ?? '', /^[a-f0-9]{40}$/);
  assert.match(expectedIdentity.manifestHash ?? '', /^[a-f0-9]{64}$/); assert.ok(typeof expectedIdentity.buildId === 'string' && expectedIdentity.buildId.length > 0);
  assert.equal(expectedIdentity.chromiumVersion, expectedChromium.version); assert.equal(expectedIdentity.chromiumLastChange, expectedChromium.lastChange);
  assert.equal(expectedUrls.length, 10);
  let busy = false, receiptSequence = 0n, sampleSequence = 0n, previousEnd = 0n, scope, generation;
  const verify = async () => {
    const identity = await readIdentity(); assert.deepEqual(identity, expectedIdentity, 'Original stock source identity changed');
    const power = await readPower(); assert.match(power, /Now drawing from 'AC Power'/); return { identity, power };
  };
  return { async sample() {
    assert.ok(!busy); busy = true; const observation = { operation: 'sampleStockProcessMemory', status: 'running' };
    try {
      observation.before = await verify(); observation.raw = await transport.invoke(observation.operation);
      const receipt = transport.lastReceipt; observation.receipt = structuredClone(receipt);
      assert.ok(receipt && typeof receipt.raw === 'string' && Buffer.byteLength(receipt.raw) <= 16384);
      assert.equal(receipt.pid, browserPid); assert.ok(Number.isSafeInteger(receipt.generation) && receipt.generation > 0);
      assert.equal(receipt.operation, observation.operation); assert.equal(receipt.recordRaw, observation.raw);
      const sequence = integer(receipt.sequence); assert.ok(sequence > receiptSequence, 'Replayed original stock receipt'); receiptSequence = sequence;
      if (generation !== undefined) assert.equal(receipt.generation, generation); else generation = receipt.generation;
      assert.ok(receipt.raw.startsWith('AUX_NATIVE_FIXTURE_REPLY_V1 '));
      const wrapper = JSON.parse(receipt.raw.slice('AUX_NATIVE_FIXTURE_REPLY_V1 '.length));
      keys(wrapper, ['producer', 'version', 'pid', 'windowId', 'sequence', 'operation', 'record']);
      assert.equal(wrapper.producer, 'aux-native-fixture-reply'); assert.equal(wrapper.version, 1); assert.equal(wrapper.pid, browserPid); pid(wrapper.windowId);
      assert.equal(wrapper.sequence, receipt.sequence); assert.equal(wrapper.operation, observation.operation); assert.equal(JSON.stringify(wrapper.record), observation.raw);
      const decoded = validateNativeStockProcessMemory(observation.raw, browserPid, expectedChromium); observation.decoded = decoded; observation.native = decoded.row;
      if (decoded.row.status === 'sampled') {
        assert.equal(wrapper.windowId, decoded.row.windowId); assert.deepEqual(decoded.row.tabs.map(tab => tab.url), expectedUrls);
        const current = { windowId: decoded.row.windowId, requestNonce: decoded.row.requestNonce, tabs: decoded.row.tabs };
        if (scope) assert.deepEqual(current, scope, 'Original stock window/document changed'); else scope = current;
        const next = integer(decoded.row.sampleSequence); assert.ok(next > sampleSequence); sampleSequence = next;
        assert.ok(integer(decoded.row.sampleStartUs) >= previousEnd); previousEnd = integer(decoded.row.sampleEndUs);
      } else if (scope) assert.equal(wrapper.windowId, scope.windowId);
      observation.after = await verify(); observation.sha256 = createHash('sha256').update(receipt.raw).digest('hex'); observation.status = decoded.row.status;
      return observation;
    } catch (error) {
      observation.status = 'failed'; observation.error = error.message;
      if (error.nativeRaw) observation.transportRefusalRaw = error.nativeRaw;
      const failure = new Error(`Stock memory observation refused: ${error.message}`, { cause: error }); failure.observation = observation; throw failure;
    } finally { busy = false; }
  } };
}

export async function collectNativeStockMemoryTrials({ reader, signal }) {
  assert.ok(signal instanceof AbortSignal); const trials = [];
  try {
    for (let trial = 1; trial <= 20; trial++) {
      const evidence = { trial, status: 'running' }; trials.push(evidence); assert.ok(!signal.aborted);
      try { evidence.observation = await reader.sample(); } catch (error) { evidence.observation = error.observation; throw error; }
      assert.equal(evidence.observation.status, 'sampled', 'Actual stock refused'); assert.ok(!signal.aborted); evidence.status = 'sampled';
    }
    return trials;
  } catch (error) {
    trials.at(-1).status = 'failed'; trials.at(-1).error = error.message; error.trials = trials; throw error;
  }
}

function originalMemoryObservation(trial, stock, sequenceState) {
  assert.equal(trial.status, 'sampled');
  const observation = trial.observation;
  assert.equal(observation?.status, 'sampled');
  const operation = stock ? 'sampleStockProcessMemory' : 'sampleProcessMemory';
  assert.equal(observation.operation, operation);
  assert.ok(observation.before?.identity && observation.after?.identity, 'Original paired source identities required');
  assert.deepEqual(observation.before.identity, observation.after.identity, 'Original paired source changed');
  for (const pair of [observation.before, observation.after])
    assert.match(pair.power, /Now drawing from 'AC Power'/, 'Original AC evidence required');
  const source = stock ? observation.before.identity : observation.before.identity.native;
  assert.match(source?.sourceCommit ?? '', /^[a-f0-9]{40}$/);
  assert.match(source?.manifestHash ?? '', /^[a-f0-9]{64}$/);
  assert.ok(typeof source.buildId === 'string' && source.buildId.length > 0);
  if (stock) assert.equal(source.dirty, false);
  else {
    assert.equal(observation.before.identity.runtime?.dirty, false);
    assert.match(observation.before.identity.runtime?.tree ?? '', /^[a-f0-9]{40}$/);
    assert.equal(observation.before.identity.runtime?.label, observation.before.identity.runtime?.commit);
    assert.equal(source.sourceCommit, observation.before.identity.runtime?.commit);
  }
  const receipt = observation.receipt;
  pid(receipt?.pid); assert.ok(Number.isSafeInteger(receipt.generation) && receipt.generation > 0);
  assert.equal(receipt.operation, operation); assert.equal(receipt.recordRaw, observation.raw);
  assert.ok(typeof receipt.raw === 'string' && Buffer.byteLength(receipt.raw) <= 16384 && receipt.raw.startsWith('AUX_NATIVE_FIXTURE_REPLY_V1 '));
  assert.equal(observation.sha256, createHash('sha256').update(receipt.raw).digest('hex'), 'Original envelope digest changed');
  const wrapper = JSON.parse(receipt.raw.slice('AUX_NATIVE_FIXTURE_REPLY_V1 '.length));
  keys(wrapper, ['producer', 'version', 'pid', 'windowId', 'sequence', 'operation', 'record']);
  assert.equal(wrapper.producer, 'aux-native-fixture-reply'); assert.equal(wrapper.version, 1);
  assert.equal(wrapper.pid, receipt.pid); assert.equal(wrapper.sequence, receipt.sequence); assert.equal(wrapper.operation, operation);
  assert.equal(JSON.stringify(wrapper.record), observation.raw, 'Original native bytes differ from envelope');
  const next = integer(receipt.sequence); assert.ok(next > (sequenceState.receipt ?? 0n), 'Original receipt replay');
  sequenceState.receipt = next;
  const owner = { pid: receipt.pid, generation: receipt.generation, identity: observation.before.identity };
  if (sequenceState.owner) assert.deepEqual(owner, sequenceState.owner, 'Original child/source ownership changed');
  else sequenceState.owner = owner;
  return { observation, wrapper };
}
function originalSampleScope(row, wrapper, state, stock, decoded) {
  assert.equal(wrapper.windowId, row.windowId);
  const next = integer(row.sampleSequence); assert.ok(next > (state.sample ?? 0n), 'Original sample replay'); state.sample = next;
  const began = integer(row.sampleStartUs); assert.ok(began >= (state.end ?? 0n), 'Original samples overlap'); state.end = integer(row.sampleEndUs);
  const runtime = stock ? undefined : decoded.processes.find(process => process.role === 'runtime');
  const scope = stock ? { windowId: row.windowId, requestNonce: row.requestNonce, tabs: row.tabs }
    : { windowId: row.windowId, widgetRoutingId: row.widgetRoutingId, requestNonce: row.requestNonce, runtimePid: runtime.pid,
      runtimeConnection: runtime.connection, chromiumVersion: row.chromiumVersion, chromiumLastChange: row.chromiumLastChange };
  if (state.scope) assert.deepEqual(scope, state.scope, 'Original native scope changed'); else state.scope = scope;
}
function retainedHumanTabs(trial) {
  assert.equal(trial.mode, 'idle');
  assert.ok(Array.isArray(trial.idleBefore) && trial.idleBefore.length === 10);
  const ids = new Set();
  for (const tab of trial.idleBefore) {
    keys(tab, ['pageId', 'sessionId', 'documentEpoch', 'url']);
    assert.ok(typeof tab.pageId === 'string' && tab.pageId && !ids.has(tab.pageId)); ids.add(tab.pageId);
    assert.ok(typeof tab.sessionId === 'string' && tab.sessionId);
    assert.ok(Number.isSafeInteger(tab.documentEpoch) && tab.documentEpoch >= 0);
    assert.ok(typeof tab.url === 'string' && /^https?:\/\//.test(tab.url));
  }
  assert.deepEqual(trial.idleAfter, trial.idleBefore, 'Original retained human document changed');
  return trial.idleBefore;
}

/** Reconstruct from original persisted evidence, including reports which omit
 * reproducible native/decoded clones. Never subtract the stock upper bound. */
export function assertMatchedStockMemoryOverhead(auxTrials, stockTrials, limitBytes) {
  assert.equal(auxTrials.length, 20); assert.equal(stockTrials.length, 20); assert.ok(typeof limitBytes === 'bigint' && limitBytes > 0n);
  let auxUpper = 0n, stockLower, retained;
  const auxState = {}, stockState = {};
  for (let index = 0; index < 20; index++) {
    const aux = auxTrials[index], stock = stockTrials[index];
    assert.equal(aux.trial, index + 1); assert.equal(stock.trial, index + 1);
    const auxOriginal = originalMemoryObservation(aux, false, auxState);
    const auxDecoded = validateNativeProcessMemory(auxOriginal.observation.raw, auxOriginal.wrapper.pid);
    assert.equal(auxDecoded.workload.before.status, 'idle'); assert.equal(auxDecoded.workload.after.status, 'idle');
    originalSampleScope(auxDecoded.row, auxOriginal.wrapper, auxState, false, auxDecoded);
    const tabs = retainedHumanTabs(aux);
    if (retained) assert.deepEqual(tabs, retained, 'Original human source changed between trials'); else retained = tabs;
    const stockOriginal = originalMemoryObservation(stock, true, stockState);
    const stockDecoded = validateNativeStockProcessMemory(stockOriginal.observation.raw, stockOriginal.wrapper.pid,
      { version: auxDecoded.row.chromiumVersion, lastChange: auxDecoded.row.chromiumLastChange });
    assert.equal(stockDecoded.row.status, 'sampled');
    assert.equal(stockOriginal.observation.before.identity.chromiumVersion, stockDecoded.row.chromiumVersion);
    assert.equal(stockOriginal.observation.before.identity.chromiumLastChange, stockDecoded.row.chromiumLastChange);
    originalSampleScope(stockDecoded.row, stockOriginal.wrapper, stockState, true, stockDecoded);
    assert.deepEqual(tabs.map(page => page.url), stockDecoded.row.tabs.map(tab => tab.url), 'Ten actual source fixtures do not match stock');
    const upper = auxDecoded.totalConservativeBytes, lower = stockDecoded.totalLowerBytes;
    if (upper > auxUpper) auxUpper = upper; if (stockLower === undefined || lower < stockLower) stockLower = lower;
  }
  const overheadUpperBytes = auxUpper - stockLower;
  assert.ok(overheadUpperBytes <= limitBytes, 'Original conservative stock overhead exceeds gate');
  return { auxUpperBytes: auxUpper, stockLowerBytes: stockLower, overheadUpperBytes, limitBytes };
}
