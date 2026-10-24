import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {SourceTextModule} from 'node:vm';
import {pathToFileURL} from 'node:url';
import {AUX_FEATURE_SHORTCUTS,SHORTCUT_PROFILE_ASSETS,transformAuxShortcutProfiles,parseAuxShortcutProfile,createAuxShortcutProfileSession} from './aux-shortcut-profiles.mjs';
const {transformAuxNavigation}=await import(process.env.AUX_NAVIGATION_ADAPTER?pathToFileURL(process.env.AUX_NAVIGATION_ADAPTER):new URL('./aux-navigation-command-bar.mjs',import.meta.url));
const root=process.env.AUX_SUPPLIED_SOURCE_ROOT??'/Users/rcourson/Documents/Vibe/web/out/provided-source-snapshot-1.26.1016.1852/agent';
const state=(revision='r1',ownerGeneration='a')=>({success:true,format:'aux-shortcuts',version:1,platform:'mac',ownerGeneration,revision,bindings:[]});
const envelope=mappings=>({format:'aux-shortcuts',version:1,platform:'mac',mappings});

test('pinned supplied shortcut pages preserve original bytes/styles and support unbound feature rows',async()=>{
  for(const [key,hash] of [['page','1f5d14b3e30936cfb80f0365da8e4dae92ff696aaf19b57d4bc2a38ddfa60506'],['capture','4223c21368db248316b71f434dafa996af0def37f2db26fc9d80caf19e2cad7c']]){
    const relative=SHORTCUT_PROFILE_ASSETS[key],source=await readFile(`${root}/${relative}`,'utf8');
    assert.equal(createHash('sha256').update(source).digest('hex'),hash);
    const text=transformAuxNavigation({relative,text:source}).text;
    const result=transformAuxShortcutProfiles({relative,text});new SourceTextModule(result.text);
    assert.equal(result.anchors.length,key==='capture'?3:2);let restored=result.text;
    for(const anchor of [...result.anchors].reverse())restored=restored.replace(anchor.replace,anchor.find);
    assert.equal(restored,text);assert.throws(()=>transformAuxShortcutProfiles({relative,text:result.text}),/pinned anchor/);
  }
  assert.deepEqual(AUX_FEATURE_SHORTCUTS.map(row=>row[1]),Array.from({length:20},(_,i)=>34120+i));
});
test('one import and one reset use native receipts and latest revision rather than per-command writes',async()=>{
  const calls=[],states=[];
  const api={getShortcutProfile:async()=>state(),importShortcutProfile:async input=>{calls.push(['import',input]);return state('r2')},
    resetShortcutProfile:async input=>{calls.push(['reset',input]);return state('r3')},
    exportShortcutProfile:async()=>({...state('r3'),configuration:envelope({'34120':''})})};
  const client=createAuxShortcutProfileSession(api,s=>states.push(s),()=>{});
  await client.load();await client.apply({'34061':'Command+K'});await client.reset();
  assert.deepEqual(calls,[['import',{ownerGeneration:'a',revision:'r1',mappings:{'34061':'Command+K'}}],['reset',{ownerGeneration:'a',revision:'r2'}]]);
  assert.deepEqual(await client.export(),envelope({'34120':''}));assert.equal(states.length,3);
});
test('refused imports require explicit reload; a new owner cannot be adopted',async()=>{
  let current=state(),writes=0;const errors=[];
  const client=createAuxShortcutProfileSession({getShortcutProfile:async()=>current,
    importShortcutProfile:async()=>{writes++;return{success:false,error:'Shortcut collision'}}},()=>{},e=>errors.push(e));
  await client.load();await assert.rejects(client.apply({}),/collision/);await assert.rejects(client.apply({}),/Reload/);assert.equal(writes,1);
  current=state('r2','b');await assert.rejects(client.load(),/Profile changed/);
  assert.equal(errors.length,3);
});
test('closing an in-flight operation prevents state publication and future operations',async()=>{
  let finish;const states=[];
  const client=createAuxShortcutProfileSession({getShortcutProfile:async()=>state(),
    importShortcutProfile:()=>new Promise(resolve=>finish=resolve)},s=>states.push(s),()=>{});
  await client.load();const pending=client.apply({});await assert.rejects(client.reset(),/in progress/);
  client.close();finish(state('r2'));assert.equal(await pending,null);assert.equal(states.length,1);
  await assert.rejects(client.load(),/closed/);
});
test('portable input is bounded, versioned and excludes global Mini popup authority',()=>{
  assert.deepEqual(parseAuxShortcutProfile(JSON.stringify(envelope({'34120':'','34061':'Command+K'}))),envelope({'34120':'','34061':'Command+K'}));
  for(const value of [null,[],{},envelope({'34069':'Alt+Space'}),envelope(JSON.parse('{"__proto__":"Command+K"}')),
    {...envelope({}),version:2},{...envelope({}),platform:'windows'},{...envelope({}),ownerGeneration:'secret'},envelope({'34061':3})])
    assert.throws(()=>parseAuxShortcutProfile(JSON.stringify(value)));
  assert.throws(()=>parseAuxShortcutProfile(' '.repeat(65537)));
});
