import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import test from 'node:test';
import {findMachOSeaSection,readSeaBlob} from '../aside/lib/sea.mjs';
import {applyAuxCaptureContractIdentity} from './aux-capture-contract-identity.mjs';
const base='/Users/rcourson/Documents/Vibe/web/out/provided-source-snapshot-1.26.1016.1852',b=readFileSync(base+'/daemon/Contents/MacOS/aside-daemon'),s=findMachOSeaSection(b);
const originals={daemon:readSeaBlob(b.subarray(s.offset,s.offset+s.size)).code,agent:readFileSync(base+'/agent/content/content.js','utf8')};
const paths={daemon:'entry.mjs',agent:'content/content.js'},results=Object.fromEntries(Object.entries(originals).map(([component,original])=>[component,applyAuxCaptureContractIdentity({component,path:paths[component],text:original,original})]));
test('actual complete custom capture tag producer and reader pairs change together',()=>{
 const creator=results.agent.text.match(/document\.createElement\(`\$\{e\.startsWith\("capture-"\)\?"aux":"aside"\}-\$\{e\}`\)/)?.[0];assert.ok(creator);
 for(const suffix of ['capture-backdrop','capture-shrink','capture-toolbar','capture-result','capture-anchor','selection-handle','selection-popup','translate-status']){
  const tag=runInNewContext(creator,{e:suffix,document:{createElement:tag=>tag}});assert.equal(tag,(suffix.startsWith('capture-')?'aux-':'aside-')+suffix);
  if(['capture-toolbar','capture-backdrop','capture-anchor'].includes(suffix))assert.ok(results.daemon.text.includes(tag));
 }
 assert.ok(results.agent.text.includes('aux-capture-hole'));assert.ok(!results.agent.text.includes('aside-capture-hole'));
});
test('injected local capture attribute constants pair setters, readers and cleanup without CSS declaration changes',()=>{
 const before=originals.daemon,after=results.daemon.text;
 for(const name of ['STITCH_FIXED_ATTR','POPOVER_OPEN_ATTR']){
  const pattern=new RegExp(name+'=`([^`]+)`');assert.equal(after.match(pattern)[1],before.match(pattern)[1].replace('aside','aux'));
  assert.equal(after.split(name).length,before.split(name).length); // variable-based consumers are unchanged
 }
 const css=source=>source.match(/STITCH_BASE_CSS=`([^`]+)`/)[1];assert.equal(css(after).replaceAll('aux-capture-','aside-capture-'),css(before));
 assert.ok(after.includes('STITCH_FIXED_CSS=`[${STITCH_FIXED_ATTR}] { visibility: hidden !important; }`'));
});
test('only exact reviewed strings change; unsupported source, count drift and repeated generation refuse',()=>{
 for(const component of ['daemon','agent']){
  let replay=originals[component];for(const anchor of results[component].anchors)replay=replay.split(anchor.find).join(anchor.replace);assert.equal(replay,results[component].text);
  assert.throws(()=>applyAuxCaptureContractIdentity({component,path:paths[component],text:results[component].text,original:originals[component]}),/Mixed or repeated/);
  assert.throws(()=>applyAuxCaptureContractIdentity({component,path:paths[component],text:originals[component]+' aside-capture-toolbar',original:originals[component]}),/drift/);
  assert.throws(()=>applyAuxCaptureContractIdentity({component,path:paths[component],text:originals[component],original:originals[component]+' '}),/pin mismatch/);
 }
});
