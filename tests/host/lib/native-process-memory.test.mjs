import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateNativeProcessMemory, validateNativeSubagentPreparation, createNativeProcessMemoryReader } from './native-process-memory.mjs';
const record = () => {
  const readings = [['100', '5', '10'], ['105', '20', '30'], ['103', '60', '70'], ['102', '80', '90']];
  const row = { producer: 'aux-native-process-memory', version: 1, status: 'sampled', windowId: 1, widgetRoutingId: 2,
    requestNonce: 'a'.repeat(32), sampleSequence: '1', sampleStartUs: '1000000', sampleEndUs: '1000100', workload: { producer: 'aux-runtime-subagent-workload', version: 1, status: 'idle', activeExecutions: 0 },
    workloadObservedAt: [1000, 1001], workloadRequestTimes: ['0', '3', '91', '95'], processes: [
      [100, 'browser', 2, [], 'b'.repeat(32), '300', structuredClone(readings)],
      [101, 'shell', 3, [1], 'b'.repeat(32), '301', structuredClone(readings)],
      [102, 'gpu', 9, [2], 'b'.repeat(32), '302', structuredClone(readings)],
      [103, 'runtime', null, [], 'b'.repeat(32), '303', [['110', '40', '45'], ['115', '46', '50']], '7'],
    ] };
  return row;
};
test('conservative totals preserve all readings and deduplicate native roles; decoder grants no authority', () => {
  const result = validateNativeProcessMemory(JSON.stringify(record()), 100);
  assert.equal(result.totalConservativeBytes, 430n); assert.equal(result.shellMaxBytes, 105n);
  assert.equal(result.runtimeMaxBytes, 115n); assert.equal(result.processes.length, 4);
});
for (const [name, mutate] of [
  ['PID reused across roles', row => { row.processes[3][0] = 101; }],
  ['foreign browser PID', row => { row.processes[0][0] = 109; }],
  ['duplicate GPU ownership', row => { row.processes[1][1] = 'gpu'; row.processes[1][2] = 9; }],
  ['missing actual host', row => { row.processes[1][3] = []; }],
  ['invented runtime host', row => { row.processes[3][3] = [9]; }],
  ['duplicate child identity', row => { row.processes[2][3] = [1]; }],
  ['shell mislabeled as utility', row => { row.processes[1][2] = 6; }],
  ['dropped kernel reading', row => { row.processes[0][6].pop(); }],
  ['runtime sampled outside browser bracket', row => { row.processes[3][6][0][1] = '25'; }],
  ['browser after precedes runtime', row => { row.processes[0][6][2][1] = '49'; }],
  ['estimated numeric footprint', row => { row.processes[1][6][0][0] = 100; }],
  ['sample over bounded interval', row => { row.sampleEndUs = '7000000'; }],
  ['unknown caller selection metadata', row => { row.pageSelector = '#caller'; }],
  ['unavailable kernel identity', row => { row.processes[2][4] = '0'.repeat(32); }],
  ['native refusal', row => { row.status = 'refused'; }],
]) test(`refuses ${name}`, () => {
  const row = record(); mutate(row); assert.throws(() => validateNativeProcessMemory(JSON.stringify(row), 100));
});

for (const [name, mutate] of [
  ['before response after first kernel', row => { row.workloadRequestTimes[1] = '6'; }],
  ['after request before last kernel', row => { row.workloadRequestTimes[2] = '89'; }],
  ['rounded original runtime timestamp', row => { row.workloadObservedAt[0] = 1000.5; }],
  ['reversed original runtime observation', row => { row.workloadObservedAt = [1001, 1000]; }],
  ['missing original runtime observation', row => { row.workloadObservedAt.pop(); }],
  ['refused workload mislabeled idle', row => { row.workload.status = 'refused'; }],
  ['nonempty idle VM inventory', row => { row.workload.activeExecutions = 1; }],
  ['invented shared workload selector', row => { row.workload.selector = '#caller'; }],
]) test(`refuses ${name}`, () => { const row = record(); mutate(row); assert.throws(() => validateNativeProcessMemory(JSON.stringify(row), 100)); });
const executing = () => ({ producer: 'aux-runtime-subagent-workload', version: 1, status: 'executing',
  parentRunId: 'parent', workspaceId: 'workspace', groupId: 'group', children: Array.from({ length: 5 }, (_, i) => ({
    runId: `run-${i}`, cellId: `cell-${i}`, agentId: `agent-${i}`, sourceRunId: 'parent', deadlineAt: 1000000,
    memoryLimitBytes: 128 * 1024 * 1024, sourcePageId: `human-${i}`, sourceSessionId: `human-session-${i}`, sourceDocumentEpoch: 1,
    requestedPageId: `parent-copy-${i}`, requestedSessionId: `parent-session-${i}`, requestedDocumentEpoch: 2,
    pageId: `child-copy-${i}`, sessionId: `child-session-${i}`, documentEpoch: 3,
  })) });
