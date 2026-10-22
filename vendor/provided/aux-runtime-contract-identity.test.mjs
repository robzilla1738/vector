import assert from 'node:assert/strict';
import{readFileSync,mkdtempSync,mkdirSync,writeFileSync,rmSync}from'node:fs';
import{createHash}from'node:crypto';
import{tmpdir}from'node:os';
import{join,dirname}from'node:path';
import{execFileSync}from'node:child_process';
import{runInNewContext,SourceTextModule}from'node:vm';
import test from'node:test';
import{findMachOSeaSection,readSeaBlob}from'../aside/lib/sea.mjs';
import{applyAuxProviderIdentity}from'./aux-provider-identity.mjs';
import{adaptDaemonCode}from'./daemon-adapter.mjs';
import{applyAuxRuntimeContractIdentity,auxRuntimeContractInputs,migrateAuxRuntimeReference,migrateAuxRuntimeStorage,migrateAuxSkillMetadata}from'./aux-runtime-contract-identity.mjs';
const root='/Users/rcourson/Documents/Vibe/web/out/provided-source-snapshot-1.26.1016.1852';
const binary=readFileSync(root+'/daemon/Contents/MacOS/aside-daemon'),section=findMachOSeaSection(binary),daemon=readSeaBlob(binary.subarray(section.offset,section.offset+section.size)).code;
const brand=t=>t.replaceAll('ASIDE_','AUX_').replaceAll('Aside','Aux');
const originalFor=pin=>pin.component==='daemon'?daemon:readFileSync(root+(pin.component==='agent'?'/agent/':'/daemon/Contents/Resources/static/skills/')+pin.path,'utf8');
const transform=(component,path)=>{const pin=auxRuntimeContractInputs.find(p=>p.component===component&&p.path===path),original=originalFor(pin);return applyAuxRuntimeContractIdentity({...pin,original,text:brand(original)}).text};

test('all actual pinned contracts replay after provider migration and preserve valid code/HTML',()=>{
 for(const pin of auxRuntimeContractInputs){const original=originalFor(pin);for(const branding of['supplied','aux']){
  let text=branding==='aux'?brand(original):original;
  if(branding==='aux'&&pin.component!=='skill')text=applyAuxProviderIdentity({...pin,original,text}).text;
  const result=applyAuxRuntimeContractIdentity({...pin,original,text,branding});
  assert.ok(result.anchors.length);assert.throws(()=>applyAuxRuntimeContractIdentity({...pin,original,text:result.text,branding}),/drift/);
  assert.throws(()=>applyAuxRuntimeContractIdentity({...pin,original:original+' ',text,branding}),/pin/);
  if(pin.component!=='skill')new SourceTextModule(result.text);
  if(pin.path==='builtin/aside/SKILL.md'){assert.equal(result.path,'builtin/aux/SKILL.md');assert.match(result.text,/name: aux\n/);assert.ok(result.text.includes('aux.sessions.list('));}
  if(pin.component==='daemon')assert.ok(result.text.includes('case`article`:case`aside`:case`blockquote`'));
 }}
 assert.throws(()=>applyAuxRuntimeContractIdentity({component:'agent',path:'new-format.js',text:'"aside.inboxNotification"'}),/Unpinned/);
});

test('actual REPL global retains account-bound settings and project behavior under Aux namespace',()=>{
 const text=transform('daemon','entry.mjs');
 const constructors={};
 for(const[name,next]of[['AuxRepl','AuxProjectsRepl'],['AuxProjectsRepl','AuxPDFRepl'],['AuxSettingsRepl','AuxSessionsRepl']]){
  const re=new RegExp(name+'=(class\\{[\\s\\S]*?\\}),'+next+'=');const match=text.match(re);assert.ok(match,name);constructors[name]=match[1];
 }
 const state={account:undefined,settings:{theme:'retained'}},context={ProjectStore:{list:account=>{assert.equal(account,42);return[{id:'visible'},{id:'archived',archivedAt:1}]}},settings:account=>{state.account=account;return{getAll:()=>state.settings,get:key=>state.settings[key],set:(key,value)=>{state.settings[key]=value();return{settings:state.settings}}}},AuxDeviceRepl:class{},AuxPDFRepl:class{},AuxSessionsRepl:class{},AuxRoutinesRepl:class{},AuxChannelsRepl:class{},hardenReplSurface:x=>x,ei:42,ni:{resolvePath:x=>x},Cn:{agentSessionId:'fixture-session',hooks:{}},api:undefined};
 const injection=text.match(/aux:hardenReplSurface\(new AuxRepl\(ei,ni.resolvePath,Cn.agentSessionId,Cn.hooks\)\)/)?.[0];assert.ok(injection);
 runInNewContext(`const AuxProjectsRepl=${constructors.AuxProjectsRepl};const AuxSettingsRepl=${constructors.AuxSettingsRepl};const AuxRepl=${constructors.AuxRepl};globalThis.api={${injection}};`,context);
 assert.ok(!Object.hasOwn(context.api,'aside'));assert.equal(context.api.aux.settings.get('theme'),'retained');assert.equal(state.account,42);
 assert.deepEqual(JSON.parse(JSON.stringify(context.api.aux.projects.list())),[{id:'visible'}]);
 context.api.aux.settings.set('theme','preserved');assert.equal(state.settings.theme,'preserved');
 assert.throws(()=>context.api.aux.settings.set('contextAwareness',{}),/only be changed by the user/);
});

