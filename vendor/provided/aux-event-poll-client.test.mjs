import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { auxEventPollState, auxStopEventPolling, auxRunEventRefresh, auxCreateEventPollClientClass } from './aux-event-poll-client.mjs';
import { transformAuxEventPolling } from './aux-event-poll-integration.mjs';
import { transformAuxFinalRuntimeIdentity } from './aux-final-runtime-identity.mjs';
import { upgradeCloudTransfers } from '../../docs/integration/proposed/completion-20261026/integration/transform.mjs';

function fixture() {
  const timers = [], stops = new Set(), requests = [];
  let owner = true, reply = async () => Response.json({ protocol: 'aux-events.poll.v1', cursor: 'aux-ev1.'+'a'.repeat(64), changed: ['drive','sessions'], retryAfterMs: 60_000 });
  const context = vm.createContext({ Buffer, URL, AbortController, AbortSignal, Promise, Set, Map, Error, JSON, Math,
    setTimeout: (callback, delay) => { const timer={callback,delay};timers.push(timer);return timer; }, clearTimeout: timer => { if(timer)timer.cleared=true; },
    clients: new Map(), auxBrokerBoundary: () => ({ registerProducerStop: stop => stops.add(stop), awaited: callback => Promise.resolve().then(callback) }),
    fetch: async (url,options) => { requests.push({url:String(url),options});return reply(url,options); },
  });
  new vm.Script([auxEventPollState,auxStopEventPolling,auxRunEventRefresh,auxCreateEventPollClientClass].map(fn=>fn.toString()).join('\n')+'\nvar PollClient=auxCreateEventPollClientClass();').runInContext(context);
  let tokenReads=0;const forced=[],events=[],errors=[];
  const client=new context.PollClient({baseUrl:'https://aux-fixture.invalid',isCurrent:()=>owner,getAccessToken:async force=>{forced.push(force);return ++tokenReads===1?'fixture-original':'fixture-refreshed';},onError:error=>errors.push(error.message)});
  client.subscribe(['drive','sessions'],event=>events.push(event));
  return {context,client,requests,timers,stops,forced,events,errors,setOwner:value=>{owner=value;},setReply:value=>{reply=value;}};
}

test('actual poll class retains cursor, refreshes once, rejects late owners and settles cancellation',async()=>{
  const f=fixture();f.client.start();f.client.tick();await f.client.pending;
  assert.deepEqual(f.events.map(event=>event.type),['drive.files-changed','sessions.changed']);
  assert.ok(f.timers.at(-1).delay>=60_000);assert.equal(f.requests[0].options.redirect,'error');
  let attempts=0;f.setReply(async()=>++attempts===1?new Response(null,{status:401}):Response.json({protocol:'aux-events.poll.v1',cursor:'aux-ev1.'+'b'.repeat(64),changed:[],retryAfterMs:60_000}));
  f.client.tick();await f.client.pending;assert.deepEqual(f.forced.slice(-2),[false,true]);assert.match(f.requests.at(-1).url,/cursor=aux-ev1/);
  let complete;f.setReply(()=>new Promise(resolve=>{complete=resolve;}));f.client.tick();await new Promise(resolve=>setImmediate(resolve));f.setOwner(false);complete(Response.json({protocol:'aux-events.poll.v1',cursor:'aux-ev1.'+'c'.repeat(64),changed:['sessions'],retryAfterMs:60_000}));await f.client.pending;
  assert.equal(f.events.length,2);assert.equal(f.client.cursor,'aux-ev1.'+'b'.repeat(64));
  f.setOwner(true);let aborted=false;
  f.setReply((_url,options)=>new Promise((_resolve,reject)=>options.signal.addEventListener('abort',()=>{aborted=true;reject(Error('Synthetic abort'));},{once:true})));
  f.client.tick();await new Promise(resolve=>setImmediate(resolve));await [...f.stops][0]();
  assert.equal(aborted,true);assert.equal(f.client.pending,undefined);assert.equal(f.client.running,false);assert.equal(f.context.auxEventPollState().clients.size,0);
});

test('oversized or malformed snapshots stay offline with bounded retries and no invalidation success',async()=>{
  const f=fixture();f.client.start();f.setReply(async()=>new Response('x'.repeat(9000)));f.client.tick();await f.client.pending;
  assert.equal(f.events.length,0);assert.equal(f.client.cursor,undefined);assert.equal(f.errors.length,1);assert.ok(f.timers.at(-1).delay>=120_000);
  f.setReply(async()=>Response.json({protocol:'aux-events.poll.v1',cursor:'aux-ev1.'+'a'.repeat(64),changed:['another-account-topic'],retryAfterMs:60_000}));f.client.tick();await f.client.pending;
  assert.equal(f.events.length,0);assert.equal(f.errors.length,2);await f.client.stop();
});

test('both current source leaves compose after cloud/identity and parse with one account queue and stop owner',()=>{
  const root='/Users/rcourson/Documents/Vibe/web/out/provided-candidate-local-completion-20261025-a38/Aux.app/Contents/Resources/aux/apps/daemon/Aux Daemon.app/Contents/Resources/node-development';
  for(const file of ['index.mjs','aux-native-entry.mjs']){
    const raw=readFileSync(root+'/'+file,'utf8'),cloud=upgradeCloudTransfers(raw).text,identity=transformAuxFinalRuntimeIdentity({component:'daemon',path:file,text:cloud}).text;
    const result=transformAuxEventPolling({text:identity});assert.equal(result.anchors.length,8);assert.equal(result.text.includes('EVENTS_PROTOCOL=`aside-events`'),false);assert.ok(result.text.includes('case`sessions`:{if(!isSyncEnabled(Cn))break;const state=await auxCloudSessionState(Cn)'));
    execFileSync(process.execPath,['--check','--input-type=module'],{input:result.text});
    assert.throws(()=>transformAuxEventPolling({text:result.text,source:identity}),/repeated/);
  }
});