test('lossless compaction reconstructs both complete original five-VM observations', () => {
  const row = record(); row.workload = executing(); const result = validateNativeProcessMemory(JSON.stringify(row), 100);
  assert.deepEqual(result.workload.before, { ...row.workload, observedAt: 1000 });
  assert.deepEqual(result.workload.after, { ...row.workload, observedAt: 1001 });
  assert.equal(result.totalConservativeBytes, 430n);
});
for (const [name, mutate] of [
  ['same-source copy reused', child => { child.pageId = child.requestedPageId; }],
  ['missing current original document', child => { delete child.sourceDocumentEpoch; }],
  ['invalid current protected document', child => { child.requestedDocumentEpoch = -1; }],
  ['expired genuine VM', child => { child.deadlineAt = 1001; }],
  ['weakened original VM hard cap', child => { child.memoryLimitBytes *= 2; }],
]) test(`refuses ${name}`, () => { const row = record(); row.workload = executing(); mutate(row.workload.children[0]); assert.throws(() => validateNativeProcessMemory(JSON.stringify(row), 100)); });

const preparation = () => ({ producer: 'aux-native-subagent-preparation', version: 1, status: 'ready',
  windowId: 1, widgetRoutingId: 2, requestNonce: 'a'.repeat(32), sampleSequence: '1', runtimePid: 103,
  runtimeConnectionGeneration: '7', issuedUs: '1000000', receivedUs: '1000100', preparation: {
    producer: 'aux-runtime-subagent-preparation', version: 1, status: 'ready', observedAt: 1000, deadlineAt: 100000,
    parentRunId: 'parent', taskId: 'task', taskRevision: 1, workspaceId: 'workspace',
    pages: Array.from({length:5}, (_,i) => ({pageId:`parent-copy-${i}`,sessionId:`parent-session-${i}`,documentEpoch:1,
      sourcePageId:`human-${i}`,sourceSessionId:`human-session-${i}`,sourceDocumentEpoch:2})),
  } });
test('preparation retains the genuine paused-parent scope; native refusal is never fabricated as ready or idle', () => {
  const row = preparation(); assert.deepEqual(validateNativeSubagentPreparation(JSON.stringify(row)), row);
  const refused = {producer:'aux-native-subagent-preparation',version:1,status:'refused'};
  assert.deepEqual(validateNativeSubagentPreparation(JSON.stringify(refused)), refused);
});
for (const [name, mutate] of [
  ['wrong native producer', row => {row.producer='aux-runtime-subagent-preparation';}],
  ['unauthenticated runtime generation', row => {row.runtimeConnectionGeneration='0';}],
  ['stale preparation response', row => {row.receivedUs='6000001';}],
  ['foreign preparation scope', row => {row.preparation.selector='#caller';}],
  ['nonprotected parent source', row => {row.preparation.pages[0].pageId=row.preparation.pages[0].sourcePageId;}],
  ['unknown original document', row => {delete row.preparation.pages[0].sourceDocumentEpoch;}],
  ['expired original parent', row => {row.preparation.deadlineAt=1000;}],
]) test(`preparation refuses ${name}`, () => {const row=preparation();mutate(row);assert.throws(()=>validateNativeSubagentPreparation(JSON.stringify(row)));});

