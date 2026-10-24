import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {SourceTextModule,runInNewContext} from 'node:vm';
import {findMachOSeaSection,readSeaBlob} from '../aside/lib/sea.mjs';
import {applyAuxBrowserRouting,transformAuxRoutingSettings,ROUTING_SETTINGS_ASSET} from './aux-browser-routing.mjs';
import {pathToFileURL} from 'node:url';
const {adaptCliCode}=await import(process.env.AUX_CLI_ADAPTER?pathToFileURL(process.env.AUX_CLI_ADAPTER):new URL('./cli-adapter.mjs',import.meta.url));
const root='/Users/rcourson/Documents/Vibe/web/out/provided-source-snapshot-1.26.1016.1852';
const code=component=>{const b=readFileSync(`${root}/${component}/Contents/MacOS/${component==='cli'?'aside':'aside-daemon'}`),s=findMachOSeaSection(b);return readSeaBlob(b.subarray(s.offset,s.offset+s.size)).code};
const originalCli=code('cli'),originalDaemon=code('daemon'),agent=readFileSync(`${root}/agent/background.js`,'utf8');
let cli;
test('pinned supplied CLI, daemon and extension routing patches parse and fail closed on repeat/drift',()=>{
  assert.equal(createHash('sha256').update(originalDaemon).digest('hex'),'5e35dfa1eb76d4614246f954b652fd505e271a0b3f1ac3168132fb8bc03814f5');
  assert.equal(createHash('sha256').update(agent).digest('hex'),'ed19abc67a8a23d7868005ea1db84e2abe3a3f70609ab7b4ab2c1455c92131f7');
  const inputs={cli:adaptCliCode(originalCli,{},'aux-v1',2).code,daemon:originalDaemon.replaceAll('Aside.','Aux.'),agent:agent.replaceAll('Aside.','Aux.')};
  for(const [component,text] of Object.entries(inputs)) {
    const result=applyAuxBrowserRouting({component,text});
    new SourceTextModule(result.text);
    assert.equal(result.anchors.length,2);
    assert.throws(()=>applyAuxBrowserRouting({component,text:result.text}),/already applied/);
    assert.throws(()=>applyAuxBrowserRouting({component,text:''}),/anchor/);
    if(component==='cli') cli=result.text;
  }
});
test('CLI URL validation and local-only policy precede all daemon access; refusal has structured failure exit',async()=>{
  const fn=cli.slice(cli.indexOf('async function runAuxBrowserRoute('),cli.indexOf('\nconst actions = {',cli.indexOf('async function runAuxBrowserRoute(')));
  const requests=[],output=[];
  const process={exitCode:0};
  const sandbox={URL,process,console:{log:x=>output.push(x),error:x=>output.push(x)},
    createDaemonClient:()=>({trpcClient:{cli:{browserRoute:{mutate:async x=>{requests.push(x);return{ok:false,error:'space-unavailable-or-busy'}}}}}}),
    resolveAccount:async()=>({accountId:7})};
  runInNewContext(`${fn};globalThis.run=runAuxBrowserRoute;`,sandbox);
  for(const [url,options] of [['javascript:alert(1)',{}],['https://u:p@example.org',{}],['https://example.org',{host:'remote:x'}]])
    await assert.rejects(sandbox.run('open',url,options));
  assert.equal(requests.length,0);
  await sandbox.run('open','https://example.org/?q=a%20b',{profile:'personal',space:'research',json:true});
  assert.equal(requests.length,1);
  assert.equal(requests[0].profile,'personal'); assert.equal(requests[0].space,'research');
  assert.equal(process.exitCode,1);assert.equal(JSON.parse(output[0]).error,'space-unavailable-or-busy');
});
test('agent command refuses cancellation and private/missing bindings before native API',async()=>{
  const result=applyAuxBrowserRouting({component:'agent',text:agent.replaceAll('Aside.','Aux.')});
  const body=result.anchors[1].replace;
  const calls=[];const sandbox={chrome:{auxBrowserPreferences:{routeBrowserLink:async value=>{calls.push(value);return {ok:true}}}}};
  runInNewContext(`globalThis.run=async(e,t,r)=>{switch(e.method){${body}return {};}}`,sandbox);
  const command={method:'Aux.routeBrowserLink',params:{operation:'open',url:'https://example.org'}};
  await assert.rejects(sandbox.run(command,{aborted:true},{profileId:'p',browserMode:'default'}));
  await assert.rejects(sandbox.run(command,{aborted:false},{profileId:'p',browserMode:'incognito'}));
  assert.equal(calls.length,0);
  await sandbox.run(command,{aborted:false},{profileId:'p',browserMode:'default'});
  assert.equal(calls[0].boundProfileId,'p');
});

test('routing settings preserve supplied General rows and compose once',()=>{
  const source=readFileSync(`${root}/agent/${ROUTING_SETTINGS_ASSET}`,'utf8');
  assert.equal(createHash('sha256').update(source).digest('hex'),'e57dcde064f8872f2d8250123778924174deb2256d161b175cca751ef57f5ea4');
  const result=transformAuxRoutingSettings({relative:ROUTING_SETTINGS_ASSET,text:source});
  new SourceTextModule(result.text);assert.equal(result.anchors.length,2);
  assert.throws(()=>transformAuxRoutingSettings({relative:ROUTING_SETTINGS_ASSET,text:result.text}),/drift/);
});

