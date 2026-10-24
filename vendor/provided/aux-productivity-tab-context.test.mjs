import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {captureTabCandidates,validateTabAttachments,transformAuxTabContext} from './aux-productivity-tab-context.mjs';
const tab={type:'tab',targetId:'native-view',url:'https://example.test/page',name:'Example'};
test('capture preserves supplied item display and binds only native issued capability',async()=>{
 const candidate={...tab};const captured=await captureTabCandidates({captureTabReferences:async input=>({success:true,references:input.references.map(ref=>({...ref,documentCapability:'native-document-token'}))})},[candidate,{type:'skill',id:'skill'}]);
 assert.equal(captured[0].name,'Example');assert.equal(captured[0].documentCapability,'native-document-token');assert.ok(!candidate.documentCapability);assert.equal(captured[1].type,'skill');
 await assert.rejects(captureTabCandidates({captureTabReferences:async()=>({success:true,references:[{...tab,targetId:'other-view',documentCapability:'x'}]})},[tab]),/changed/);
});
test('missing, restored, navigated or foreign-profile references refuse without changing draft data',async()=>{
 const stale={...tab,documentCapability:'old-document'};const draft=[stale];const before=JSON.stringify(draft);
 await assert.rejects(validateTabAttachments({},[tab]),/Select referenced/);
 await assert.rejects(validateTabAttachments({validateTabReferences:async()=>({success:false,error:'Document changed'})},draft),/Document changed/);
 assert.equal(JSON.stringify(draft),before);
 let request;await validateTabAttachments({validateTabReferences:async value=>{request=value;return{success:true}}},draft);
 assert.deepEqual(request,{references:[{targetId:tab.targetId,url:tab.url,documentCapability:'old-document'}]});
});
test('actual supplied picker, editor, mention, current-tab and submit sources parse with unchanged classes',()=>{
 const root='/Users/rcourson/Documents/Vibe/web/out/provided-candidate-protected-startup-integration-20261023/Aux.app/Contents/Resources/aux/apps/extension/dist';
 const directory=mkdtempSync(join(tmpdir(),'aux-tab-context-fixture-'));
 try{
  for(const name of ['provider-Cw0zhujt.js','create-editor-B-Br5Wz9.js','utils-Cl9zfMcr.js','browser-binding-CzDmxQNA.js','permission-approval-D-GTf91U.js']){
   const relative=`assets/${name}`,source=readFileSync(join(root,relative),'utf8'),result=transformAuxTabContext({relative,text:source});assert.ok(result.anchors.length);
   assert.deepEqual([...result.text.matchAll(/className:"([^"]+)"/g)].map(x=>x[1]),[...source.matchAll(/className:"([^"]+)"/g)].map(x=>x[1]));
   const path=join(directory,name+'.mjs');writeFileSync(path,result.text);const checked=spawnSync(process.execPath,['--check',path],{encoding:'utf8'});assert.equal(checked.status,0,checked.stderr);
  }
 }finally{rmSync(directory,{recursive:true,force:true})}
});