test('actual task/file/routine parsers retain full IDs after shorter Aux prefixes',()=>{
 const text=transform('agent','assets/conversation-D9Q3VEsl.js');
 const media=text.match(/(function J\(e\)\{[\s\S]*?\})var je=/)?.[1];assert.ok(media);
 const link=text.match(/function \$e\(e\)\{[^}]+\}/)?.[0];assert.ok(link);
 const context={media:undefined,link:undefined};runInNewContext(`${media};${link};globalThis.media=J;globalThis.link=$e;`,context);
 assert.equal(context.link('aux:task/TASK-12'),'TASK-12');assert.equal(context.link('#aux-task/TASK-12'),'TASK-12');
 assert.equal(context.media('aux:task/TASK-12/files/tmp/file.png').path,'tmp/file.png');
 assert.equal(context.media('aux:task/TASK-12/files/tmp/../secret'),null);
 assert.ok(text.includes('a.url.slice("aux:task/".length)'));assert.ok(text.includes('e.slice("#aux-task-file/".length)'));
 const plugin=text.match(/(function _t\(\)\{[\s\S]*?\})var me=/)?.[1];assert.ok(plugin);runInNewContext(plugin+';globalThis.plugin=_t;',context);
 const tree={type:'root',children:[{type:'link',url:'aux:task/TASK-12/files/tmp/file.png'},{type:'link',url:'aux:task/TASK-12'}]};context.plugin()(tree);assert.equal(tree.children[0].url,'#aux-task-file/TASK-12/files/tmp/file.png');assert.equal(tree.children[1].url,'#aux-task/TASK-12');
 const decode=text.match(/e\?\.startsWith\("#aux-task-file\/"\)\?(`aux:task\/\$\{e.slice\("#aux-task-file\/".length\)\}`):e/)?.[1];assert.ok(decode);assert.equal(runInNewContext(decode,{e:tree.children[0].url}),'aux:task/TASK-12/files/tmp/file.png');
 const tools=transform('agent','assets/tool-definition-registry-Cc6FCFb2.js');assert.ok(tools.includes('c.slice("#aux-file:".length)'));assert.ok(tools.includes('c.slice("#aux-routine:".length)'));
 assert.equal(migrateAuxRuntimeReference('aside:task/TASK-12/files/tmp/file.png'),'aux:task/TASK-12/files/tmp/file.png');
 assert.equal(migrateAuxRuntimeReference('#aside-routine:kept%2Fid'),'#aux-routine:kept%2Fid');
 assert.equal(migrateAuxRuntimeReference('https://example.com/aside:task/test'),'https://example.com/aside:task/test');
});

test('native event proposal replays against pinned baselines and matches actual Agent receivers',()=>{
 const base=new URL('../../docs/integration/proposed/aux-runtime-contract-identity/',import.meta.url),manifest=JSON.parse(readFileSync(new URL('manifest.json',base)));
 const temp=mkdtempSync(join(tmpdir(),'aux-runtime-events-'));
 try{for(const file of manifest.files){const bytes=readFileSync(new URL('baseline/'+file.path,base));assert.equal(createHash('sha256').update(bytes).digest('hex'),file.baselineSha256);const path=join(temp,file.path);mkdirSync(dirname(path),{recursive:true});writeFileSync(path,bytes);}
  execFileSync('/usr/bin/patch',['-p1','--batch'],{cwd:temp,input:readFileSync(new URL('native.patch',base))});
  const worker=transform('agent','background.js');
  for(const file of manifest.files){const bytes=readFileSync(join(temp,file.path));assert.equal(createHash('sha256').update(bytes).digest('hex'),file.outputSha256);for(const edit of file.edits)assert.ok(worker.includes('"'+edit.replace+'"'));}
 }finally{rmSync(temp,{recursive:true,force:true})}
 const original={version:1,entries:{'aside:web-sidebar-state':'retained-value',unrelated:'keep'}};
 const next=migrateAuxRuntimeStorage(original);assert.equal(next.entries['aux:web-sidebar-state'],'retained-value');assert.equal(original.entries['aside:web-sidebar-state'],'retained-value');
 assert.throws(()=>migrateAuxRuntimeStorage({version:1,entries:{'aside:web-sidebar-state':1,'aux:web-sidebar-state':2}}),/Ambiguous/);
 const metadata={agents:['aside','aside-code','other'],description:'kept',custom:{token:'synthetic'}};const mapped=migrateAuxSkillMetadata(metadata);assert.deepEqual(mapped.agents,['aux','aux-code','other']);assert.deepEqual(mapped.custom,metadata.custom);assert.equal(metadata.agents[0],'aside');assert.throws(()=>migrateAuxSkillMetadata({agents:'aside'}),/Malformed/);
});

test('existing local and cloud composed daemon remain compatible with provider-then-runtime ordering',()=>{
 for(const cloud of[{}, {enableCloud:true,profile:'development'}]){
  const composed=adaptDaemonCode(daemon,cloud).code;
  const provider=applyAuxProviderIdentity({component:'daemon',path:'entry.mjs',text:composed,original:daemon}).text;
  const runtime=applyAuxRuntimeContractIdentity({component:'daemon',path:'entry.mjs',text:provider,original:daemon});assert.equal(runtime.anchors.length,14);new SourceTextModule(runtime.text);
 }
});
