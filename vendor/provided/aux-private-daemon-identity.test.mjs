import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {SourceTextModule,runInNewContext} from 'node:vm';
import test from 'node:test';
import {findMachOSeaSection,readSeaBlob} from '../aside/lib/sea.mjs';
import {adaptDaemonCode} from './daemon-adapter.mjs';
import {applyAuxProviderIdentity} from './aux-provider-identity.mjs';
import {applyAuxRuntimeContractIdentity} from './aux-runtime-contract-identity.mjs';
import {applyAuxAutomationIdentity} from './aux-automation-identity.mjs';
import {applyAuxPrivateDaemonIdentity} from './aux-private-daemon-identity.mjs';
const bytes=readFileSync('/Users/rcourson/Documents/Vibe/web/out/provided-source-snapshot-1.26.1016.1852/daemon/Contents/MacOS/aside-daemon');
const section=findMachOSeaSection(bytes),original=readSeaBlob(bytes.subarray(section.offset,section.offset+section.size)).code;
const run=text=>applyAuxPrivateDaemonIdentity({component:'daemon',path:'entry.mjs',text,original});
const count=(text,token)=>text.split(token).length-1;
test('source and composed modules parse; exact reversible anchors preserve every other byte',()=>{
 for(const text of [original,...[{}, {enableCloud:true,profile:'development'}].map(cloud=>{
   let text=adaptDaemonCode(original,cloud,'aux-v1').code;
   for(const apply of [applyAuxProviderIdentity,applyAuxRuntimeContractIdentity,applyAuxAutomationIdentity])text=apply({component:'daemon',path:'entry.mjs',text,original}).text;
   return text;
 })]) {
  const result=run(text);assert.equal(result.anchors.length,17);new SourceTextModule(result.text);
  let restored=result.text;
  for(const rule of [...result.anchors].reverse()) {
   assert.equal(count(result.text,rule.find),0);assert.equal(count(result.text,rule.replace),rule.count);
   restored=restored.split(rule.replace).join(rule.find);
  }
  assert.equal(restored,text);
  for(const token of ['asideUserId','asideComponentVersion','asideCode','aside:worker:','originator','aside.dk.','AsideNativeRun','/trpc/*','allow_for_ai'])assert.equal(count(result.text,token),count(text,token));
  assert.throws(()=>run(result.text),/drift|Mixed/);
 }
 assert.throws(()=>run(original.replace('asideProvider;','auxProvider;')),/drift|Mixed/);
 assert.throws(()=>applyAuxPrivateDaemonIdentity({component:'daemon',path:'entry.mjs',text:original,original:original+' '}),/source pin/);
 assert.throws(()=>applyAuxPrivateDaemonIdentity({component:'agent',path:'entry.mjs',text:original,original}),/Unsupported/);
});

test('actual router export, remote caller and HTTP mounts stay paired',async()=>{
 const text=run(original).text;
 const exportBody=text.match(/router_exports=\/\* @__PURE__ \*\/ __exportAll\((\{auxRouter:\(\)=>auxRouter\})\)/)[1];
 const body=text.match(/async function invokeAllowlistedProcedure\(Cn,ei\)\{[\s\S]*?return ni\(ei\)\}/)[0];
 const context={init_router(){},createRemoteTrpcContext:()=>({fixture:true}),auxRouter:{createCaller:ctx=>({settings:{getAll:args=>({ctx,args})}})}};
 runInNewContext('router_exports=Object.defineProperties({},Object.fromEntries(Object.entries('+exportBody+').map(([key,get])=>[key,{get}])));'+body,context);
 const result=await context.invokeAllowlistedProcedure('settings.getAll',{keep:'shape'});
 assert.equal(result.ctx.fixture,true);assert.equal(result.args.keep,'shape');
 await assert.rejects(()=>context.invokeAllowlistedProcedure('settings.missing',{}),/Unknown procedure/);
 assert.ok(text.includes('trpcServer({router:auxRouter,createContext:ti})'));
 assert.ok(text.includes('mountTrpcHttpRoutesToHono({trpcRouter:auxRouter,honoApp:ei,createTrpcContext:ti})'));
 assert.equal(count(text,'`/trpc/*`'),count(original,'`/trpc/*`'));
});

test('actual schemas, provider session headers and bot fallback preserve their behavior',()=>{
 const output=run(original).text;
 const node=(type,value)=>({type,value,strict(){this.strictness=true;return this},min(n){this.minimum=n;return this}});
 const evaluate=source=>{
  const assignments=['ImageContent','ImageGenerationResponse'].map(suffix=>source.match(new RegExp('(?:aside|aux)'+suffix+'Schema=object\\(\\{[^;]*?\\}\\)\\.strict\\(\\)'))[0]).join(';');
  return runInNewContext(assignments+';JSON.stringify(['+(source===original?'aside':'aux')+'ImageContentSchema,'+(source===original?'aside':'aux')+'ImageGenerationResponseSchema])',{
   object:value=>node('object',value),literal:value=>node('literal',value),base64ImageSchema:node('base64'),imageMimeTypeSchema:node('mime'),string$3:()=>node('string'),array:value=>node('array',value)
  });
 };
 assert.equal(evaluate(output),evaluate(original));
 const permission=output.match(/auxNotificationPermissionValues=\[([^\]]+)\]/)[1];
 assert.equal(permission,'`allow_for_ai`,`allow`,`deny`,`default`');
 assert.ok(output.includes('_enum(auxNotificationPermissionValues)'));
 const fn=output.match(/function withOpenCodeSessionHeaders\(Cn,ei\)\{[^}]+\}\}:Cn\}/)[0];
 const context={OPENCODE_PROVIDERS:new Set(['opencode','opencode-go'])};runInNewContext(fn,context);
 assert.equal(context.withOpenCodeSessionHeaders({provider:'opencode'},'session').headers['x-opencode-client'],'aux');
 assert.equal(context.withOpenCodeSessionHeaders({provider:'opencode',headers:{'x-opencode-client':'custom'}},'session').headers['x-opencode-client'],'custom');
 const other={provider:'other'};assert.equal(context.withOpenCodeSessionHeaders(other,'session'),other);
 const expr=output.match(/new Chat\(\{userName:ti.botName\?\?`aux`,adapters:\{\[ti.platform\]:ci.adapter\},state:createMemoryState\(\),concurrency:`concurrent`,logger:ai\}\)/)[0];
 for(const botName of [undefined,'Custom'])assert.equal(runInNewContext(expr,{ti:{botName,platform:'fixture'},ci:{adapter:{}},Chat:class{constructor(options){Object.assign(this,options)}},createMemoryState:()=>({}),ai:{}}).userName,botName??'aux');
 assert.equal(count(output,'"User-Agent":`aux`'),2);
 assert.equal(count(output,'"HTTP-Referer":`https://getaux.co`'),1);
});
