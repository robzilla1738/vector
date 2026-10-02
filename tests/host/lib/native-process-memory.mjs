import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { validateAppearanceCandidate } from './appearance-provenance.mjs';

const u64 = (value, positive = true) => {
  assert.ok(typeof value === 'string' && /^(0|[1-9][0-9]{0,19})$/.test(value), 'Kernel integers must be canonical decimal strings');
  const integer = BigInt(value);
  assert.ok(integer <= 18446744073709551615n && (!positive || integer > 0n), 'Kernel integer is out of range');
  return integer;
};
const pid = value => assert.ok(Number.isInteger(value) && value > 0 && value <= 0x7fffffff, 'Invalid native PID or host ID');
const uuid = value => assert.ok(typeof value === 'string' && /^[a-f0-9]{32}$/i.test(value) && !/^0+$/.test(value), 'Missing native kernel UUID');


const keys = (row, expected) => assert.deepEqual(Object.keys(row).sort(), expected.sort(), 'Unexpected workload primitive');
const instant = value => assert.ok(Number.isSafeInteger(value) && value > 0, 'Missing original runtime observation');
const identity = value => assert.ok(typeof value === 'string' && value.length > 0 && value.length <= 128, 'Missing workload identity');
function workloadBracket(row) {
  assert.ok(row.workload && typeof row.workload === 'object' && !Array.isArray(row.workload));
  const workload = row.workload;
  assert.equal(workload.producer, 'aux-runtime-subagent-workload'); assert.equal(workload.version, 1);
  assert.ok(Array.isArray(row.workloadObservedAt) && row.workloadObservedAt.length === 2);
  const [before, after] = row.workloadObservedAt; instant(before); instant(after);
  assert.ok(after >= before, 'Original runtime observations reversed');
  if (workload.status === 'idle') {
    keys(workload, ['producer', 'version', 'status', 'activeExecutions']);
    assert.equal(workload.activeExecutions, 0, 'Nonempty workload cannot be idle');
  } else {
    assert.equal(workload.status, 'executing', 'Refused/partial workload cannot be idle');
    keys(workload, ['producer', 'version', 'status', 'parentRunId', 'workspaceId', 'groupId', 'children']);
    for (const field of ['parentRunId', 'workspaceId', 'groupId']) identity(workload[field]);
    assert.ok(Array.isArray(workload.children) && workload.children.length === 5, 'Five executing VMs required');
    const uniqueFields = ['runId', 'cellId', 'agentId', 'pageId', 'requestedPageId', 'sourcePageId'];
    for (const field of uniqueFields) assert.equal(new Set(workload.children.map(child => child[field])).size, 5, 'Repeated VM/source identity');
    for (const child of workload.children) {
      keys(child, ['cellId', 'runId', 'deadlineAt', 'memoryLimitBytes', 'agentId', 'sourceRunId', 'sourcePageId',
        'sourceSessionId', 'sourceDocumentEpoch', 'requestedPageId', 'requestedSessionId', 'requestedDocumentEpoch',
        'pageId', 'sessionId', 'documentEpoch']);
      for (const field of ['cellId', 'runId', 'agentId', 'sourceRunId', 'sourcePageId', 'sourceSessionId',
        'requestedPageId', 'requestedSessionId', 'pageId', 'sessionId']) identity(child[field]);
      assert.equal(child.sourceRunId, workload.parentRunId);
      assert.equal(new Set([child.pageId, child.requestedPageId, child.sourcePageId]).size, 3, 'Protected copies missing');
      for (const field of ['documentEpoch', 'requestedDocumentEpoch', 'sourceDocumentEpoch'])
        assert.ok(Number.isSafeInteger(child[field]) && child[field] >= 0, 'Missing current document epoch');
      assert.equal(child.memoryLimitBytes, 128 * 1024 * 1024, 'Actual per-VM cap changed');
      instant(child.deadlineAt); assert.ok(child.deadlineAt > after, 'VM expired during whole sample');
    }
  }
  return { before: { ...workload, observedAt: before }, after: { ...workload, observedAt: after } };
}

