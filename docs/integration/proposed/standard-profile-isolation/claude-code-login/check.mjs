import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdtempSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {EventEmitter} from 'node:events';
import vm from 'node:vm';
import {transformAuxClaudeCodeLogin} from './source/transform.mjs';
const root=new URL('./',import.meta.url),sha=value=>createHash('sha256').update(value).digest('hex');
const source=readFileSync('/private/tmp/aux-standard-daemon-projection-20261024-a3/index.mjs','utf8');
assert.equal(sha(source),'3ee2471769470b820bfaf16d64f6dfc7aa0bef1b8ad54493c7d2a0bffe725802');
const owner=source.slice(source.indexOf('function auxOwnOAuthCallbackServer('),source.indexOf('function auxKnownRefreshProvider('));
const helper=readFileSync(new URL('source/claude-code-login.js',root),'utf8');
const api=vm.runInNewContext(owner+helper+';({auxOwnOAuthCallbackServer,auxStartClaudeCallbackGroup,auxWaitClaudeCodeInput})',{AbortSignal,AbortController,Promise,Error,AggregateError});
const tick=()=>new Promise(resolve=>setImmediate(resolve));
const defer=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b});return{promise,resolve,reject};};
class Server extends EventEmitter{listen(){this.requested=true;}close(callback){this.closed=callback;}}
let unknown=0;
function group(signal){
 const servers=[],code=defer();
 const promise=api.auxStartClaudeCallbackGroup({createServer(){const server=new Server;servers.push(server);return server;},
 handler(){},hosts:['ipv4-fixture','ipv6-fixture'],port:1,signal,resolveCode:code.resolve,waitForCode:()=>code.promise,
 redirectUri:'http://fixture.invalid/callback',manualPrompt:{message:'original inert fallback'},ownServer:api.auxOwnOAuthCallbackServer,
 unknown:()=>++unknown});
 return{servers,promise,code};
}
// Failed IPv6 bind must retain the successful IPv4 listener and original manual
// fallback, and close must await the actual surviving server callback.
{
 const controller=new AbortController,{servers,promise}=group(controller.signal);
 servers[0].emit('listening');servers[1].emit('error',Object.assign(Error('occupied'),{code:'EADDRINUSE'}));
 const result=await promise;assert.equal(result.servers.length,1);assert.equal(result.manualPrompt.message,'original inert fallback');
 let done=false;const close=result.close().then(()=>done=true);await tick();assert.equal(done,false);
 servers[0].closed();await close;assert.equal(done,true);
}
// Abort while one bind is still pending cannot finish merely because the first
// listener closes. The late bind and its own close callback remain retained.
{
 const controller=new AbortController,{servers,promise}=group(controller.signal);promise.catch(()=>{});
 servers[0].emit('listening');await tick();controller.abort();await tick();
 let done=false;promise.catch(()=>done=true);servers[0].closed();await tick();assert.equal(done,false);
 servers[1].emit('listening');await tick();assert.equal(done,false);servers[1].closed();await assert.rejects(promise);
}
// Every address occupied preserves manual-only behavior; no live listener exists.
{
 const controller=new AbortController,{servers,promise}=group(controller.signal);
 for(const server of servers)server.emit('error',Object.assign(Error('occupied'),{code:'EADDRINUSE'}));
 const result=await promise;assert.equal(result.servers.length,0);assert.equal(await result.waitForCode(),null);await result.close();
}
// A callback winner aborts the actual manual prompt but cannot outrun its
// physical promise settlement. Manual winner releases the losing callback wait.
{
 const controller=new AbortController,code=defer(),prompt=defer();let aborted=false,done=false;
 const result=api.auxWaitClaudeCodeInput({waitForCode:()=>code.promise,cancelWait:()=>code.resolve(null)},signal=>{
  signal.addEventListener('abort',()=>{aborted=true});return prompt.promise;
 },controller.signal).then(value=>{done=true;return value});
 code.resolve({code:'synthetic',state:'synthetic'});await tick();assert.equal(aborted,true);assert.equal(done,false);
 prompt.reject(Error('cancelled'));assert.equal((await result).type,'callback');
 const code2=defer();let cancelled=false;
 const manual=await api.auxWaitClaudeCodeInput({waitForCode:()=>code2.promise,cancelWait:()=>{cancelled=true;code2.resolve(null);}},()=>Promise.resolve('synthetic'),controller.signal);
 assert.equal(manual.type,'manual');assert.equal(cancelled,true);
}
assert.equal(unknown,0);
const result=transformAuxClaudeCodeLogin(source),anchors=JSON.parse(readFileSync(new URL('source/anchors.json',root),'utf8'));
// Capture the actual transformed inline provider at initialization; a replacement
// login on the same mutable object must lose the reviewed classification.
{
 const replacement=anchors.at(-1).replace;
 const declaration=replacement.slice(0,replacement.lastIndexOf('}));'));
 const ctx={CLAUDE_CODE_PROVIDER_ID:'synthetic'};
 const check=vm.runInNewContext(helper+declaration+';({provider:claudeCodeOAuthProvider,check:auxReviewedClaudeCodeLogin})',ctx);
 assert.equal(check.check(check.provider.oauth),true);check.provider.oauth.login=async()=>{};assert.equal(check.check(check.provider.oauth),false);
}
const scratch=mkdtempSync(join(tmpdir(),'aux-claude-code-source-')),daemonInputs=[];
for(const [kind,path,expected] of [['source','index.mjs','3ee2471769470b820bfaf16d64f6dfc7aa0bef1b8ad54493c7d2a0bffe725802'],['entry','projected-entry/aux-native-entry.mjs','ba6194fbe579dec43ccaa2a7b788e58bc0a1cb9a0ff52ab5b5cfcea334890804']]){
 const input=readFileSync('/private/tmp/aux-standard-daemon-projection-20261024-a3/'+path,'utf8');assert.equal(sha(input),expected);
 const {text,changes}=transformAuxClaudeCodeLogin(input);assert.equal(changes.length,6);let replay=input;
 for(const {find,replace,count} of changes){assert.equal(count,1);assert.equal(replay.split(find).length-1,1);replay=replay.split(find).join(replace);}
 assert.equal(replay,text);const output=join(scratch,kind+'.mjs');writeFileSync(output,text);execFileSync(process.execPath,['--check',output],{stdio:'pipe'});
 daemonInputs.push({kind,inputSha256:sha(input),outputSha256:sha(text),changesSha256:sha(JSON.stringify(changes))});
}
const sourceFiles=['source/transform.mjs','source/anchors.json','source/claude-code-login.js'].map(path=>({path,sha256:sha(readFileSync(new URL(path,root)))}));
writeFileSync(new URL('overlay.json',root),JSON.stringify({version:1,stage:'claude-code-login',changes:6,sourceFiles,daemonInputs,
 nativeRequirements:['Same fresh observer, actual broker owner and physical refresh I/O ownership as current a3; no authority changes'],
 preservedUnknown:['Meta CDP window','ChatGPT separate callback broker/shim','unrecognized or replaced provider implementations','all actual failed or unresolved physical cleanup']},null,2)+'\n');
writeFileSync(new URL('evidence.json',root),JSON.stringify({version:1,scope:'Inert fake server callbacks and source-only replay; no server, provider, credentials or product execution',
 checks:['mixed successful/occupied address retains listener and manual fallback','abort retains late bind and each close callback','all occupied preserves manual-only behavior','callback/manual race awaits loser cleanup','actual inline provider identity rejects replacement','paired exact six-anchor replay and node syntax'],daemonInputs,scratch},null,2)+'\n');
console.log(JSON.stringify({changes:6,daemonInputs,scratch},null,2));
