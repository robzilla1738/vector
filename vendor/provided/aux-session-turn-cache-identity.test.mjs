import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {prepareSessionTurnCacheIdentity} from './aux-session-turn-cache-identity.mjs';
import {PINNED_SESSION_TURN_CACHE_DDL} from './aux-session-turn-cache-schema.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex');
const capability={id:'synthetic-cache-scope',disposable:true,exclusive:true,rollbackJournalAbsent:true,assertStopped:async()=>true};
const message={role:'assistant',provider:'aside',api:'aside-provider',model:'keep-model',timestamp:1,usage:{totalTokens:7},content:[{type:'text',text:'aside prose remains',textSignature:'keep-signature'}],stopReason:'stop'};
const original=' [\n  '+JSON.stringify(message,null,2).replace('"aside"','"\\u0061side"')+'\n ] ';
function fixture(text=original,extra=''){
 const db=new DatabaseSync(':memory:');try{db.exec('CREATE TABLE sessions(id TEXT PRIMARY KEY); CREATE TABLE opaque(id INTEGER PRIMARY KEY,payload BLOB);');db.exec(PINNED_SESSION_TURN_CACHE_DDL);db.exec("PRAGMA user_version=20; INSERT INTO sessions(id) VALUES('fixture-session');");db.prepare('INSERT INTO opaque VALUES(?,?)').run(1,Buffer.from([0,255,6]));
 for(const [id,cache] of [[1,text],[2,null]])db.prepare('INSERT INTO session_turns(id,session_id,turn_id,user_message,final_assistant_message,token_usage,started_at,last_message_timestamp,jsonl_read_offset,jsonl_read_size) VALUES(?,?,?,?,?,?,?,?,?,?)').run(id,'fixture-session','turn-'+id,'[{"provider":"aside","opaque":true}]',cache,'{"exact":7}',10,20,id*100,80);
 if(extra)db.exec(extra);return Buffer.from(db.serialize())}finally{db.close()}
}
const prepare=bytes=>prepareSessionTurnCacheIdentity({databaseBytes:bytes,expectedSha256:sha(bytes),walBytes:null,capability});
test('single cached assistant metadata migrates with all bytes outside direct tokens and all other database values preserved',async()=>{
 const bytes=fixture(),before=Buffer.from(bytes),result=await prepare(bytes);assert.deepEqual(bytes,before);assert.equal(result.receipt.changedRows,1);assert.equal(result.receipt.skippedNull,1);
 const db=new DatabaseSync(':memory:');try{db.deserialize(result.bytes);const rows=db.prepare('SELECT * FROM session_turns ORDER BY id').all();assert.equal(rows[0].final_assistant_message,original.replace('"\\u0061side"','"aux"       ').replace('"aside-provider"','"aux-provider"  '));assert.deepEqual(JSON.parse(rows[0].final_assistant_message),[{...message,provider:'aux',api:'aux-provider'}]);assert.equal(rows[1].final_assistant_message,null);assert.equal(rows[0].user_message,'[{"provider":"aside","opaque":true}]');assert.equal(rows[0].jsonl_read_offset,100);assert.equal(rows[0].jsonl_read_size,80);assert.equal(rows[0].token_usage,'{"exact":7}');assert.deepEqual(Buffer.from(db.prepare('SELECT payload FROM opaque').get().payload),Buffer.from([0,255,6]));assert.equal(db.prepare('PRAGMA quick_check').get().quick_check,'ok')}finally{db.close()}
 assert.deepEqual((await prepare(result.bytes)).bytes,result.bytes);
});
test('unknown cache variants, duplicate keys, changed schema, WAL and lost stopped scope refuse',async()=>{
 for(const text of ['[]',JSON.stringify([message,message]),JSON.stringify([{...message,content:[{type:'toolCall',name:'opaque',arguments:{provider:'aside'}}]}]),JSON.stringify([message]).replace('"provider":"aside"','"provider":"aside","provider":"aux"')])await assert.rejects(prepare(fixture(text)));
 await assert.rejects(prepare(fixture(original,'CREATE INDEX unknown_cache_index ON session_turns(finished_at);')),/schema/);
 const bytes=fixture();await assert.rejects(prepareSessionTurnCacheIdentity({databaseBytes:bytes,expectedSha256:sha(bytes),walBytes:Buffer.from([1]),capability}),/WAL/);
 await assert.rejects(prepareSessionTurnCacheIdentity({databaseBytes:bytes,expectedSha256:sha(bytes),walBytes:null,capability:{...capability,assertStopped:async()=>false}}),/capability/);
});
const pinned=process.env.AUX_PINNED_DAEMON_SOURCE;
test('schema derivation and single-element projection confirmed against pinned actual extractor',{skip:!pinned},()=>{
 const source=readFileSync(pinned,'utf8'),audit=JSON.parse(readFileSync(new URL('../../docs/integration/proposed/aux-session-turn-cache-identity/source-audit.json',import.meta.url)));assert.equal(sha(Buffer.from(source)),audit.daemonSourceSha256);
 for(const anchor of audit.anchors)assert.equal(source.split(anchor.find).length-1,anchor.count,anchor.name);
 const migration=audit.anchors.find(a=>a.name==='migration14').find.split('\n').filter(line=>!['session_run_memory_extractions','session_turn_memory_extractions','ALTER TABLE sessions'].some(part=>line.includes(part))).join('\n');
 assert.equal(PINNED_SESSION_TURN_CACHE_DDL,audit.anchors[0].find+'\n'+migration+'\n'+audit.anchors.find(a=>a.name==='migration18').find+'\n');
 const extractor=vm.runInNewContext(audit.anchors.find(a=>a.name==='cache-extractor').find+';extractFinalAssistantMessage',{}, {timeout:1000});
 assert.deepEqual(JSON.parse(JSON.stringify(extractor({...message,content:[{type:'thinking',thinking:'opaque'},...message.content]}))),[message]);assert.equal(extractor({...message,content:[]}),null);assert.deepEqual(JSON.parse(JSON.stringify(extractor({...message,stopReason:'error',content:[]}))),[{...message,stopReason:'error',content:[]}]);
});
