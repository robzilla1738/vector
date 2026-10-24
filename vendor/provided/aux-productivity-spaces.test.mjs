import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {spawnSync} from 'node:child_process';
import {loadMentionSpaces,addMentionSpaces,captureMentionSpace,transformAuxMentionSpaces} from './aux-productivity-spaces.mjs';
import {transformAuxTabContext} from './aux-productivity-tab-context.mjs';
const snapshot={success:true,accountId:2,ownerGeneration:'epoch',revision:'3',spaces:[{id:'s',title:'Work',order:'0',unloaded:1},{id:'empty',title:'Later',order:'1',unloaded:2}],tabs:[{id:'logical',targetId:'native',title:'Draft',url:'https://example.test',spaceId:'s',spaceLabel:'Work'}]};
test('Space and native-view identities remain separate; same-URL views are not deduplicated',()=>{
 const original={type:'tab',targetId:'native',url:'https://example.test',name:'Draft',description:'example.test'};
 const rows=addMentionSpaces([original],{...snapshot,tabs:[...snapshot.tabs,{...snapshot.tabs[0],targetId:'native2'}]});
 assert.equal(rows[0].description,'Work · example.test');assert.equal(original.description,'example.test');assert.equal(rows[1].tabs.length,2);assert.match(rows[1].description,/2 open tabs · 1 unloaded/);assert.equal(rows[2].tabs.length,0);
});
test('account switch and refused native membership preserve explicit selection; unloaded tabs do not load',async()=>{
 await assert.rejects(loadMentionSpaces({getTabMentionSpaces:async()=>snapshot},2,()=>9),/Profile changed/);
 const group=addMentionSpaces([],snapshot)[0];let called;
 await assert.rejects(captureMentionSpace({captureTabMentionSpace:async r=>(called=r,{success:false,error:'Space changed'})},group,group.tabs,()=>assert.fail()),/Space changed/);
 assert.deepEqual(called.references,[{targetId:'native',url:'https://example.test'}]);assert.equal(called.spaceId,'s');
 await assert.rejects(captureMentionSpace({},addMentionSpaces([],snapshot)[1],[],()=>assert.fail()),/no open pages/);
 const selected=await captureMentionSpace({captureTabMentionSpace:async()=>({success:true,references:[{targetId:'native',url:'https://example.test',documentCapability:'native-cap'}]})},group,group.tabs,()=>assert.fail());
 assert.equal(selected[0].documentCapability,'native-cap');assert.ok(!group.tabs[0].documentCapability);
});
test('actual supplied menu composes after document guards, retains classes and parses once',()=>{
 const relative='assets/provider-Cw0zhujt.js',baseline=readFileSync('/Users/rcourson/Documents/Vibe/web/out/provided-candidate-protected-startup-integration-20261023/Aux.app/Contents/Resources/aux/apps/extension/dist/'+relative,'utf8');
 const guarded=transformAuxTabContext({relative,text:baseline}).text;const result=transformAuxMentionSpaces({relative,text:guarded});
 assert.deepEqual([...result.text.matchAll(/className:"([^"]*)"/g)].map(m=>m[1]),[...guarded.matchAll(/className:"([^"]*)"/g)].map(m=>m[1]));
 assert.equal(spawnSync(process.execPath,['--check','--input-type=module'],{input:result.text,encoding:'utf8'}).status,0);
 assert.throws(()=>transformAuxMentionSpaces({relative,text:result.text}),/expected one/);
});
