import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile,writeFile,rm} from 'node:fs/promises';
import {join} from 'node:path';
import {setTimeout as delay} from 'node:timers/promises';
import test from 'node:test';
import {createAuxDisposableWriterCoordinator} from './aux-disposable-writer-coordinator.mjs';
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const writer=Buffer.from(`import {appendFileSync} from 'node:fs';
import {join} from 'node:path';
const target=join(process.env.AUX_DISPOSABLE_ROOT,'data','ticks');
const timer=setInterval(()=>appendFileSync(target,'x'),5);
process.on('message',message=>{if(message.event==='aux-fence-stop'){clearInterval(timer);process.exit(0)}});
process.on('disconnect',()=>{clearInterval(timer);process.exit(0)});
process.send({event:'ready'});`);
const source={id:'writer',bytes:writer,sha256:sha(writer)};
const initial=Buffer.from('old'),next=Buffer.from('new');
async function fixture(){return createAuxDisposableWriterCoordinator({participantSources:[source],initialFiles:[{path:'state',bytes:initial},{path:'ticks',bytes:Buffer.alloc(0)}]});}

test('admission closes synchronously, direct writer stops and real terminal verification controls reopen',async()=>{
 const coordinator=await fixture();
 try {
  await coordinator.start('writer').ready;await delay(25);
  const drain=coordinator.freeze();
  assert.throws(()=>coordinator.start('writer'),/closed/);
  const stopped=await drain;assert.equal(stopped.stopped.length,1);assert.equal(stopped.stopped[0].code,0);
  assert.equal(stopped.nativeWritersVerified,false);assert.equal(stopped.descendantsVerified,false);
  const ticks=await readFile(join(coordinator.root,'data','ticks'));await delay(25);
  assert.deepEqual(await readFile(join(coordinator.root,'data','ticks')),ticks);
  await assert.rejects(()=>coordinator.reopen({expectedReceiptSha256:'a'.repeat(64)}),/terminal/);
  const receipt=await coordinator.migrate({id:'1'.repeat(32),files:[{path:'data/state',expectedSha256:sha(initial),bytes:next}],onCheckpoint:()=>assert.throws(()=>coordinator.start('writer'),/closed/)});
  await assert.rejects(()=>coordinator.reopen({expectedReceiptSha256:'a'.repeat(64)}),/mismatch/);
  assert.equal(coordinator.snapshot().phase,'terminal');
  const reopened=await coordinator.reopen({expectedReceiptSha256:receipt.receiptSha256});
  assert.equal(reopened.verified,true);assert.equal(reopened.state2LaunchAuthorized,false);
  assert.equal((await readFile(join(coordinator.root,'data','state'))).toString(),'new');
  await coordinator.start('writer').ready;await coordinator.freeze();
 }finally{await coordinator.dispose();await rm(coordinator.root,{recursive:true,force:true});}
});

test('interrupted commit cannot reopen; explicit recovery and unchanged terminal bytes are required',async()=>{
 const coordinator=await fixture();
 try {
  await coordinator.start('writer').ready;
  await assert.rejects(()=>coordinator.migrate({id:'2'.repeat(32),files:[{path:'data/state',expectedSha256:sha(initial),bytes:next}],onCheckpoint:({stage})=>{assert.throws(()=>coordinator.start('writer'),/closed/);if(stage==='renamed-new-file')throw Error('synthetic interruption');}}),/synthetic interruption/);
  assert.equal(coordinator.snapshot().phase,'frozen');assert.throws(()=>coordinator.start('writer'),/closed/);
  const receipt=await coordinator.recover({action:'rollback',onCheckpoint:()=>assert.throws(()=>coordinator.start('writer'),/closed/)});
  await writeFile(join(coordinator.root,'data','state'),'changed',{mode:0o600});
  await assert.rejects(()=>coordinator.reopen({expectedReceiptSha256:receipt.receiptSha256}),/Concurrent|changed|unknown/);
  assert.equal(coordinator.snapshot().phase,'terminal');assert.equal(coordinator.snapshot().state2LaunchAuthorized,false);
 }finally{await coordinator.dispose();await rm(coordinator.root,{recursive:true,force:true});}
});

test('source drift is rejected before spawning and this API cannot adopt existing state',async()=>{
 await assert.rejects(()=>createAuxDisposableWriterCoordinator({participantSources:[{...source,sha256:'0'.repeat(64)}]}),/pinned/);
 await assert.rejects(()=>createAuxDisposableWriterCoordinator({participantSources:[source],root:'/tmp/existing'}),/adoption/);
 await assert.rejects(()=>createAuxDisposableWriterCoordinator({participantSources:[source],initialFiles:[{path:'../owner',bytes:initial}]}),/path/);
});

test('unclean participating writer exit keeps admission blocked',async()=>{
 const bytes=Buffer.from(writer.toString().replaceAll('process.exit(0)','process.exit(1)'));
 const coordinator=await createAuxDisposableWriterCoordinator({participantSources:[{id:'writer',bytes,sha256:sha(bytes)}],initialFiles:[{path:'ticks',bytes:Buffer.alloc(0)}]});
 try {
  await coordinator.start('writer').ready;
  await assert.rejects(()=>coordinator.freeze(),/cleanly/);
  assert.equal(coordinator.snapshot().phase,'blocked');
  assert.throws(()=>coordinator.start('writer'),/closed/);
 }finally{await coordinator.dispose();await rm(coordinator.root,{recursive:true,force:true});}
});