// Evaluate only the emitted RPC and the pinned supplied account-scoped profile
// inventory excerpt. No supplied module, daemon, browser or owner state runs.
function routingFixture(names = {p1:'Personal',p2:'Work'}) {
  const replacement=applyAuxBrowserRouting({component:'daemon',text:originalDaemon.replaceAll('Aside.','Aux.')}).anchors[1].replace;
  const begin=originalDaemon.indexOf('function listCliBrowserProfiles(');
  const end=originalDaemon.indexOf('async function resolveCliBrowserBinding(',begin);
  assert.ok(begin>=0&&end>begin);
  const registry={profileAccountBindings:{a:{accountId:7,profileId:'p1'},b:{accountId:7,profileId:'p2'},foreign:{accountId:8,profileId:'foreign'}}};
  const account={createdAt:42}, calls=[], resolutions=[];
  const state={names,unavailable:new Set(),wrongReply:new Set(),afterList:null};
  class TRPCError extends Error { constructor(value){super(value.message);this.code=value.code;} }
  const schema={max(){return this},optional(){return this}};
  const sandbox={TRPCError,object:()=>schema,_enum:()=>schema,string$3:()=>schema,
    accountInstanceProcedure:{input:()=>({mutation:fn=>fn})},router:value=>value,
    AccountRegistry:{getAccount:id=>id===7?account:null,getAll:()=>registry},
    globalExtensionBridge:{listConnectedProfiles:()=>[]},getProfileLabel:id=>`Profile ${id==='p1'?1:2}`,
    assertAccountInstance:(value,epoch)=>{if(value?.createdAt!==epoch)throw new TRPCError({code:'CONFLICT',message:'account changed'});},
    resolveCliBrowserBinding:async(accountId,id)=>{resolutions.push({accountId,id});if(!id)throw Error('multiple profiles');return{profileId:id,browserMode:'default',windowId:id==='p1'?11:12};},
    sendCommandToExtension:async(request,binding)=>{
      calls.push({request,binding});
      if(request.params.operation==='list'){
        if(state.afterList)state.afterList(binding.profileId);
        if(state.unavailable.has(binding.profileId))throw Error('bridge offline');
        return{ok:true,profile:{id:state.wrongReply.has(binding.profileId)?'foreign':binding.profileId,name:state.names[binding.profileId],spacesReady:true,spaces:[]}};
      }
      return{ok:true,profileId:binding.profileId};
    }};
  runInNewContext(`${originalDaemon.slice(begin,end)};${replacement}});globalThis.route=cliRouter.browserRoute;`,sandbox);
  return{state,account,registry,calls,resolutions,run:profile=>sandbox.route({ctx:{accountId:7,accountCreatedAt:42},input:{operation:'open',url:'https://example.org',...(profile?{profile}:{})}})};
}
test('daemon resolves exact native names within authorized candidates; exact IDs bypass name lookup',async()=>{
  const f=routingFixture();
  assert.equal((await f.run('Work')).profileId,'p2');
  assert.deepEqual(f.calls.map(c=>[c.request.params.operation,c.binding.accountId,c.binding.profileId,c.request.params.profile]),[
    ['list',7,'p1','p1'],['list',7,'p2','p2'],['open',7,'p2','p2']]);
  assert.ok(f.calls.every(c=>c.binding.browserMode==='default'));
  f.calls.length=0;f.state.unavailable.add('p1');
  assert.equal((await f.run('p2')).profileId,'p2');
  assert.deepEqual(f.calls.map(c=>c.request.params.operation),['open']);
});
test('daemon refuses ambiguous, unknown or unavailable native names without any open fallback',async()=>{
  for(const configure of [
    f=>{f.state.names.p1='Work';},
    f=>{f.state.unavailable.add('p1');},
    f=>{f.state.wrongReply.add('p1');},
    f=>{f.state.names.p2='Renamed';},
  ]){
    const f=routingFixture();configure(f);await assert.rejects(f.run('Work'));
    assert.equal(f.calls.filter(c=>c.request.params.operation==='open').length,0);
  }
  const generic=routingFixture();await assert.rejects(generic.run('Profile 2'),/not found/);
  assert.equal(generic.calls.filter(c=>c.request.params.operation==='open').length,0);
});
test('daemon refuses account replacement and candidate-set changes during native name lookup',async()=>{
  const replaced=routingFixture();replaced.state.afterList=()=>{replaced.account.createdAt=43;};
  await assert.rejects(replaced.run('Work'),/account changed/);
  assert.equal(replaced.calls.filter(c=>c.request.params.operation==='open').length,0);
  const changed=routingFixture();changed.state.afterList=()=>{delete changed.registry.profileAccountBindings.a;};
  await assert.rejects(changed.run('Work'),/bindings changed/);
  assert.equal(changed.calls.filter(c=>c.request.params.operation==='open').length,0);
});
