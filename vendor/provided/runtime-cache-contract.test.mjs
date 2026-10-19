import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { runInNewContext } from 'node:vm';
import { DAEMON_CODE_SHA256 } from './daemon-adapter.mjs';
const source = process.env.AUX_PROVIDED_DAEMON_CODE;
test('actual supplied installer retains failure but permits valid unquarantined cached tools after wait', { skip: !source }, async () => {
  const original = readFileSync(source, 'utf8');
  assert.equal(createHash('sha256').update(original).digest('hex'), DAEMON_CODE_SHA256);
  function span(start, end) {
    assert.equal(original.split(start).length - 1, 1);
    const offset = original.indexOf(start), finish = original.indexOf(end, offset);
    assert.ok(finish > offset); return original.slice(offset, finish);
  }
  const acquire = span('async function acquireAgentRuntimeUse(', 'function getAgentRuntimeJob(');
  const start = span('function startAgentRuntimeInstall(', 'var import_yauzl,');
  const safe = span('function safeInstallError(', 'function getAgentRuntimeStatus(');
  const create = runInNewContext(`(function(deps){
    let activeInstall, activeInstallForced=false, pendingForcedInstall, agentRuntimeJob={state:'idle'}, runtimeUseCount=0, resolveRuntimeUsesDrained;
    const {performInstall,getLocalAgentRuntimeVersion,hasMacOSRuntimeQuarantine}=deps;
    const path={resolve:x=>x}, ASIDE_RUNTIME_DIR='/disposable/runtime', resolveAgentRuntimeTarget=()=> 'darwin-arm64';
    const recoverRuntimeBackup=async()=>{},serializeReplacement=fn=>fn(),setAgentRuntimeProgress=()=>{};
    ${safe}${acquire}${start}
    return {start:startAgentRuntimeInstall,acquire:acquireAgentRuntimeUse,job:()=>agentRuntimeJob,count:()=>runtimeUseCount};
  })`, { Error });
  let rejectInstall;
  const pending = new Promise((_, reject) => { rejectInstall = reject; });
  let valid = true, quarantined = false;
  const runtime = create({ performInstall: () => pending, getLocalAgentRuntimeVersion: async () => valid ? '1.26.1019.335' : undefined, hasMacOSRuntimeQuarantine: async () => quarantined });
  runtime.start(); let settled = false;
  const waiting = runtime.acquire().then((r) => { settled = true; return r; });
  await Promise.resolve(); assert.equal(settled, false);
  rejectInstall(new Error('real metadata endpoint unavailable'));
  const ready = await waiting;
  assert.equal(runtime.job().state, 'failed'); assert.equal(runtime.job().error, 'real metadata endpoint unavailable');
  assert.equal(ready.state, 'ready'); assert.equal(runtime.count(), 1);
  ready.release(); ready.release(); assert.equal(runtime.count(), 0);
  valid = false; assert.equal((await runtime.acquire()).state, 'failed');
  valid = true; quarantined = true; assert.equal((await runtime.acquire()).state, 'failed');
});
