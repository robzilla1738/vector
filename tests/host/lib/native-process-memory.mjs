import assert from 'node:assert/strict';

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
  assert.deepEqual(Object.keys(row).sort(), ['producer', 'version', 'status', 'windowId', 'widgetRoutingId',
    'requestNonce', 'sampleSequence', 'sampleStartUs', 'sampleEndUs', 'processes', 'workload', 'workloadObservedAt', 'workloadRequestTimes'].sort());
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
