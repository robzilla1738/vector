import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {SourceTextModule,runInNewContext} from 'node:vm';
import test from 'node:test';
import {findMachOSeaSection,readSeaBlob} from '../aside/lib/sea.mjs';
import {applyAuxProfileContextIdentity} from './aux-profile-context-identity.mjs';
const base='/Users/rcourson/Documents/Vibe/web/out/provided-source-snapshot-1.26.1016.1852';
const binary=readFileSync(base+'/daemon/Contents/MacOS/aside-daemon'),section=findMachOSeaSection(binary);
const daemon=readSeaBlob(binary.subarray(section.offset,section.offset+section.size)).code;
const paths=['background.js','assets/queries-ldd77hNk.js','assets/-types-Wy38XkNB.js'];
const originals=new Map([['daemon/entry.mjs',daemon],...paths.map(path=>['agent/'+path,readFileSync(base+'/agent/'+path,'utf8')])]);
const apply=(component,path,text=originals.get(component+'/'+path))=>applyAuxProfileContextIdentity({component,path,text,original:originals.get(component+'/'+path)});
const transformed=Object.fromEntries([...originals].map(([key])=>{const [component,...path]=key.split('/');return[key,apply(component,path.join('/')).text]}));
function match(text,regex){const value=text.match(regex)?.[0];assert.ok(value,'Pinned actual function not found');return value}

test('all four actual modules pair24 fields, parse and preserve every other byte',()=>{
 let count=0;
 for(const [key,original] of originals){const [component,...path]=key.split('/'),result=apply(component,path.join('/'));count+=result.anchors[0].count;
  new SourceTextModule(result.text);assert.equal(result.text.replaceAll('auxUserId','asideUserId'),original);
  assert.equal(result.text.includes('asideUserId'),false);
  assert.throws(()=>apply(component,path.join('/'),result.text),/drift/);
 }
 assert.equal(count,24);
 assert.throws(()=>applyAuxProfileContextIdentity({component:'daemon',path:'entry.mjs',text:daemon,original:daemon+' '}),/pin mismatch/);
 const stagedBinary=readFileSync('/Users/rcourson/Documents/Vibe/web/out/provided-reuse-aux-parallel-identity/apps/daemon/Aux Daemon.app/Contents/MacOS/aux-daemon');
 const stagedSection=findMachOSeaSection(stagedBinary),staged=readSeaBlob(stagedBinary.subarray(stagedSection.offset,stagedSection.offset+stagedSection.size)).code;
 new SourceTextModule(apply('daemon','entry.mjs',staged).text);
 for(const path of paths)new SourceTextModule(apply('agent',path,readFileSync('/Users/rcourson/Documents/Vibe/web/out/provided-reuse-aux-parallel-identity/ui/agent/'+path,'utf8')).text);
});

test('actual Agent account guards and context serializers preserve binding and sign-in rejection',async()=>{
 const background=transformed['agent/background.js'],queries=transformed['agent/assets/queries-ldd77hNk.js'];
 const backgroundGuard=match(background,/async function Ov\(e, t\) \{[\s\S]*?\n\}/);
 const queryGuard=match(queries,/async function Dr\(e,t\)\{.*?return n\}/);
 for(const [source,name] of [[backgroundGuard,'Ov'],[queryGuard,'Dr']]){
  const guard=runInNewContext(source+';'+name,{Tv:e=>(e?.bindingVersion??0)>=1,pe:e=>(e?.bindingVersion??0)>=1,Ai:Error,Ve:Error});
  const input={bindingVersion:1,auxUserId:'synthetic-user',boundUserId:'synthetic-user',boundAccountId:2};
  assert.equal(await guard(input,async()=>({id:2,userId:'synthetic-user'})),2);
  assert.equal(await guard({...input,auxUserId:undefined},async()=>({id:2,userId:'synthetic-user'})),2);
  await assert.rejects(()=>guard(input,async()=>({id:2,userId:'other'})),/changed/);
  await assert.rejects(()=>guard({...input,boundAccountId:-1},async()=>null),/unavailable/);
  assert.equal(await guard({...input,localOnly:true},async()=>{throw Error('must not query')}),-1);
 }
 const serializers=[match(background,/function zv\(e\) \{[\s\S]*?\n\}/),match(queries,/function Ai\(e\)\{return JSON\.stringify\(\{[^}]+\}\)\}/)];
 for(const source of serializers){const fn=runInNewContext('('+source+')');const value=JSON.parse(fn({auxUserId:'user',boundUserId:'user',boundAccountId:2}));assert.equal(value.auxUserId,'user');assert.equal(value.boundUserId,'user');assert.equal('asideUserId'in value,false)}
 const assertion=match(queries,/function Ui\(e,t\)\{.*?throw new Error\("Profile account changed during sign-in\."\)\}/);
 const check=runInNewContext('('+assertion+')',{pe:e=>(e?.bindingVersion??0)>=1,de:e=>e.chromiumProfileId||e.profileId});
 const context={bindingVersion:1,profileId:'disposable',auxUserId:'user'};check(context,{...context});check({...context,auxUserId:undefined,boundUserId:'user'},context);
 for(const changed of [{auxUserId:'other'},{profileId:'other'},{bindingVersion:2},{localOnly:true}])assert.throws(()=>check(context,{...context,...changed}),/changed during sign-in/);
});