// Synthetic original-envelope controls; no native kernel/power qualification.
function readerFixture() {
  const candidate = { productIdentity: { commit:'a'.repeat(40), tree:'b'.repeat(40), label:'a'.repeat(40), dirty:false },
    native: { sourceCommit:'a'.repeat(40), buildId:'synthetic', manifestHash:'c'.repeat(64) },
    shellDigest:'d'.repeat(64), harnessCommit:'e'.repeat(40), moduleSha256:'f'.repeat(64) };
  let calls=0;
  const fixture={ mutate: row=>row, alterReceipt: receipt=>receipt };
  const transport={ async invoke(operation) {
    const count=++calls;
    let row=operation==='prepareSubagentMemoryWorkload' ? preparation() : record();
    row.sampleSequence=String(count);
    if(operation==='sampleProcessMemory') {row.sampleStartUs=String(1000000+count*1000);row.sampleEndUs=String(1000100+count*1000);}
    row=fixture.mutate(row);
    const recordRaw=JSON.stringify(row), wrapper={producer:'aux-native-fixture-reply',version:1,pid:100,windowId:1,sequence:String(count),operation,record:row};
    this.lastReceipt=fixture.alterReceipt({pid:100,generation:1,sequence:String(count),operation,recordRaw,raw:'AUX_NATIVE_FIXTURE_REPLY_V1 '+JSON.stringify(wrapper)});
    return recordRaw;
  }};
  fixture.options={transport,browserPid:100,candidate,readIdentity:async()=>({runtime:candidate.productIdentity,native:candidate.native}),
    readPower:async()=>"Now drawing from 'AC Power'"};
  fixture.calls=()=>calls;
  return fixture;
}
test('reader retains direct-child originals, fixed scope and preparation then whole kernel brackets',async()=>{
  const f=readerFixture(),reader=createNativeProcessMemoryReader(f.options);
  const ready=await reader.readPreparation();assert.equal(ready.native.status,'ready');assert.equal(ready.native.preparation.parentRunId,'parent');
  const memory=await reader.sample();assert.equal(memory.decoded.totalConservativeBytes,430n);
  assert.equal(memory.receipt.operation,'sampleProcessMemory');assert.match(memory.sha256,/^[a-f0-9]{64}$/);
  assert.ok(memory.before.power && memory.after.power && memory.raw && memory.receipt.raw);
});
test('reader preserves exact native refusal and never invents a runtime readiness record',async()=>{
  const f=readerFixture();f.mutate=()=>({producer:'aux-native-subagent-preparation',version:1,status:'refused'});
  const result=await createNativeProcessMemoryReader(f.options).readPreparation();assert.equal(result.status,'refused');
  assert.ok(!result.native.preparation && result.raw.includes('refused') && result.receipt.raw);
});
for(const [name,alter] of [
  ['foreign direct child', receipt=>({...receipt,pid:999})],
  ['foreign operation', receipt=>({...receipt,operation:'sampleShellMemory'})],
  ['wrapper/content mismatch', receipt=>({...receipt,recordRaw:'{}'})],
])test(`reader refuses ${name} retaining original bytes`,async()=>{
  const f=readerFixture();f.alterReceipt=alter;
  await assert.rejects(createNativeProcessMemoryReader(f.options).sample(),error=>Boolean(error.observation.raw && error.observation.receipt.raw));
});
test('reader refuses changed authenticated runtime scope and source identity',async()=>{
  const f=readerFixture(),reader=createNativeProcessMemoryReader(f.options);await reader.readPreparation();
  f.mutate=row=>{row.processes[3][7]='8';return row;};
  await assert.rejects(reader.sample(),error=>error.observation.raw && /scope changed/.test(error.message));
  const dirty=readerFixture();dirty.options.readIdentity=async()=>({runtime:{...dirty.options.candidate.productIdentity,dirty:true},native:dirty.options.candidate.native});
  await assert.rejects(createNativeProcessMemoryReader(dirty.options).sample());assert.equal(dirty.calls(),0);
});
test('reader requires AC before fixed native operation',async()=>{
  const f=readerFixture();f.options.readPower=async()=>"Now drawing from 'Battery Power'";
  await assert.rejects(createNativeProcessMemoryReader(f.options).sample(),/AC/);assert.equal(f.calls(),0);
});


for (const [name, change] of [
  ['shell widget document scope', row => { row.widgetRoutingId++; }],
  ['native sampler nonce', row => { row.requestNonce = 'c'.repeat(32); }],
  ['runtime peer PID', row => { row.processes[3][0]++; }],
]) test(`reader refuses changed ${name} after original paused preparation`, async () => {
  const f = readerFixture(), reader = createNativeProcessMemoryReader(f.options);
  await reader.readPreparation(); f.mutate = row => { change(row); return row; };
  await assert.rejects(reader.sample(), error => error.observation.raw && /scope changed/.test(error.message));
});

test('reader rejects reentrant observations and releases its busy state after actual completion', async () => {
  const f = readerFixture(); let release, entered;
  const arrived = new Promise(resolve => { entered = resolve; });
  const held = new Promise(resolve => { release = resolve; });
  const readIdentity = f.options.readIdentity; let first = true;
  f.options.readIdentity = async () => { if (first) { first = false; entered(); await held; } return readIdentity(); };
  const reader = createNativeProcessMemoryReader(f.options), pending = reader.readPreparation();
  await arrived;
  await assert.rejects(reader.sample(), /Concurrent native memory observation/);
  assert.equal(f.calls(), 0); release();
  assert.equal((await pending).native.status, 'ready');
  assert.equal((await reader.sample()).decoded.totalConservativeBytes, 430n);
});

test('transport timeout retains its original refusal bytes and releases reader busy state for a fresh observation', async () => {
  const f = readerFixture(), original = f.options.transport.invoke;
  let timeout = true;
  f.options.transport.invoke = async function (operation) {
    if (timeout) { timeout = false; const error = new Error('Original private fixture reply timeout'); error.nativeRaw = 'original-native-refusal'; throw error; }
    return original.call(this, operation);
  };
  const reader = createNativeProcessMemoryReader(f.options);
  await assert.rejects(reader.readPreparation(), error => error.observation.transportRefusalRaw === 'original-native-refusal');
  assert.equal((await reader.readPreparation()).native.status, 'ready');
});