/** Strict decoder for the current unadopted native draft. This grants no authority. */
export function validateNativeProcessMemory(raw, browserPid) {
  assert.ok(typeof raw === 'string' && Buffer.byteLength(raw) <= 12288, 'Missing bounded process memory record');
  const row = JSON.parse(raw);
  assert.equal(row.producer, 'aux-native-process-memory'); assert.equal(row.version, 1);
  assert.equal(row.status, 'sampled', 'Native process memory refused');
  assert.deepEqual(Object.keys(row).sort(), ['producer', 'version', 'status', 'chromiumVersion', 'chromiumLastChange', 'windowId', 'widgetRoutingId',
    'requestNonce', 'sampleSequence', 'sampleStartUs', 'sampleEndUs', 'processes', 'workload', 'workloadObservedAt', 'workloadRequestTimes'].sort());
  assert.match(row.chromiumVersion, /^\d+\.\d+\.\d+\.\d+$/, 'Missing actual compiled Chromium version');
  assert.ok(typeof row.chromiumLastChange === 'string' && /^[\x21-\x7e]{1,160}$/.test(row.chromiumLastChange), 'Missing actual compiled Chromium revision');
  assert.ok(!/^0+(?:-|$)/.test(row.chromiumLastChange), 'Dummy compiled Chromium revision cannot establish source identity');
  const workload = workloadBracket(row);
  pid(browserPid); pid(row.windowId); pid(row.widgetRoutingId); uuid(row.requestNonce);
  u64(row.sampleSequence);
  const start = u64(row.sampleStartUs), end = u64(row.sampleEndUs);
  assert.ok(end >= start && end - start <= 5000000n, 'Invalid whole native sampling interval');
  assert.ok(Array.isArray(row.processes) && row.processes.length >= 4 && row.processes.length <= 33, 'Invalid native process inventory');
  const ids = new Set(), hosts = new Set(), counts = new Map(), processes = [];
  for (const tuple of row.processes) {
    assert.ok(Array.isArray(tuple));
    const [processPid, role, type, hostIds, processUuid, processStart, readings, connection] = tuple;
    assert.ok(['browser', 'shell', 'renderer', 'gpu', 'browser-child', 'runtime'].includes(role), 'Unknown native role');
    assert.equal(tuple.length, role === 'runtime' ? 8 : 7, 'Extra process primitive');
    pid(processPid); assert.ok(!ids.has(processPid), 'Duplicate native process accounting'); ids.add(processPid);
    counts.set(role, (counts.get(role) ?? 0) + 1);
    assert.ok(Array.isArray(hostIds), 'Missing native host identities');
    if (role === 'runtime') { assert.equal(type, null); assert.deepEqual(hostIds, []); u64(connection); }
    else {
      assert.ok(Number.isInteger(type) && type >= 1 && type < 22, 'Invalid Chromium process type');
      if (role === 'browser') { assert.equal(processPid, browserPid); assert.equal(type, 2); assert.deepEqual(hostIds, []); }
      else {
        assert.ok(hostIds.length > 0 && hostIds.length <= 128, 'Missing real child host');
        for (const id of hostIds) { pid(id); assert.ok(!hosts.has(id), 'Duplicate native host'); hosts.add(id); }
        assert.deepEqual([...hostIds].sort((a, b) => a - b), hostIds, 'Unordered native hosts');
        if (role === 'shell' || role === 'renderer') assert.equal(type, 3);
        else if (role === 'gpu') assert.equal(type, 9);
        else assert.ok(![2, 3, 9].includes(type), 'Misclassified browser child');
      }
    }
    uuid(processUuid); u64(processStart);
    assert.ok(Array.isArray(readings)); assert.equal(readings.length, role === 'runtime' ? 2 : 4);
    let previous = 0n, maximum = 0n;
    for (const reading of readings) {
      assert.ok(Array.isArray(reading) && reading.length === 3, 'Missing exact kernel reading');
      const bytes = u64(reading[0]), began = u64(reading[1], false), finished = u64(reading[2], false);
      assert.ok(began >= previous && finished >= began && finished <= end - start, 'Invalid kernel sampling bracket');
      previous = finished; if (bytes > maximum) maximum = bytes;
    }
    processes.push({ pid: processPid, role, type, hostIds, processUuid, processStart,
      connection, maxBytes: maximum, readings });
  }
  for (const role of ['browser', 'shell', 'gpu', 'runtime']) assert.equal(counts.get(role), 1, 'Missing/ambiguous native role');
  assert.ok(hosts.size <= 128, 'Native host inventory exceeded bound');
  const runtime = processes.find(process => process.role === 'runtime');
  const browser = processes.filter(process => process.role !== 'runtime');
  const beforeEnd = browser.reduce((latest, process) => { const end = u64(process.readings[1][2], false); return end > latest ? end : latest; }, 0n);
  const runtimeStart = u64(runtime.readings[0][1], false), runtimeEnd = u64(runtime.readings[1][2], false);
  assert.ok(runtimeStart >= beforeEnd, 'Runtime kernel sampling precedes browser bracket');
  for (const process of browser) assert.ok(u64(process.readings[2][1], false) >= runtimeEnd, 'Browser after bracket precedes runtime');
  assert.ok(Array.isArray(row.workloadRequestTimes) && row.workloadRequestTimes.length === 4, 'Missing original request brackets');
  const requestTimes = row.workloadRequestTimes.map(value => u64(value, false));
  assert.ok(requestTimes.every((value, index) => value <= end - start && (!index || value >= requestTimes[index - 1])), 'Invalid original request order');
  const firstKernel = browser.reduce((first, process) => { const began = u64(process.readings[0][1], false); return began < first ? began : first; }, end - start);
  const lastKernel = browser.reduce((last, process) => { const finished = u64(process.readings[3][2], false); return finished > last ? finished : last; }, 0n);
  assert.ok(requestTimes[1] <= firstKernel && requestTimes[2] >= lastKernel, 'Fresh workload does not enclose whole kernel inventory');
  return { row, workload, processes, shellMaxBytes: processes.find(process => process.role === 'shell').maxBytes,
    runtimeMaxBytes: runtime.maxBytes, totalConservativeBytes: processes.reduce((sum, process) => sum + process.maxBytes, 0n) };
}


