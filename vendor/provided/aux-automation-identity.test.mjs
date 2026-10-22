import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Script, SourceTextModule, runInNewContext } from 'node:vm';
import test from 'node:test';
import { findMachOSeaSection, readSeaBlob } from '../aside/lib/sea.mjs';
import { adaptDaemonCode } from './daemon-adapter.mjs';
import { applyAuxProviderIdentity } from './aux-provider-identity.mjs';
import { applyAuxRuntimeContractIdentity } from './aux-runtime-contract-identity.mjs';
import { applyAuxAutomationIdentity } from './aux-automation-identity.mjs';
const binary = readFileSync('/Users/rcourson/Documents/Vibe/web/out/provided-source-snapshot-1.26.1016.1852/daemon/Contents/MacOS/aside-daemon');
const section = findMachOSeaSection(binary), original = readSeaBlob(binary.subarray(section.offset,section.offset+section.size)).code;
const run = text => applyAuxAutomationIdentity({component:'daemon',path:'entry.mjs',text,original});

/** Extract an actual static injected string, never evaluate the daemon module. */
function literal(source, name) {
  const prefix = name + '=';
  let start = source.indexOf(prefix);
  assert.ok(start >= 0, name);
  start += prefix.length;
  const raw = source.startsWith('String.raw',start);
  if (raw) start += 'String.raw'.length;
  const quote = source[start]; assert.ok(['"',"'",'`'].includes(quote));
  let end = start + 1;
  for (;end<source.length;end++) {
    if (source[end] === '\\') {end++;continue;}
    if (quote === '`' && source.slice(end,end+2) === '${') {
      assert.equal(name,'CONSOLE_INTERCEPTOR_SCRIPT');
      assert.equal(source.slice(end,end+18),'${MAX_BUFFER_SIZE}');
      end += 17; continue;
    }
    if (source[end] === quote) break;
  }
  assert.ok(end < source.length);
  return runInNewContext((raw?'String.raw':'') + source.slice(start,end+1),{MAX_BUFFER_SIZE:1000});
}

test('original and composed protocol/provider/runtime sources replay exact counts without altering unrelated contracts', () => {
  for (const text of [original,...[{}, {enableCloud:true,profile:'development'}].map(cloud => {
    const composed = adaptDaemonCode(original,cloud,'aux-v1').code;
    const provider = applyAuxProviderIdentity({component:'daemon',path:'entry.mjs',text:composed,original}).text;
    return applyAuxRuntimeContractIdentity({component:'daemon',path:'entry.mjs',text:provider,original}).text;
  })]) {
    const result = run(text); assert.equal(result.anchors.length,23);
    new SourceTextModule(result.text);
    assert.equal(result.text.includes('__aside'),false);
    for (const unchanged of ['aside_dom','aside-memory-runtime-v1','aside.dk.','aside.wrap.dk.v1','AsideNativeRun']) assert.equal(result.text.split(unchanged).length,text.split(unchanged).length);
    assert.equal(result.text.split('case`article`:case`aside`:case`blockquote`').length,text.split('case`article`:case`aside`:case`blockquote`').length);
    assert.throws(()=>run(result.text),/Mixed|drift/);
  }
  assert.throws(()=>applyAuxAutomationIdentity({component:'daemon',path:'entry.mjs',text:original,original:original+' '}),/source pin/);
  assert.throws(()=>run(original.replace('globalThis.__aside = {','globalThis.__unknown = {')),/drift/);
  assert.throws(()=>applyAuxAutomationIdentity({component:'agent',path:'unknown.js',text:'__aside.takeSnapshot()'}),/Unpinned/);
});

test('actual injected browser scripts parse and retain paired Aux globals and CDP callers', () => {
  const text = run(original).text;
  for (const name of ['BUNDLE$1','CONSOLE_INTERCEPTOR_SCRIPT','QUICKJS_PRELUDE','BUFFER_BUNDLE']) {
    const script = literal(text,name);new Script(script);
    assert.equal(script.includes('__aside'),false,name);
  }
  const bundle = literal(text,'BUNDLE$1');
  assert.ok(bundle.includes('globalThis.__aux = {'));
  for(const method of ['takeSnapshot','getSnapshotElement','waitForReady','checkHitTarget','checkEditable']) {
    assert.ok(bundle.includes(method),method);
    assert.ok(text.includes('globalThis.__aux.'+method)||text.includes('__aux?.'+method),method+' caller');
  }
  assert.ok(text.includes('ISOLATED_WORLD_NAME=`__aux_utility`'));
  assert.ok(literal(text,'QUICKJS_PRELUDE').includes('globalThis.__aux = {'));
  const context = {};
  runInNewContext(literal(text,'BUFFER_BUNDLE'),context);
  assert.equal(context.__auxBufferModule.Buffer.from('preserved').toString(),'preserved');
  assert.equal(Object.hasOwn(context,'__asideBufferModule'),false);
});

test('real console injector and matching callers preserve logging, drain, clear and reinjection guard', () => {
  const text = run(original).text, script = literal(text,'CONSOLE_INTERCEPTOR_SCRIPT');
  const calls=[];const console=Object.fromEntries(['log','info','warn','error','debug'].map(level=>[level,(...args)=>calls.push({level,args})]));
  const window={};const context={window,console};runInNewContext(script,context);
  const first=window.__auxConsole;assert.ok(first);
  console.log('fixture',42);assert.equal(calls.length,1);
  assert.equal(first.drain({}).length,1);assert.equal(first.drain({}).length,1);
  assert.equal(first.drain({levels:['error']}).length,0);
  console.warn('clear');first.clear();assert.equal(first.drain({}).length,0);
  runInNewContext(script,context);assert.equal(window.__auxConsole,first);
  assert.ok(text.includes('window.__auxConsole?.drain(Cn)'));
  assert.ok(text.includes('(window).__auxConsole?.clear()'));
});

test('private account authorities and background identifiers remain singular and preserve segmented IDs', () => {
  const text=run(original).text;
  for(const suffix of ['AccountRegistry','AuthInflightRefreshes','AuthPendingGoogleOAuthAttempts','AuthRecentRefreshes','AuthRefreshBackoffs']) assert.equal(text.split('__aux'+suffix).length-1,1);
  for(const name of ['context-awareness-summary','memory-dream','taxonomy_migrate','lasso']) {
    assert.equal(original.split('aside:aux:'+name).length-1,1);
    assert.equal(text.split('aux:aux:'+name).length-1,1);
  }
  // All four original occurrences are complete sessionId literals; no hidden prefix
  // parser or legacy-length slice consumer is present for this private namespace.
  assert.equal(original.split('aside:aux:').length-1,4);
  assert.equal((original.match(/sessionId:`aside:aux:/g)??[]).length,4);
});
