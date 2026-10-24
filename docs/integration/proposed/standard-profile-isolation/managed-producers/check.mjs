import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const helper = fs.readFileSync(new URL('./source/managed-producers.js', import.meta.url), 'utf8');
const anchors = JSON.parse(fs.readFileSync(new URL('./source/anchors.json', import.meta.url), 'utf8'));
const ctx = vm.createContext({ console, setTimeout, clearTimeout, setInterval, clearInterval });
vm.runInContext(helper, ctx);
const deferred = () => { let resolve, reject; const promise = new Promise((yes,no)=>{resolve=yes;reject=no}); return {promise,resolve,reject}; };
const callbacks = new Map();let serial=0, unknown=0;
const clock = {setTimeout: fn=>{callbacks.set(++serial,fn);return serial},setInterval: fn=>{callbacks.set(++serial,fn);return serial},clearTimeout:id=>callbacks.delete(id),clearInterval:id=>callbacks.delete(id)};
const boundary = {awaited: callback=>Promise.resolve().then(callback), noteUntracked:()=>unknown++};
const registry = ctx.auxCreateManagedProducerLifetimes(boundary, ()=>false, clock);
const work=deferred();let entered=0, late=0;
const timer=registry.timer(()=>{entered++;return work.promise},1,true);
const cancelled=registry.timer(()=>late++,2,false);
callbacks.get(timer)();await Promise.resolve();
let detached=0, listener;
registry.subscribe(fn=>{listener=fn;return ()=>detached++},()=>late++);
let stopped=false;const stop=registry.stop().then(()=>stopped=true);
await Promise.resolve();assert.equal(stopped,false);assert.equal(entered,1);
assert.equal(callbacks.has(cancelled),false);assert.equal(detached,1);
listener();assert.equal(late,0);
work.resolve();await stop;assert.equal(stopped,true);assert.equal(unknown,0);
await assert.rejects(registry.run(()=>late++),/CLOSED/);
const domain=ctx.auxCreateManagedProducerLifetimes(boundary,()=>false,clock);
await assert.rejects(domain.run(async()=>{throw Error('domain failure')}),/domain failure/);
await domain.stop();assert.equal(unknown,0);

// Only a real, connection-bound successful extension response confirms close.
ctx.auxManagedLifecycle = callback=>callback();
ctx.auxBrokerBoundary = ()=>boundary;
const command={method:'Aux.controlTab',params:{action:'close',targetId:'test-target'}};
ctx.globalExtensionBridge={sendCommandToExtension:async()=>{throw Error('not connected')}};
await assert.rejects(ctx.auxManagedBrowserClose(command,{}),/not connected/);assert.equal(unknown,0);
ctx.globalExtensionBridge={sendCommandToExtension:async(c,route)=>{route.auxManagedWrite();throw Error('reply lost')}};
await assert.rejects(ctx.auxManagedBrowserClose(command,{}),/reply lost/);assert.equal(unknown,1);
ctx.globalExtensionBridge={sendCommandToExtension:async(c,route)=>{route.auxManagedWrite();return {success:true,action:'close',closed:false,targetId:'test-target'}}};
assert.equal((await ctx.auxManagedBrowserClose(command,{})).closed,false);assert.equal(unknown,1);

// Exercise the exact adapted closeOwnedSessionTabs + original detach body.
vm.runInContext(anchors.find(a=>a.name==='owned-real-close-acks').replace+
  'async function detachOwnedSessionTabs(Cn,ei,ti={}){for(let ni of await closeOwnedSessionTabs(Cn,ei,ti))removeSessionTab(Cn,ni.id)}',ctx);
ctx.SessionStore={get:()=>({browserBinding:{profileId:'disposable',browserMode:'default'}})};
ctx.listSessionTabs=()=>[{id:'retained',ownership:'owned',targetId:'one'},{id:'closed',ownership:'owned',targetId:'two'}];
const removed=[];ctx.removeSessionTab=(account,id)=>removed.push(id);
ctx.auxManagedBrowserClose=async command=>({closed:command.params.targetId==='two'});
await ctx.detachOwnedSessionTabs(1,'session');assert.deepEqual(removed,['closed']);
const slow=deferred();let finished=false;
ctx.auxManagedBrowserClose=command=>command.params.targetId==='one'?Promise.reject(Error('lost ack')):slow.promise;
const rejected=ctx.closeOwnedSessionTabs(1,'session').finally(()=>{finished=true});
rejected.catch(()=>{});await Promise.resolve();assert.equal(finished,false);
slow.resolve({closed:true});await assert.rejects(rejected,/not acknowledged/);
assert.deepEqual(removed,['closed']);
console.log('Managed producer boundary checks passed: admitted-work drain, cancelled timer, listener detach, logical failure, dispatch/ACK uncertainty, retained tab records.');
const baseline=fs.readFileSync('/private/tmp/aux-standard-daemon-projection-20261024-a1/index.mjs','utf8');
let shutdownSource=baseline.slice(baseline.indexOf('function auxCreateDaemonShutdown('),baseline.indexOf('// Exact original channel outbox producers;'));
for(const name of ['defer-transport-close-until-acks','close-transport-after-producer-drain']){
 const anchor=anchors.find(a=>a.name===name);assert.equal(shutdownSource.split(anchor.find).length-1,1);
 shutdownSource=shutdownSource.replace(anchor.find,()=>anchor.replace);
}
vm.runInContext('let auxDaemonClosing=false;'+shutdownSource,ctx);
const browserAck=deferred(), order=[];
const noop=()=>{};
const deps={closeReadiness:noop,clearBootstrapTimer:noop,hold:()=>1,releaseHold:noop,
 websockets:()=>({clients:[],close:done=>{order.push('socket-close');done()}}),
 http:()=>({close:done=>{order.push('http-close');done()}}),
 stopIntervals:()=>browserAck.promise,stopRefresh:noop,stopProductivity:noop,stopChannels:noop,
 stopOutbox:noop,stopBackground:noop,stopComputerUse:noop,stopCoder:noop,terminateExec:noop,
 killCommands:noop,bootstrap:noop,stopTelemetry:noop,closeBroker:()=>order.push('broker-close'),
 exit:()=>order.push('exit'),unknown:()=>assert.fail('unexpected unknown')};
const shutdown=ctx.auxCreateDaemonShutdown(deps);const draining=shutdown.start();
assert.equal(shutdown.isClosing(),true);await Promise.resolve();assert.deepEqual(order,[]);
order.push('actual-browser-ack');browserAck.resolve();await draining;
assert.deepEqual(order,['actual-browser-ack','socket-close','http-close','broker-close','exit']);
console.log('Adapted shutdown preserves the browser acknowledgment transport through admitted producer drain.');