/** Original fixed-operation response from the genuine native paused-parent reader. */
export function validateNativeSubagentPreparation(raw) {
  assert.ok(typeof raw === 'string' && Buffer.byteLength(raw) <= 12288, 'Missing bounded preparation record');
  const row = JSON.parse(raw);
  assert.equal(row.producer, 'aux-native-subagent-preparation'); assert.equal(row.version, 1);
  if (row.status === 'refused') {
    keys(row, ['producer', 'version', 'status']);
    return row;
  }
  assert.equal(row.status, 'ready');
  keys(row, ['producer', 'version', 'status', 'windowId', 'widgetRoutingId', 'requestNonce', 'sampleSequence',
    'runtimePid', 'runtimeConnectionGeneration', 'issuedUs', 'receivedUs', 'preparation']);
  pid(row.windowId); pid(row.widgetRoutingId); pid(row.runtimePid); uuid(row.requestNonce);
  u64(row.sampleSequence); u64(row.runtimeConnectionGeneration);
  const issued = u64(row.issuedUs), received = u64(row.receivedUs);
  assert.ok(received >= issued && received - issued <= 5000000n, 'Invalid fresh preparation bracket');
  const preparation = row.preparation;
  assert.ok(preparation && typeof preparation === 'object' && !Array.isArray(preparation));
  keys(preparation, ['producer', 'version', 'status', 'observedAt', 'parentRunId', 'taskId', 'taskRevision',
    'workspaceId', 'deadlineAt', 'pages']);
  assert.equal(preparation.producer, 'aux-runtime-subagent-preparation'); assert.equal(preparation.version, 1);
  assert.equal(preparation.status, 'ready'); instant(preparation.observedAt); instant(preparation.deadlineAt);
  assert.ok(preparation.deadlineAt > preparation.observedAt, 'Expired paused parent');
  for (const field of ['parentRunId', 'taskId', 'workspaceId']) identity(preparation[field]);
  assert.ok(Number.isSafeInteger(preparation.taskRevision) && preparation.taskRevision > 0);
  assert.ok(Array.isArray(preparation.pages) && preparation.pages.length === 5, 'Five protected source copies required');
  for (const field of ['pageId', 'sourcePageId']) assert.equal(new Set(preparation.pages.map(page => page[field])).size, 5, 'Duplicate preparation source');
  for (const page of preparation.pages) {
    keys(page, ['pageId', 'sessionId', 'documentEpoch', 'sourcePageId', 'sourceSessionId', 'sourceDocumentEpoch']);
    for (const field of ['pageId', 'sessionId', 'sourcePageId', 'sourceSessionId']) identity(page[field]);
    assert.notEqual(page.pageId, page.sourcePageId, 'Protected parent copy missing');
    for (const field of ['documentEpoch', 'sourceDocumentEpoch'])
      assert.ok(Number.isSafeInteger(page[field]) && page[field] >= 0, 'Missing current preparation document');
  }
  return row;
}


