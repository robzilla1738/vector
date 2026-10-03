import assert from 'node:assert/strict';

const common = ['producer', 'version', 'status', 'mode', 'nonce', 'sequence', 'pid', 'browserWindowId',
  'hostIncarnation', 'connectionGeneration', 'rootRunId', 'registeredRuns', 'armedUs', 'pages'];
const scopeFields = ['profileId', 'tabId', 'isolationId', 'runId', 'taskRevision', 'frameId',
  'documentToken', 'sourceOrigin', 'controlGeneration'];
const exact = (value, keys) => {
  assert.ok(value && typeof value === 'object' && !Array.isArray(value), 'Missing original native record');
  assert.deepEqual(Object.keys(value).sort(), [...keys].sort(), 'Unexpected native record fields');
};
const identity = value => assert.ok(typeof value === 'string' && value.length > 0 && value.length <= 256, 'Missing original identity');
const ticks = value => {
  assert.ok(typeof value === 'string' && /^(0|[1-9][0-9]{0,19})$/.test(value), 'Native integers must retain canonical strings');
  const result = BigInt(value); assert.ok(result <= 18446744073709551615n); return result;
};
const scope = (value, retired) => {
  const fields = [...scopeFields, ...(Object.hasOwn(value, 'taskId') ? ['taskId'] : []), ...(retired ? ['retiredControlGeneration'] : [])];
  exact(value, fields);
  for (const field of fields.filter(key => key !== 'taskRevision')) identity(value[field]);
  assert.ok(Number.isSafeInteger(value.taskRevision) && value.taskRevision >= 0);
  const origin = new URL(value.sourceOrigin);
  assert.ok(['http:', 'https:'].includes(origin.protocol) && origin.origin === value.sourceOrigin, 'Original source origin changed');
  if (retired) assert.notEqual(value.controlGeneration, value.retiredControlGeneration);
};
function record(raw, sampled) {
  assert.ok(typeof raw === 'string' && Buffer.byteLength(raw) <= 16384, 'Missing bounded original receipt');
  const row = JSON.parse(raw); exact(row, [...common, ...(sampled ? ['observedUs'] : [])]);
  assert.equal(row.producer, 'aux-native-cdp-retirement'); assert.equal(row.version, 1);
  assert.equal(row.status, sampled ? 'sampled' : 'armed'); assert.ok(['stop', 'takeover'].includes(row.mode));
  for (const field of ['nonce', 'hostIncarnation', 'rootRunId']) identity(row[field]);
  for (const field of ['pid', 'browserWindowId', 'connectionGeneration']) assert.ok(Number.isSafeInteger(row[field]) && row[field] > 0);
  assert.ok(ticks(row.sequence) > 0n); assert.ok(ticks(row.armedUs) > 0n);
  assert.ok(Array.isArray(row.registeredRuns) && row.registeredRuns.length >= 1 && row.registeredRuns.length <= 128);
  row.registeredRuns.forEach(identity);
  assert.equal(new Set(row.registeredRuns).size, row.registeredRuns.length, 'Repeated registered native run');
  assert.ok(row.registeredRuns.includes(row.rootRunId), 'Original root is not registered');
  assert.ok(Array.isArray(row.pages) && row.pages.length >= 1 && row.pages.length <= 20);
  assert.ok(row.mode === 'stop' || row.pages.length === 1, 'Takeover must identify one original page');
  const ids = new Set();
  for (const page of row.pages) {
    exact(page, ['scope', 'leaseId', 'initialCount', ...(sampled ? ['eventUs', 'admittedUs', 'lastDispatchUs', 'retiredCount', 'observedCount', 'originalClockValid', 'documentState', 'destroyedUs'] : [])]);
    scope(page.scope, sampled); identity(page.leaseId); ticks(page.initialCount);
    assert.ok(row.registeredRuns.includes(page.scope.runId), 'Page is outside original registered family');
    assert.ok(!ids.has(page.scope.tabId), 'Repeated original family page'); ids.add(page.scope.tabId);
  }
  return row;
}

/** Original arm and completion bytes are mandatory; caller-created expected rows grant no provenance. */
export function decodeNativeCdpRetirement(raw, armedRaw) {
  const arm = record(armedRaw, false), row = record(raw, true);
  for (const field of common.filter(key => !['status', 'pages'].includes(key)))
    assert.deepEqual(row[field], arm[field], 'Original native fixture or family identity changed');
  assert.equal(row.pages.length, arm.pages.length, 'Original family page omitted');
  const armed = ticks(row.armedUs), observed = ticks(row.observedUs);
  assert.ok(observed > armed && observed - armed < 5000000n, 'Original bounded arm interval expired');
  const pages = row.pages.map((page, index) => {
    const original = arm.pages[index];
    const { retiredControlGeneration, ...beforeScope } = page.scope;
    assert.deepEqual(beforeScope, original.scope, 'Original admitted scope changed');
    assert.equal(page.leaseId, original.leaseId); assert.equal(page.initialCount, original.initialCount);
    assert.equal(page.originalClockValid, true, 'Unproven original platform clock');
    assert.ok(['retained', 'destroyed'].includes(page.documentState), 'Missing original document observation');
    const destroyed = ticks(page.destroyedUs);
    assert.ok(page.documentState === 'retained' ? destroyed === 0n
      : row.mode === 'stop' && destroyed >= ticks(page.admittedUs) && destroyed <= observed, 'Original destruction witness changed');
    const event = ticks(page.eventUs), admitted = ticks(page.admittedUs), last = ticks(page.lastDispatchUs);
    const retired = ticks(page.retiredCount), current = ticks(page.observedCount);
    assert.ok(event >= armed && admitted >= event && observed > admitted, 'Original timing order changed');
    assert.ok(retired > ticks(original.initialCount) && last >= armed && last <= admitted, 'Missing genuine final dispatch');
    assert.equal(current, retired, 'Native dispatch occurred after revocation');
    const lastLatency = last > event ? last - event : 0n;
    assert.ok(admitted - event <= 100000n && lastLatency <= 100000n, 'Stop/takeover exceeded unchanged 100ms gate');
    return { original: page, admissionLatencyUs: admitted - event, lastDispatchLatencyUs: lastLatency };
  });
  return { original: row, originalArm: arm, pages };
}

/** Retains every attempt; a missing/refused trial cannot become successful qualification. */
export function evaluateNativeCdpRetirementTrials(trials) {
  assert.ok(Array.isArray(trials) && trials.length >= 20 && trials.length <= 100, '20–100 actual AC trials required');
  const nonces = new Set(), modes = new Set();
  const decoded = trials.map(trial => {
    assert.equal(trial.status, 'sampled', 'Every original refusal must fail the gate');
    for (const power of [trial.powerBefore, trial.powerAfter])
      assert.ok(typeof power === 'string' && /Now drawing from 'AC Power'/.test(power), 'Original before/after AC evidence missing');
    const value = decodeNativeCdpRetirement(trial.raw, trial.armedRaw);
    assert.ok(!nonces.has(value.original.nonce), 'One-use native receipt replayed'); nonces.add(value.original.nonce);
    modes.add(value.original.mode); return value;
  });
  assert.equal(modes.size, 1, 'Stop and takeover require separate complete trial series');
  return decoded;
}