test('actual profile-window request uses Aux field and retains exact authenticated native fallback conditions',async()=>{
 const code=transformed['daemon/entry.mjs'],start=code.indexOf('async function ensureProfileWindow('),end=code.indexOf('var init_profile_window=',start);assert.ok(start>0&&end>start);
 class CdpError extends Error{constructor(code){super('synthetic');this.code=code}}
 let binding={accountId:2,profileIndex:3},customFailure=-32601,account={id:2,userId:'synthetic-user'};const requests=[];
 const ensure=runInNewContext(code.slice(start,end)+';ensureProfileWindow',{
  init_accounts(){},init_client$7(){},init_cdp(){},
  accounts_exports:{AccountRegistry:{getAccount:()=>account,getAll:()=>({profileAccountBindings:{profile:binding}})}},
  client_exports:{BrowserCdpCommandError:CdpError},cdp_exports:{globalCdpClient:{async send(method,params){requests.push({method,params});if(method==='Browser.ensureChromiumProfile'&&customFailure)throw new CdpError(customFailure)}}}
 });
 await ensure(2,'profile','https://example.com',false);assert.equal(requests[0].params.auxUserId,'synthetic-user');assert.equal('asideUserId'in requests[0].params,false);
 assert.equal(requests[1].method,'Browser.ensureProfile');assert.equal(requests[1].params.profileIndex,3);assert.equal(requests[1].params.shouldFocus,false);
 requests.length=0;customFailure=-32602;await assert.rejects(()=>ensure(2,'profile'),error=>error.code===-32602);assert.equal(requests.length,1);
 customFailure=-32601;binding={accountId:8,profileIndex:3};await assert.rejects(()=>ensure(2,'profile'),/unavailable/);
 binding={accountId:2};await assert.rejects(()=>ensure(2,'profile'),/unavailable/);
 account=null;requests.length=0;await assert.rejects(()=>ensure(2,'profile'),/unavailable/);assert.equal(requests.length,0);
});

test('actual sync-passphrase handler pairs Aux query/output and rejects locality and changing user binding',async()=>{
 const code=transformed['daemon/entry.mjs'];
 const route=code.match(/Cn\.get\(`\/auth\/sync-passphrase`,(async Cn=>\{.*?\})\),Cn\}var oauthAttemptIdSchema/);assert.ok(route);
 let local=true,user='synthetic-user',changed=false;
 const handler=runInNewContext('('+route[1]+')',{
  isConnectedFromLocalhost:()=>local,resolveRequestAccountId:()=>({ok:true,accountId:2}),getAuthenticatedUserId:()=>user,
  fetchAccountSyncPassphrase:async()=>{if(changed)user='different-user';return'synthetic-passphrase'},isAuthorizationError$1:()=>false
 });
 const request=query=>({req:{query:key=>query[key]},json:(body,status=200)=>({body,status})});
 let result=await handler(request({accountId:'2',auxUserId:'synthetic-user'}));assert.equal(result.status,200);assert.equal(result.body.auxUserId,'synthetic-user');assert.equal('asideUserId'in result.body,false);
 assert.equal((await handler(request({accountId:'2'}))).status,200); // Original native caller does not send user query.
 assert.equal((await handler(request({auxUserId:'other'}))).status,401);
 changed=true;assert.equal((await handler(request({auxUserId:'synthetic-user'}))).status,401);
 local=false;assert.equal((await handler(request({}))).status,403);
});