test('reader refuses a replayed direct-child receipt with original bytes intact', async () => {
  const f = readerFixture(), reader = createNativeProcessMemoryReader(f.options);
  await reader.readPreparation();
  const prior = structuredClone(f.options.transport.lastReceipt);
  f.mutate = row => { row.sampleSequence = '1'; return row; };
  f.alterReceipt = () => prior;
  await assert.rejects(reader.readPreparation(), error => Boolean(error.observation.raw && error.observation.receipt.raw && /Replayed original native receipt/.test(error.message)));
});

test('same original browser receipt generation is required even for scoped native refusal', async () => {
  const f = readerFixture(), reader = createNativeProcessMemoryReader(f.options);
  await reader.readPreparation();
  f.mutate = () => ({ producer: 'aux-native-subagent-preparation', version: 1, status: 'refused' });
  f.alterReceipt = receipt => ({ ...receipt, generation: 2 });
  await assert.rejects(reader.readPreparation(), /Original browser child changed/);
});

test('exact same-child native refusal can precede original ready preparation and full memory sampling', async () => {
  const f = readerFixture(), reader = createNativeProcessMemoryReader(f.options);
  f.mutate = () => ({ producer: 'aux-native-subagent-preparation', version: 1, status: 'refused' });
  assert.equal((await reader.readPreparation()).native.status, 'refused');
  f.mutate = row => row;
  assert.equal((await reader.readPreparation()).native.preparation.parentRunId, 'parent');
  assert.equal((await reader.sample()).decoded.totalConservativeBytes, 430n);
});

for (const [name, change] of [
  ['extra refusal field', row => { row.preparation = {}; }],
  ['wrong refusal producer', row => { row.producer = 'aux-runtime-subagent-preparation'; }],
]) test(`reader rejects ${name} with genuine native envelope retained`, async () => {
  const f = readerFixture();
  f.mutate = () => { const row = { producer: 'aux-native-subagent-preparation', version: 1, status: 'refused' }; change(row); return row; };
  await assert.rejects(createNativeProcessMemoryReader(f.options).readPreparation(), error => Boolean(error.observation.raw && error.observation.receipt.raw));
});

test('AC loss after a genuine envelope refuses the observation and retains original envelope and prior AC reading', async () => {
  const f = readerFixture(); let reads = 0;
  f.options.readPower = async () => ++reads === 1 ? "Now drawing from 'AC Power'" : "Now drawing from 'Battery Power'";
  await assert.rejects(createNativeProcessMemoryReader(f.options).sample(), error => Boolean(error.observation.raw && error.observation.before.power && /AC/.test(error.message)));
  assert.equal(reads, 2); assert.equal(f.calls(), 1);
});

test('reader refuses owner window replacement even with internally matching native wrapper and record', async () => {
  const f = readerFixture(), reader = createNativeProcessMemoryReader(f.options);
  await reader.readPreparation();
  f.mutate = row => { row.windowId = 2; return row; };
  f.alterReceipt = receipt => { const wrapper = JSON.parse(receipt.raw.slice('AUX_NATIVE_FIXTURE_REPLY_V1 '.length)); wrapper.windowId = 2; return { ...receipt, raw: 'AUX_NATIVE_FIXTURE_REPLY_V1 ' + JSON.stringify(wrapper) }; };
  await assert.rejects(reader.sample(), /scope changed/);
});

test('reader refuses a foreign original wrapper PID independently of transport receipt metadata', async () => {
  const f = readerFixture();
  f.alterReceipt = receipt => { const wrapper = JSON.parse(receipt.raw.slice('AUX_NATIVE_FIXTURE_REPLY_V1 '.length)); wrapper.pid = 999; return { ...receipt, raw: 'AUX_NATIVE_FIXTURE_REPLY_V1 ' + JSON.stringify(wrapper) }; };
  await assert.rejects(createNativeProcessMemoryReader(f.options).sample(), error => Boolean(error.observation.raw && error.observation.receipt.raw));
});

test('fresh wrapper cannot replay an old native sample sequence', async () => {
  const f = readerFixture(), reader = createNativeProcessMemoryReader(f.options);
  await reader.readPreparation(); f.mutate = row => { row.sampleSequence = '1'; return row; };
  await assert.rejects(reader.sample(), /Replayed native sample\/preparation/);
});

test('fresh wrapper and native sequence cannot hide overlapping original preparation intervals', async () => {
  const f = readerFixture(), reader = createNativeProcessMemoryReader(f.options);
  await reader.readPreparation();
  await assert.rejects(reader.readPreparation(), /Native observations overlap/);
});
