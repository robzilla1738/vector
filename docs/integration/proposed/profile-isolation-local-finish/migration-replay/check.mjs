import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import fs from 'node:fs/promises';
import {readFileSync,writeFileSync,mkdtempSync,rmSync} from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
import {applyAuxMigrationReplay} from './transform.mjs';
import {applyAuxFiniteWriters} from '../writes-next/transform.mjs';
const previous=applyAuxFiniteWriters(readFileSync('/private/tmp/aux-finite-input.mjs','utf8'));
const result=process.env.AUX_REPLAY_BASELINE?previous:applyAuxMigrationReplay(previous.source);
const start=result.source.indexOf('async function auxMigrateRoutineV2Sessions(Cn){');
const end=result.source.indexOf('var init_routine_v2=',start);
assert(start>0&&end>start);
const original=result.source.slice(start,end);
const finishEnd=result.source.indexOf('Cn.finalizeLatestTurn=_i;');const finishStart=result.source.lastIndexOf('function _i(',finishEnd);const originalFinalize=result.source.slice(finishStart,finishEnd);assert(finishStart>0);
const root=mkdtempSync('/private/tmp/aux-routine-replay-');
const checks=[];
try{
 for(const fault of ['after-report-append','before-final-transaction','none']){
 const home=path.join(root,fault);await fs.mkdir(home,{recursive:true});
 const db=new DatabaseSync(path.join(home,'state.sqlite'));
 const source={id:'routine1',name:'Daily',prompt:'Report',kind:'cron',project_id:null,target_session_id:null,created_by_session_id:null,timezone:'UTC',rrule:'FREQ=DAILY',schedule_kind:'recurring',trigger_kind:'schedule',event_filter:null,run_at:null,next_run_at:'2026-10-24T10:00:00.000Z',paused_at:null,deleted_at:null,pause_reason:null,created_at:1,updated_at:1,model:null,permission_mode:null,runtime_config:null,browser_binding:null};
 db.exec('CREATE TABLE routines_v1 ('+Object.keys(source).map(k=>`"${k}"`).join(',')+'); CREATE TABLE routines (id TEXT PRIMARY KEY, data TEXT); CREATE TABLE sessions (id TEXT PRIMARY KEY, data TEXT); CREATE TABLE turns (id INTEGER PRIMARY KEY, sessionId TEXT, finishedAt INTEGER, turnId TEXT);');
 db.prepare('INSERT INTO routines_v1 VALUES ('+Object.keys(source).map(()=>'?').join(',')+')').run(...Object.values(source));
 const putSession=s=>db.prepare('INSERT OR REPLACE INTO sessions VALUES (?,?)').run(s.id,JSON.stringify(s));
 const getSession=id=>{let r=db.prepare('SELECT data FROM sessions WHERE id=?').get(id);return r&&JSON.parse(r.data)};
 const run={id:'run1',routineId:'routine1',model:'model',permissionMode:'guard',runtimeConfig:{},createdAt:1};putSession(run);
 const sessionDir=s=>path.join(home,'sessions',s.id);
 const messages=s=>path.join(sessionDir(s),'messages.jsonl');
 await fs.mkdir(path.join(sessionDir(run),'attachments'),{recursive:true});await fs.writeFile(path.join(sessionDir(run),'attachments','proof.txt'),'recovered attachment');
 await fs.writeFile(messages(run),JSON.stringify({role:'assistant',stopReason:'stop',content:[{type:'text',text:'Found ./attachments/proof.txt'}],timestamp:1000})+'\n');
 const rows=async id=>{const text=await fs.readFile(messages({id}),'utf8').catch(e=>{if(e.code==='ENOENT')return '';throw e});let offset=0;return text.split('\n').filter(Boolean).map(line=>{const row={id:String(offset),jsonlReadSize:Buffer.byteLength(line+'\n'),msg:JSON.parse(line)};offset+=row.jsonlReadSize;return row})};
 let armed=fault!=='none',finalizations=0;const warnings=[];
 const finishDb={select(){let condition;const q={from(){return q},where(c){condition=c;return q},orderBy(){return q},limit(){return q},get(){return db.prepare('SELECT * FROM turns WHERE sessionId=? ORDER BY id DESC LIMIT 1').get(condition.value)}};return q},update(){let values,condition;const q={set(v){values=v;return q},where(c){condition=c;return q},run(){db.prepare('UPDATE turns SET finishedAt=? WHERE id=?').run(values.finishedAt.getTime(),condition.value)}};return q}};
 const finishContext=vm.createContext({Date,stateDb:()=>finishDb,SessionTurnTable:{id:'id',turnId:'turnId',finishedAt:'finishedAt',sessionId:'sessionId'},eq:(field,value)=>({field,value}),desc:v=>v,Ui(account,id,message){writeFileSync(messages({id}),JSON.stringify(message)+'\n',{flag:'a'});finalizations++}});vm.runInContext(originalFinalize,finishContext);

 const store={get:(account,id)=>getSession(id),insert(account,s){putSession(s);return s},listAllMessageRows:(account,id)=>rows(id),listTurnsForFeedback:()=>[],async startLatestTurn(account,id){await fs.mkdir(sessionDir({id}),{recursive:true});db.prepare('INSERT INTO turns (sessionId,finishedAt,turnId) VALUES (?,NULL,?)').run(id,'synthetic-turn')},appendMessage(account,id,msg){writeFileSync(messages({id}),JSON.stringify(msg)+'\n',{flag:'a'});if(armed&&fault==='after-report-append'&&msg.routineSource){armed=false;throw Error('Injected interruption after durable report append')}},finalizeLatestTurn(account,id,date){finishContext._i(account,id,date)},async listMessagesForAgentContext(account,id){const list=await rows(id);const index=list.findLastIndex(row=>row.msg.role==='compaction');return list.slice(Math.max(index,0)).map(r=>r.msg)}};
 const table=name=>new Proxy({name},{get:(t,k)=>k in t?t[k]:String(k)}),RoutineTable=table('routines'),SessionTable=table('sessions');
 const eq=(field,value)=>({field,value});
 const query={select(){let tab,condition;const q={from(t){tab=t;return q},where(c){condition=c;return q},orderBy(){return q},all(){let list=db.prepare('SELECT data FROM '+tab.name).all().map(r=>JSON.parse(r.data));return condition?list.filter(r=>r[condition.field]===condition.value):list},get(){return q.all()[0]}};return q},update(tab){let values,condition;const q={set(v){values=v;return q},where(c){condition=c;return q},run(){for(const row of db.prepare('SELECT data FROM '+tab.name).all()){const r=JSON.parse(row.data);if(r[condition.field]===condition.value)db.prepare('UPDATE '+tab.name+' SET data=? WHERE id=?').run(JSON.stringify({...r,...values}),r.id)}}};return q},insert(tab){return{values(value){return{run(){db.prepare('INSERT INTO '+tab.name+' VALUES (?,?)').run(value.id,JSON.stringify(value))}}}}},transaction(fn){if(armed&&fault==='before-final-transaction'){armed=false;throw Error('Injected interruption before transaction')}db.exec('BEGIN');try{fn(query);db.exec('COMMIT')}catch(e){db.exec('ROLLBACK');throw e}},$client:db};
 const schema={parse:v=>v};const settings=()=>({get:k=>({defaultModel:'model',defaultPermissionMode:'guard',routineDeviceId:'device'})[k]});
 const context=vm.createContext({fs$1:fs,path,Date,JSON,String,Number,Object,Error,Promise,Set,Map,console,state_db_exports:{stateDb:()=>query},schema_exports$1:{RoutineTable,SessionTable},store_exports:{SessionStore:store},settings_exports:{settings},init_state_db(){},init_schema$2(){},init_store$1(){},init_settings$1(){},object:()=>schema,string$3:()=>({nullable(){return this}}),number$2:()=>({nullable(){return this}}),_enum:()=>schema,eq,asc:v=>v,modelSelectionSchema:schema,sessionPermissionModeSchema:schema,sessionRuntimeConfigSchema:schema,browserBindingSchema:schema,getAccountTaskRoot:()=>home,getSessionTaskDir:sessionDir,getSessionMessagesJsonlPath:(account,s)=>messages(s),textContent$3:m=>m.content.map(c=>c.text).join(''),import_dayjs_min$2:{default:()=>({tz:()=>({format:()=> '20261024T100000'})})},normalizeRRule:s=>s,getNextRunAt:()=>new Date('2026-10-24T10:00:00Z'),logger:{info(){},warn(message,data){warnings.push(String(data.error))}}});
 vm.runInContext(original,context);
 await context.auxMigrateRoutineV2Sessions('synthetic');
 if(fault!=='none'){assert.equal(db.prepare('SELECT COUNT(*) n FROM routines_v1').get().n,1);assert.equal(db.prepare('SELECT COUNT(*) n FROM routines').get().n,0);assert(warnings.some(s=>s.includes('Injected interruption')));await context.auxMigrateRoutineV2Sessions('synthetic')}
 assert.equal(db.prepare('SELECT COUNT(*) n FROM routines_v1').get().n,0);assert.equal(db.prepare('SELECT COUNT(*) n FROM routines').get().n,1);
 assert.equal(db.prepare('SELECT COUNT(*) n FROM turns WHERE finishedAt IS NULL').get().n,0,'Imported turn left unfinished after replay');
 const migrated=await rows('routine-routine1');assert.equal(migrated.filter(r=>r.msg.routineSource).length,1);assert.equal(migrated.filter(r=>r.msg.role==='compaction').length,1);assert.equal(await fs.readFile(path.join(home,'sessions','routine-routine1','attachments','run1','proof.txt'),'utf8'),'recovered attachment');
 const snapshot=await fs.readFile(messages({id:'routine-routine1'}),'utf8');await context.auxMigrateRoutineV2Sessions('synthetic');assert.equal(await fs.readFile(messages({id:'routine-routine1'}),'utf8'),snapshot);
 checks.push({fault,passed:true,reportCount:1,compactionCount:1,sourceRowDeletedOnlyAfterTransaction:true,attachmentRecovered:true,repeatReplayNoOp:true,finalizations});db.close();
 }
 writeFileSync(new URL('./evidence.json',import.meta.url),JSON.stringify({sourceSha256:result.outputSha256,functionSha256:createHash('sha256').update(original).digest('hex'),checks,usesActualMigrationFunction:true,realSQLiteAndFilesystem:true,sessionStoreAndOrmAdapters:true,actualSessionStoreFinalizeFunctionExecuted:true,sessionStoreStartAndReadAdapters:true,finalizeFunctionSha256:createHash('sha256').update(originalFinalize).digest('hex'),inputSha256:result.inputSha256,crashModel:'exception injection at persistent boundaries, not OS kill',ownerData:false},null,2)+'\n');console.log('PASS real SQLite/files routine replay, three bounded scenarios');
}finally{rmSync(root,{recursive:true,force:true})}
