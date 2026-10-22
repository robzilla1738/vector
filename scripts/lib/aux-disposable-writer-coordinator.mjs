/** Necessary admission boundary for OWN direct disposable participants only.
 * Not a native/browser/descendant fence and never a state2 launch acceptance.
 */
import {spawn} from 'node:child_process';
import {createHash,randomUUID} from 'node:crypto';
import {mkdtemp,realpath,mkdir,writeFile,lstat} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {prepareStateMigration,commitStateMigration,recoverStateMigration,verifyStateMigration} from '../../vendor/provided/aux-state-migration-transaction.mjs';
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const label=/^[a-z][a-z0-9-]{0,63}$/;
function relative(path) {
  if(typeof path!=='string'||!path.length||path.split('/').some(part=>!label.test(part)))throw Error('Bounded fixture data path required');
  return path;
}

/** Allocates its OWN new root; cannot adopt owner profiles or existing apps.
 * Sources are explicit, hash-pinned synthetic/direct participant modules.
 * They must not spawn descendants: this boundary makes no descendant claim.
 */
export async function createAuxDisposableWriterCoordinator({participantSources,initialFiles=[],root:existingRoot}) {
  if(existingRoot!==undefined)throw Error('Existing state adoption is not supported');
  if(!Array.isArray(participantSources)||!participantSources.length||participantSources.length>8)throw Error('One to eight explicit direct participants required');
  const sources=new Map();
  for(const input of participantSources) {
    if(!label.test(input?.id)||sources.has(input.id)||!(input.bytes instanceof Uint8Array)||input.bytes.length>65536||sha(input.bytes)!==input.sha256)throw Error('Invalid pinned direct participant source');
    sources.set(input.id,Buffer.from(input.bytes));
  }
  if(!Array.isArray(initialFiles)||initialFiles.length>128)throw Error('Bounded initial fixture files required');
  const names=new Set();
  for(const file of initialFiles) {
    relative(file.path);
    if(names.has(file.path)||!(file.bytes instanceof Uint8Array)||file.bytes.length>1024*1024)throw Error('Invalid initial fixture file');
    names.add(file.path);
  }
  const root=await realpath(await mkdtemp(join(tmpdir(),'aux-owned-writers-')));
  const rootStat=await lstat(root),rootIdentity={dev:rootStat.dev,ino:rootStat.ino};
  for(const file of initialFiles) {
    const path=join(root,'data',file.path);await mkdir(join(path,'..'),{recursive:true,mode:0o700});
    await writeFile(path,file.bytes,{mode:0o600,flag:'wx'});
  }
  let phase='open',epoch=0,draining,transactionId,terminal,disposed=false;
  const children=new Map(),history=[];
  async function ownRoot() {
    const stat=await lstat(root);
    if(await realpath(root)!==root||!stat.isDirectory()||stat.isSymbolicLink()||stat.dev!==rootIdentity.dev||stat.ino!==rootIdentity.ino||(stat.mode&0o077))throw Error('Owned disposable root changed');
  }
  const capability={root,id:randomUUID(),disposable:true,exclusive:true,assertStopped:async()=>{
    await ownRoot();
    // This callback is INTERNAL and restricted to the fresh fixture root.
    // It is not exposed as migration authority for existing/native state.
    return ['frozen','transaction','terminal'].includes(phase)&&children.size===0;
  }};
  function start(id) {
    // Synchronous gate before source lookup/spawn: pending starts cannot race
    // admission closure. No restart timers exist outside this same gate.
    if(disposed||phase!=='open')throw Error('Participant admission is closed');
    if(!sources.has(id)||children.has(id))throw Error('Unknown or already running participant');
    const env={PATH:process.env.PATH,TMPDIR:process.env.TMPDIR,AUX_DISPOSABLE_ROOT:root,AUX_WRITER_ID:id};
    const child=spawn(process.execPath,['--input-type=module','--eval',sources.get(id).toString('utf8')],{cwd:root,env,stdio:['ignore','ignore','ignore','ipc']});
    const current={child,epoch,ready:false};children.set(id,current);
    let settled=false;
    const done=new Promise(resolve=>{
      child.once('error',error=>{current.error=error.message;if(!disposed)phase='blocked';});
      child.once('close',(code,signal)=>{
        settled=true;children.delete(id);const result={id,pid:child.pid,epoch:current.epoch,code,signal,error:current.error};history.push(result);
        // A failed writer can leave incomplete state even if it exits before
        // drain starts. Remember that failure at the admission boundary itself;
        // an empty current child set must never erase the failed generation.
        if(!disposed&&(code!==0||signal||current.error))phase='blocked';
        resolve(result);
      });
    });
    current.done=done;
    const ready=new Promise((resolve,reject)=>{
      const timer=setTimeout(()=>reject(Error('Direct participant ready deadline exceeded')),2000);
      child.on('message',message=>{if(message?.event==='ready'&&!current.ready&&!settled){current.ready=true;clearTimeout(timer);resolve({id,pid:child.pid,epoch:current.epoch});}});
      done.then(()=>{clearTimeout(timer);if(!current.ready)reject(Error('Direct participant exited before ready'));});
    });
    // Do not export ChildProcess or a PID-based kill capability.
    return {ready,done};
  }
  function freeze() {
    if(disposed)throw Error('Coordinator is disposed');
    if(draining)return draining;
    if(phase!=='open')throw Error('Coordinator cannot start another drain');
    phase='draining';epoch++;
    draining=(async()=>{
      const owned=[...children.values()];
      for(const {child} of owned)if(child.connected)child.send({event:'aux-fence-stop'},()=>{});
      let timer;
      try {
        const outcomes=await Promise.race([Promise.all(owned.map(item=>item.done)),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Direct participant drain deadline exceeded')),2000);})]);
        if(disposed||phase!=='draining')throw Error('Coordinator closed or blocked during drain');
        if(phase==='blocked'||outcomes.some(result=>result.code!==0||result.signal||result.error)||children.size)throw Error('Direct participant did not stop cleanly');
        await ownRoot();
        if(disposed||phase!=='draining')throw Error('Coordinator closed or blocked during drain');
        phase='frozen';
        return {format:'aux.owned-direct-writers.v1',epoch,stopped:outcomes,authorityScope:'owned-direct-participants-only',nativeWritersVerified:false,descendantsVerified:false};
      } catch(error){phase=disposed?'closed':'blocked';throw error;}
      finally{clearTimeout(timer);}
    })();
    return draining;
  }
  async function migrate({id,files,onCheckpoint}) {
    await freeze();
    if(disposed||phase!=='frozen'||transactionId)throw Error('A single stopped transaction is required');
    transactionId=id;phase='transaction';
    try {
      await prepareStateMigration({root,capability,transactionId:id,files,onCheckpoint});
      terminal=await commitStateMigration({root,capability,transactionId:id,onCheckpoint});if(disposed)throw Error('Coordinator closed during transaction');phase='terminal';return terminal;
    }catch(error){phase=disposed?'closed':'frozen';throw error;}
  }
  async function recover({action,onCheckpoint}) {
    if(phase!=='frozen'||!transactionId||children.size)throw Error('Stopped owned transaction recovery required');
    phase='transaction';
    try {terminal=await recoverStateMigration({root,capability,transactionId,action,onCheckpoint});if(disposed)throw Error('Coordinator closed during transaction');phase='terminal';return terminal;}
    catch(error){phase=disposed?'closed':'frozen';throw error;}
  }
  async function reopen({expectedReceiptSha256}) {
    if(phase!=='terminal'||!terminal||children.size)throw Error('Verified terminal transaction required before reopen');
    // Actual journal, backups, terminal receipt and current target hashes are
    // verified by the real offline verifier, not a caller-supplied true value.
    const verified=await verifyStateMigration({root,capability,transactionId,expectedReceiptSha256});
    if(disposed||phase!=='terminal')throw Error('Coordinator closed during verification');
    phase='open';draining=undefined;
    return {...verified,authorityScope:'owned-direct-participants-only',nativeWritersVerified:false,state2LaunchAuthorized:false};
  }
  async function dispose() {
    disposed=true;phase='closed';
    const owned=[...children.values()];
    for(const {child} of owned)child.kill('SIGTERM');
    await Promise.all(owned.map(item=>item.done));
    for(const bytes of sources.values())bytes.fill(0);
    // State and journals remain available; no deletion, process discovery or
    // adoption of existing roots. Caller may remove this synthetic root later.
  }
  return {root,start,freeze,migrate,recover,reopen,dispose,snapshot:()=>({phase,epoch,active:[...children.keys()],history:[...history],state2LaunchAuthorized:false})};
}