/** Fixed owned mailbox + original direct-child stderr. No caller PID/window/page selector. */
export function createNativeProcessMemoryReader({ transport, browserPid, candidate, readIdentity,
  readPower = () => execFileSync('/usr/bin/pmset', ['-g', 'batt'], { encoding: 'utf8', timeout: 5000 }) }) {
  validateAppearanceCandidate(candidate); pid(browserPid);
  assert.ok(typeof transport?.invoke === 'function' && typeof readIdentity === 'function');
  let busy = false, receiptSequence = 0n, sampleSequence = 0n, previousEnd = 0n, scope, childGeneration, compiledChromium;
  const verify = async () => {
    const identity = await readIdentity(); assert.deepEqual(identity.runtime, candidate.productIdentity);
    for (const key of ['sourceCommit', 'buildId', 'manifestHash']) assert.equal(identity.native?.[key], candidate.native[key]);
    const power = await readPower(); assert.match(power, /Now drawing from 'AC Power'/, 'Actual original AC reading required');
    return { identity, power };
  };
  async function invoke(preparing) {
    assert.ok(!busy, 'Concurrent native memory observation'); busy = true;
    const operation = preparing ? 'prepareSubagentMemoryWorkload' : 'sampleProcessMemory';
    const observation = { operation, status: 'running' };
    try {
      observation.before = await verify(); observation.raw = await transport.invoke(operation);
      const receipt = transport.lastReceipt; observation.receipt = structuredClone(receipt);
      assert.ok(receipt && typeof receipt.raw === 'string' && Buffer.byteLength(receipt.raw) <= 16384);
      assert.equal(receipt.pid, browserPid); assert.equal(receipt.operation, operation); assert.equal(receipt.recordRaw, observation.raw);
      assert.ok(Number.isInteger(receipt.generation) && receipt.generation > 0);
      const sequence = u64(receipt.sequence); assert.ok(sequence > receiptSequence, 'Replayed original native receipt');
      receiptSequence = sequence;
      assert.ok(receipt.raw.startsWith('AUX_NATIVE_FIXTURE_REPLY_V1 '));
      const wrapper = JSON.parse(receipt.raw.slice('AUX_NATIVE_FIXTURE_REPLY_V1 '.length));
      keys(wrapper, ['producer', 'version', 'pid', 'windowId', 'sequence', 'operation', 'record']);
      assert.equal(wrapper.producer, 'aux-native-fixture-reply'); assert.equal(wrapper.version, 1);
      assert.equal(wrapper.pid, browserPid); assert.equal(wrapper.operation, operation); assert.equal(wrapper.sequence, receipt.sequence);
      assert.equal(JSON.stringify(wrapper.record), observation.raw); pid(wrapper.windowId);
      if (childGeneration !== undefined) assert.equal(receipt.generation, childGeneration, 'Original browser child changed');
      else childGeneration = receipt.generation;
      const decoded = preparing ? undefined : validateNativeProcessMemory(observation.raw, browserPid);
      const row = preparing ? validateNativeSubagentPreparation(observation.raw) : decoded.row;
      if (decoded) {
        const tag = { version: row.chromiumVersion, lastChange: row.chromiumLastChange };
        if (compiledChromium) assert.deepEqual(tag, compiledChromium, 'Compiled Chromium source changed within native series');
        else compiledChromium = tag;
      }
      if (row.status !== 'refused') {
        assert.equal(wrapper.windowId, row.windowId);
        const runtime = decoded?.processes.find(process => process.role === 'runtime');
        const current = { windowId: row.windowId, widgetRoutingId: row.widgetRoutingId, requestNonce: row.requestNonce,
          runtimePid: preparing ? row.runtimePid : runtime.pid,
          runtimeConnectionGeneration: preparing ? row.runtimeConnectionGeneration : runtime.connection };
        if (scope) assert.deepEqual(current, scope, 'Native owner/document/runtime scope changed'); else scope = current;
        const next = u64(row.sampleSequence); assert.ok(next > sampleSequence, 'Replayed native sample/preparation'); sampleSequence = next;
        const began = u64(preparing ? row.issuedUs : row.sampleStartUs), ended = u64(preparing ? row.receivedUs : row.sampleEndUs);
        assert.ok(began >= previousEnd, 'Native observations overlap'); previousEnd = ended;
      } else assert.equal(wrapper.windowId, scope?.windowId ?? wrapper.windowId);
      observation.after = await verify(); observation.sha256 = createHash('sha256').update(receipt.raw).digest('hex');
      observation.native = row; observation.status = row.status;
      if (decoded) observation.decoded = decoded;
      return observation;
    } catch (error) {
      observation.status = 'failed'; observation.error = error.message;
      if (error.nativeRaw) observation.transportRefusalRaw = error.nativeRaw;
      const failure = new Error(`Native memory observation refused: ${error.message}`, { cause: error });
      failure.observation = observation; throw failure;
    } finally { busy = false; }
  }
  return { readPreparation: () => invoke(true), sample: () => invoke(false) };
}
