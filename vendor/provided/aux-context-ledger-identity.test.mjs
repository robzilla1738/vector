import assert from 'node:assert/strict';
import{readFileSync}from'node:fs';
import{createHash}from'node:crypto';
import{createRequire}from'node:module';
import{runInNewContext,SourceTextModule}from'node:vm';
import{DatabaseSync}from'node:sqlite';
import test from'node:test';
import{findMachOSeaSection,readSeaBlob}from'../aside/lib/sea.mjs';
import{applyAuxContextLedgerIdentity,prepareContextLedgerIdentity,AUX_CONTEXT_LEDGER_SCHEMA_SHA256}from'./aux-context-ledger-identity.mjs';
import{PINNED_CONTEXT_LEDGER_DDL,PINNED_CONTEXT_LEDGER_USER_VERSION}from'./aux-context-ledger-schema.mjs';
import{adaptDaemonCode}from'./daemon-adapter.mjs';
import{applyAuxProviderIdentity}from'./aux-provider-identity.mjs';
import{applyAuxRuntimeContractIdentity}from'./aux-runtime-contract-identity.mjs';
const hash=b=>createHash('sha256').update(b).digest('hex');
const z=createRequire('/Users/rcourson/Documents/Vibe/web/services/aux-cloud/package.json')('zod').z;
const binary=readFileSync('/Users/rcourson/Documents/Vibe/web/out/provided-source-snapshot-1.26.1016.1852/daemon/Contents/MacOS/aside-daemon'),section=findMachOSeaSection(binary),original=readSeaBlob(binary.subarray(section.offset,section.offset+section.size)).code;
const transformed=applyAuxContextLedgerIdentity({text:original,original}).text;
const capability=(phases=[])=>({id:'synthetic-ledger-fixture',disposable:true,exclusive:true,rollbackJournalAbsent:true,assertStopped:async value=>{phases.push(value.phase);return true}});
const options=(databaseBytes,overrides={})=>({databaseBytes,expectedSha256:hash(databaseBytes),walBytes:null,rollbackJournalBytes:null,capability:capability(),...overrides});
function fixture({payload=' { "kind": "content.snapshot", "trigger": "navigation", "custom": "aside_dom is opaque payload" } ',source='aside_dom',extraSql=''}={}){
 const db=new DatabaseSync(':memory:',{allowExtension:false});try{
  db.exec(PINNED_CONTEXT_LEDGER_DDL);db.exec(`PRAGMA user_version=${PINNED_CONTEXT_LEDGER_USER_VERSION}`);
  db.prepare('INSERT INTO context_awareness_blobs(id,content_hash,content,redacted_bytes,created_at,last_seen_at) VALUES(?,?,?,?,?,?)').run('blob','hash-fixture',Buffer.from([1,2,3,4]),4,0,0);
  db.prepare('INSERT INTO context_awareness_frames(id,content,member_count,stored_bytes,created_at) VALUES(?,?,?,?,?)').run('frame',Buffer.from([5,6]),1,2,0);
  const insert=db.prepare('INSERT INTO context_awareness_events(id,occurred_at,source,kind,target,payload,blob_id,session_id) VALUES(?,?,?,?,?,?,?,?)');
  insert.run('old-dom',10,source,'content.snapshot',' {"targetId":"kept-target","extra":{"provider":"aside"}} ',payload,'blob','kept-session');
  insert.run('new-dom',11,'aux_dom','content.snapshot','{}','{"trigger":"activation"}',null,null);
  insert.run('native',12,'mac_ax','session.started','{}','{"kind":"session.started"}',null,null);
  db.prepare('INSERT INTO context_awareness_summaries(id,kind,window_from,window_to,created_at,updated_at,body) VALUES(?,?,?,?,?,?,?)').run('summary','glance',0,1,0,0,'kept opaque summary aside_dom');
  if(extraSql)db.exec(extraSql);return Buffer.from(db.serialize());
 }finally{db.close()}
}
function allRows(bytes){const db=new DatabaseSync(':memory:',{allowExtension:false});try{db.deserialize(bytes);return Object.fromEntries(['context_awareness_blobs','context_awareness_frames','context_awareness_events','context_awareness_summaries'].map(table=>[table,db.prepare(`SELECT * FROM ${table} ORDER BY id`).all().map(row=>({...row}))]))}finally{db.close()}}
function expression(source,name,next){const start=source.indexOf(name+'=')+name.length+1,end=source.indexOf(','+next+'=',start);assert.ok(start>name.length&&end>start,name);return source.slice(start,end)}

test('actual fifteen daemon producer/schema/filter occurrences pin and migrate coherently without changing HTML',()=>{
 const pins=JSON.parse(readFileSync(new URL('../../docs/integration/proposed/aux-context-ledger-identity/source-pins.json',import.meta.url)));
 assert.equal(hash(original),pins.daemonSourceSha256);assert.equal(hash(PINNED_CONTEXT_LEDGER_DDL),pins.ledgerDdlSha256);assert.equal(original.split('aside_dom').length-1,15);for(const anchor of pins.anchors)assert.ok(original.includes(anchor.find));
 assert.equal(transformed.split('aux_dom').length-1,15);assert.equal(transformed.includes('aside_dom'),false);assert.ok(transformed.includes('case`article`:case`aside`:case`blockquote`'));new SourceTextModule(transformed);
 assert.throws(()=>applyAuxContextLedgerIdentity({text:transformed,original}),/generation drift/);assert.throws(()=>applyAuxContextLedgerIdentity({text:original,original:original+' '}),/pin/);
 const composed=adaptDaemonCode(original,{enableCloud:true,profile:'development'}).code,provider=applyAuxProviderIdentity({component:'daemon',path:'entry.mjs',text:composed,original}).text,runtime=applyAuxRuntimeContractIdentity({component:'daemon',path:'entry.mjs',text:provider,original}).text;
 assert.equal(applyAuxContextLedgerIdentity({text:runtime,original}).anchors[0].count,15);
});

