import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import test from 'node:test';
import {findMachOSeaSection,readSeaBlob} from '../aside/lib/sea.mjs';
import {applyAuxRuntimeCorrectnessIdentity} from './aux-runtime-correctness-identity.mjs';
const binary=readFileSync('/Users/rcourson/Documents/Vibe/web/out/provided-source-snapshot-1.26.1016.1852/daemon/Contents/MacOS/aside-daemon'),section=findMachOSeaSection(binary),original=readSeaBlob(binary.subarray(section.offset,section.offset+section.size)).code;
const apply=text=>applyAuxRuntimeCorrectnessIdentity({text,original});
const result=apply(original);
function extract(source,regex){const match=source.match(regex);assert.ok(match,'Actual supplied function anchor must match');return runInNewContext(`(${match[1]})`)}

test('actual pinned daemon edits pair coding skill selector and preserve every other byte',()=>{
 const rules=JSON.parse(readFileSync(new URL('../../docs/integration/proposed/aux-runtime-correctness-identity/inputs.json',import.meta.url))).rules;
 assert.equal(result.anchors.length,4);let expected=original;for(const rule of rules){assert.equal(expected.split(rule.find).length-1,1);expected=expected.replace(rule.find,rule.replace)}assert.equal(result.text,expected);
 const before=extract(original,/(Cn=>Cn\.agents\?Cn\.agents\.includes\(`aside-code`\):!Cn\.path\.startsWith\(`\$\{ni\}\$\{path\.sep\}`\))/);
 const after=extract(result.text,/(Cn=>Cn\.agents\?Cn\.agents\.includes\(`aux-code`\):!Cn\.path\.startsWith\(`\$\{ni\}\$\{path\.sep\}`\))/);
 assert.equal(before({agents:['aux-code']}),false);assert.equal(after({agents:['aux-code']}),true);assert.equal(after({agents:['aside-code']}),false);assert.equal(after({agents:['other']}),false);
 assert.ok(result.text.includes('aux-code skill or CLI'));assert.ok(!result.text.includes('aside-code skill or CLI'));
});
test('actual process matcher accepts Aux and rejects original or unrelated daemons without executing recovery',()=>{
 const name='function isAsideDaemonCommand(Cn){',start=result.text.indexOf(name),end=result.text.indexOf('}async function reclaimPortFromWedgedAsideDaemon()',start);assert.ok(start>0&&end>start);const matcher=runInNewContext(`(${result.text.slice(start,end+1)})`);
 for(const name of ['/disposable/Aux Daemon.app/Contents/MacOS/aux-daemon','aux-daemon'])assert.equal(matcher(name),true);
 for(const name of ['/Applications/Aside Daemon.app/Contents/MacOS/aside-daemon','neon-daemon','faux-daemon','node','python','aux-daemon --home /tmp/disposable','/bin/node --name=aux-daemon','/bin/node /tmp/aux-daemon'])assert.equal(matcher(name),false);
 // The complete recovery function, including port/PID/signal checks, stays unchanged.
 const recovery=source=>source.slice(source.indexOf('async function reclaimPortFromWedgedAsideDaemon()'),source.indexOf('async function resolveUnresponsivePortOwner('));assert.ok(recovery(original).length>200);assert.equal(recovery(result.text),recovery(original));
});
test('actual history predicate changes only the product entry while retaining foreign browsers',()=>{
 const predicate=extract(result.text,/(Cn=>\/\\b\(aux\|chrome\|safari\|firefox\|arc\|edge\|brave\|vivaldi\|opera\|browser\)\\b\/i\.test\(Cn\))/);
 assert.equal(predicate('Aux'),true);assert.equal(predicate('Aside'),false);assert.equal(predicate('Auxiliary'),false);assert.equal(predicate('Notes'),false);
 for(const name of ['Chrome','Safari','Firefox','Arc','Edge','Brave','Vivaldi','Opera','Browser'])assert.equal(predicate(name),true);
});
test('source drift, unknown inputs and mixed/repeated generations fail closed',()=>{
 assert.throws(()=>applyAuxRuntimeCorrectnessIdentity({text:original,original:original+' '}),/pin mismatch/);
 assert.throws(()=>apply(original.replace('aside-code skill or CLI','missing')),/drift/);
 assert.throws(()=>apply(result.text),/Mixed or repeated/);
 assert.throws(()=>applyAuxRuntimeCorrectnessIdentity({component:'agent',text:original,original}),/Unsupported/);
});
