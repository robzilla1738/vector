import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdtempSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {EventEmitter} from 'node:events';
import vm from 'node:vm';
import {transformAuxInteractiveOAuth} from './source/transform.mjs';
const root=new URL('./',import.meta.url),sha=x=>createHash('sha256').update(x).digest('hex');
const helper=readFileSync(new URL('./source/interactive-oauth.js',root),'utf8');
const sandbox={AbortController,Promise,Error,AggregateError,auxBrokerBoundary:()=>{},auxRefreshIoContext:{},auxStopRefreshProducers(){}};
const {auxCreateInteractiveOAuth:create,auxOwnOAuthCallbackServer:own}=vm.runInNewContext(helper+';({auxCreateInteractiveOAuth,auxOwnOAuthCallbackServer})',sandbox);
const defer=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b});return{promise,resolve,reject};};
const tick=()=>new Promise(resolve=>setImmediate(resolve));
class Server extends EventEmitter {
 listen(){this.listenRequested=true;}
 close(callback){this.closeRequested=true;this.closeCallback=callback;}
}
class Socket extends EventEmitter {destroy(){this.destroyRequested=true;}}
// Cancellation during bind must not mistake a pre-listen close for completion.
let unknown=0;
{
 const server=new Server,controller=new AbortController;
 const owner=own(server,controller.signal,()=>++unknown);
 const listening=owner.listen(1,'unused');listening.catch(()=>{});
 controller.abort();const closing=owner.close();let done=false;closing.then(()=>done=true);
 await tick();assert.equal(done,false);assert.equal(server.closeRequested,undefined);
 server.emit('listening');await tick();assert.equal(server.closeRequested,true);assert.equal(done,false);
 server.closeCallback();await closing;await assert.rejects(listening,/admission closed/);
}
// Normal response HTML can finish; neither server callback nor socket destruction
// alone proves the independently accepted socket has physically closed.
{
 const server=new Server,controller=new AbortController,socket=new Socket,response=new EventEmitter;
 const owner=own(server,controller.signal,()=>++unknown);
 const listening=owner.listen(1,'unused');server.emit('listening');await listening;
 server.emit('connection',socket);server.emit('request',{},response);
 let done=false;const closing=owner.close().then(()=>done=true);await tick();
 assert.equal(socket.destroyRequested,undefined);assert.equal(done,false);
 response.emit('finish');await tick();assert.equal(socket.destroyRequested,true);
 server.closeCallback();await tick();assert.equal(done,false);
 socket.emit('close');await closing;assert.equal(done,true);
}
// Abort while flushing preserves the listener until socket/response closure.
{
 const server=new Server,controller=new AbortController,socket=new Socket,response=new EventEmitter;
 const owner=own(server,controller.signal,()=>++unknown);
 const listening=owner.listen(1,'unused');server.emit('listening');await listening;
 server.emit('connection',socket);server.emit('request',{},response);
 const closing=owner.close();controller.abort();assert.equal(socket.destroyRequested,true);
 response.emit('close');socket.emit('close');await tick();server.closeCallback();await closing;
}
assert.equal(unknown,0);
// A removed flow entry does not release its abort/prompt/network cleanup.
{
 let marked=0,closed=0;
 const physical=defer(),body=defer(),controller=new AbortController;
 const boundary={registerProducerStop(){},noteUntracked(){++marked;},async awaited(fn){return await fn();}};
 const owner=create({boundary:()=>boundary,isClosing:()=>false,isReviewed:()=>true,
  createTransport:()=>({requests:1,async close(){++closed;await physical.promise;}}),context:{run:(_,fn)=>fn()}});
 const flow={providerId:'fixture',abortController:controller,inputDeferred:{reject:()=>body.reject(Error('cancelled'))}};
 const map=new Map([[1,flow]]);owner.register(flow,()=>{});
 const login=owner.login(flow,()=>body.promise);login.catch(()=>{});map.delete(1);
 let done=false;const stopped=owner.stop().then(()=>done=true);await tick();
 assert.equal(controller.signal.aborted,true);assert.equal(closed,1);assert.equal(done,false);
 assert.throws(()=>owner.run(()=>{}),/SHUTTING_DOWN/);
 physical.resolve();await stopped;await assert.rejects(login,/cancelled/);assert.equal(marked,0);
}
// Unreviewed providers retain their honest unknown status and are still awaited.
{
 let marked=0;const work=defer(),cancel=defer();
 const boundary={registerProducerStop(){},noteUntracked(){++marked;},async awaited(fn){return await fn();}};
 const owner=create({boundary:()=>boundary,isClosing:()=>false,isReviewed:()=>false});
 const flow={providerId:'external',abortController:new AbortController};owner.register(flow,()=>cancel.promise);
 const login=owner.login(flow,()=>work.promise);let done=false;const stop=owner.stop().then(()=>done=true);
 work.resolve();await login;await tick();assert.equal(done,false);cancel.resolve();await stop;assert.equal(marked,1);
}
const scratch=mkdtempSync(join(tmpdir(),'aux-interactive-oauth-source-'));
const expected={source:'2e35bf82a24e22a1a76b61fe7211c9a1bdbfb770f3e45ae689131eefae9f75ea',entry:'ebb32136d280406d02841c5f9fc3b08d2714b4384e70d0d690ca4bdd8bb1c8d7'};
const daemonInputs=[];
for(const [kind,name] of [['source','index.mjs'],['entry','projected-entry/aux-native-entry.mjs']]){
 const input=readFileSync('/private/tmp/aux-standard-daemon-projection-20261024-a2/'+name,'utf8');
 assert.equal(sha(input),expected[kind]);const result=transformAuxInteractiveOAuth(input);
 assert.equal(result.changes.length,12);let replay=input;
 for(const {find,replace,count} of result.changes){assert.equal(count,1);assert.equal(replay.split(find).length-1,1);replay=replay.split(find).join(replace);}
 assert.equal(replay,result.text);const path=join(scratch,kind+'.mjs');writeFileSync(path,result.text);
 execFileSync(process.execPath,['--check',path],{stdio:'pipe'});
 daemonInputs.push({kind,inputSha256:sha(input),outputSha256:sha(result.text),changesSha256:sha(JSON.stringify(result.changes))});
}
const sourceFiles=['source/transform.mjs','source/anchors.json','source/interactive-oauth.js'].map(path=>({path,sha256:sha(readFileSync(new URL(path,root)))}));
writeFileSync(new URL('overlay.json',root),JSON.stringify({version:1,stage:'interactive-oauth',changes:12,sourceFiles,daemonInputs,
 nativeRequirements:['Fresh descendant observer and existing broker physical-writer ownership remain required; no authority flags change.'],
 preservedUnknown:['Meta CDP sign-in window','Claude-code callback listeners','ChatGPT callback broker and separate shim transport','unrecognized or replaced OAuth implementations']},null,2)+'\n');
writeFileSync(new URL('evidence.json',root),JSON.stringify({version:1,scope:'Source-only and inert callback fixture; no sockets, provider requests, credentials or product executed',checks:['late listen cancellation remains pending until actual close callback','success response flush then independent socket close','abort during response flush','deleted flow retains login and physical transport cleanup','unreviewed provider remains unknown and awaited','12 exact anchors independently replayed on both pinned a2 leaves','node --check both resulting leaves'],scratch,daemonInputs},null,2)+'\n');
console.log(JSON.stringify({checks:7,changes:12,daemonInputs,scratch},null,2));
