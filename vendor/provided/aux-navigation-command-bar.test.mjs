import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {commitNavigation,navigationSections,NAVIGATION_ASSETS,transformAuxNavigation} from './aux-navigation-command-bar.mjs';
const baseline='/Users/rcourson/Documents/Vibe/web/out/provided-candidate-protected-startup-integration-20261023/Aux.app/Contents/Resources/aux/apps/extension/dist/';
const context={success:true,generation:'owned-generation',mode:'new-tab',commands:[]};
test('opening and blank input create no navigation; existing sections retained',()=>{
 const sections=[{id:'tabs',items:[{id:'t1'}]}];
 assert.deepEqual(navigationSections(context,'',sections),sections);
 assert.deepEqual(navigationSections({...context,mode:'tabs'},'example.test',sections),sections);
 const result=navigationSections(context,' example.test ',sections);
 assert.equal(result[0].items[0].text,'example.test');assert.equal(result[1],sections[0]);
});
test('commands filter to enabled actions; text navigation is explicit',()=>{
 const c={...context,mode:'commands',commands:[{id:'reload',title:'Reload',commandId:33002,enabled:true},{id:'back',title:'Back',commandId:33000,enabled:false}]};
 assert.equal(navigationSections(c,'',[])[0].items.length,1);
 assert.equal(navigationSections(c,'reload',[])[0].items[0].commandId,33002);
 assert.equal(navigationSections(c,'https://example.test',[])[0].id,'aux-navigation');
});
test('native commit carries exact ownership and refuses stale failures without fallback',async()=>{
 let seen;const api={commitCommand:async request=>{seen=request;return {success:false,error:'stale profile'}}};
 await assert.rejects(commitNavigation(api,context,{kind:'aux-navigate',text:'example.test'}),/stale profile/);
 assert.deepEqual(seen,{generation:'owned-generation',kind:'navigate',text:'example.test'});
 await assert.rejects(commitNavigation(api,null,{kind:'aux-navigate',text:'example.test'}),/unavailable/);
});
test('existing tab activation binds native view, never JS focus of another window',async()=>{
 let seen;await commitNavigation({commitCommand:async request=>{seen=request;return {success:true}}},context,{kind:'open-tab',tabId:91});
 assert.deepEqual(seen,{generation:'owned-generation',kind:'activate-tab',tabId:91});
});
test('all real pinned supplied assets adapt once, parse and retain every existing className',async()=>{
 for(const relative of Object.values(NAVIGATION_ASSETS)) {
  const text=await readFile(baseline+relative,'utf8');const result=transformAuxNavigation({relative,text});
  assert.ok(result.anchors.length);
  const parsed=spawnSync(process.execPath,['--check','--input-type=module'],{input:result.text,encoding:'utf8'});
  assert.equal(parsed.status,0,parsed.stderr);
  const classes=[...text.matchAll(/className:"([^"]*)"/g)].map(m=>m[1]);
  const after=[...result.text.matchAll(/className:"([^"]*)"/g)].map(m=>m[1]);
  for(const cls of classes) assert.ok(after.includes(cls),`${relative}: removed class ${cls}`);
  let replay=text;for(const anchor of result.anchors) {assert.equal(replay.split(anchor.find).length-1,anchor.count);replay=replay.replace(anchor.find,anchor.replace)}
  assert.equal(replay,result.text);
  assert.throws(()=>transformAuxNavigation({relative,text:result.text}),/expected one pinned anchor/);
 }
});
test('logical tab and Space results retain identity, independent views and real local URLs',async()=>{
 const c={...context,mode:'commands',windowTabIds:[10,11],organization:{ownerGeneration:'native-owner',revision:'42',activeSpaceId:'s1',spaces:[{id:'s1',title:'Work',order:'0'},{id:'s2',title:'Personal',order:'1'}],tabs:[{id:'a',title:'Local form',url:'https://example.test/local',nativeTabId:10,spaceId:'s1'},{id:'b',title:'Other view',url:'https://example.test/local',spaceId:'s2'}]}};
 const original=[{id:'open',items:[{kind:'open-tab',tabId:10},{kind:'open-tab',tabId:11},{kind:'open-tab',tabId:900}]}];
 const result=navigationSections(c,'',original),tabs=result.find(section=>section.id==='aux-logical-tabs').items;
 assert.deepEqual(tabs.map(tab=>tab.logicalId),['a','b']);assert.deepEqual(tabs.map(tab=>tab.actionLabel),['Switch','Open here']);
 assert.deepEqual(result.find(section=>section.id==='open').items,[{kind:'open-tab',tabId:11}]);
 assert.equal(result.find(section=>section.id==='aux-spaces').items[1].spaceId,'s2');
 let seen;const api={commitCommand:async request=>(seen=request,{success:true})};
 await commitNavigation(api,c,tabs[1]);assert.deepEqual(seen,{generation:c.generation,kind:'activate-logical-tab',id:'b',organizationOwner:'native-owner',organizationRevision:'42'});
 await commitNavigation(api,c,result.find(section=>section.id==='aux-spaces').items[1]);assert.equal(seen.kind,'select-space');assert.equal(seen.id,'s2');
 assert.equal(navigationSections(c,'Other view',original).find(section=>section.id==='aux-logical-tabs').items.length,1);
});