test('actual updated event input schema admits new DOM captures and rejects the retired source',()=>{
 const context={_enum:z.enum,object:z.object,literal:z.literal,string$3:z.string,number$2:z.number,boolean$1:z.boolean,record:z.record,union$1:z.union,contextAwarenessEventPayloadSchema:z.object({kind:z.string()})};
 for(const[name,next]of [['captureTriggerSchema','contextAwarenessEventSourceSchema'],['contextAwarenessEventSourceSchema','contextAwarenessEventKindSchema'],['contextAwarenessEventKindSchema','contextAwarenessEventTargetSchema'],['contextAwarenessEventTargetSchema','pointerButtonSchema'],['contextAwarenessEventBaseSchema','contextAwarenessEventInputSchema'],['contextAwarenessEventInputSchema','contextAwarenessEventQuerySchema']])context[name]=runInNewContext(expression(transformed,name,next),context);
 const event={source:'aux_dom',kind:'content.snapshot',trigger:'navigation',occurredAt:0,appName:'Aux',bundleId:'dev.aux.browser',content:'synthetic'};
 assert.equal(context.contextAwarenessEventInputSchema.parse(event).source,'aux_dom');assert.equal(context.contextAwarenessEventInputSchema.safeParse({...event,source:'aside_dom'}).success,false);
});

test('stopped memory-copy migration exposes historical events to new filter and preserves all other fields/tables',async()=>{
 const before=fixture(),originalBytes=Buffer.from(before),phases=[],result=await prepareContextLedgerIdentity(options(before,{capability:capability(phases)}));
 assert.deepEqual(before,originalBytes);assert.equal(result.receipt.changedRows,1);assert.equal(result.receipt.userVersion,1);assert.equal(result.receipt.sourceSchemaSha256,AUX_CONTEXT_LEDGER_SCHEMA_SHA256);assert.deepEqual(phases,['prepare-context-ledger-copy','context-ledger-copy-prepared']);
 const old=allRows(before),next=allRows(result.bytes);for(const table of Object.keys(old))assert.deepEqual(next[table],table==='context_awareness_events'?old[table].map(row=>row.source==='aside_dom'?{...row,source:'aux_dom'}:row):old[table]);
 const filter=transformed.match(/eq\(ContextAwarenessEventTable.source,`([^`]+)`\)/)?.[1];assert.equal(filter,'aux_dom');
 const db=new DatabaseSync(':memory:',{allowExtension:false});try{db.deserialize(result.bytes);assert.equal(db.prepare('SELECT count(*) AS total FROM context_awareness_events WHERE source=?').get(filter).total,2);db.prepare('INSERT INTO context_awareness_events(id,occurred_at,source,kind,payload) VALUES(?,?,?,?,?)').run('new-after-migration',20,filter,'content.snapshot','{}');assert.equal(db.prepare('SELECT count(*) AS total FROM context_awareness_events WHERE source=?').get(filter).total,3)}finally{db.close()}
 const repeat=await prepareContextLedgerIdentity(options(result.bytes));assert.equal(repeat.receipt.changed,false);assert.deepEqual(repeat.bytes,result.bytes);
});

test('unknown schema, duplicate-ID layouts, malformed data and sidecar/capability uncertainty refuse without fallback',async()=>{
 for(const value of [fixture({payload:'invalid'}),fixture({source:'unknown_source'}),fixture({extraSql:'PRAGMA user_version=0'}),fixture({extraSql:'CREATE TRIGGER modify_event AFTER UPDATE ON context_awareness_events BEGIN UPDATE context_awareness_events SET payload=\'{}\'; END;'})])await assert.rejects(prepareContextLedgerIdentity(options(value)),/schema|Malformed|source/);
 const duplicated=fixture({extraSql:"ALTER TABLE context_awareness_events RENAME TO saved; CREATE TABLE context_awareness_events AS SELECT * FROM saved; INSERT INTO context_awareness_events SELECT * FROM saved; DROP TABLE saved;"});await assert.rejects(prepareContextLedgerIdentity(options(duplicated)),/schema/);
 const before=fixture();await assert.rejects(prepareContextLedgerIdentity(options(before,{walBytes:Buffer.from('wal')})),/WAL unsupported/);await assert.rejects(prepareContextLedgerIdentity(options(before,{walBytes:undefined})),/Explicit/);await assert.rejects(prepareContextLedgerIdentity(options(before,{rollbackJournalBytes:undefined})),/rollback/);
 const walHeader=Buffer.from(before);walHeader[18]=walHeader[19]=2;await assert.rejects(prepareContextLedgerIdentity(options(walHeader)),/WAL-mode/);
 await assert.rejects(prepareContextLedgerIdentity(options(before,{capability:{...capability(),assertStopped:async()=>false}})),/capability/);
 let count=0;await assert.rejects(prepareContextLedgerIdentity(options(before,{capability:{...capability(),assertStopped:async()=>++count===1}})),/capability/);assert.equal(count,2);
 await assert.rejects(prepareContextLedgerIdentity(options(before,{expectedSha256:'0'.repeat(64)})),/changed/);
});
