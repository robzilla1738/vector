/** Offline private-memory SQLite preparation only. No filesystem or runtime access. */
import {DatabaseSync,constants} from 'node:sqlite';
import {createHash} from 'node:crypto';
import {prepareAuxTranscriptProviderIdentity,AUX_TRANSCRIPT_SOURCE_SHA256} from './aux-transcript-provider-identity.mjs';
import {PINNED_SESSION_TURN_CACHE_DDL,PINNED_SESSION_TURN_CACHE_USER_VERSION} from './aux-session-turn-cache-schema.mjs';
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const MAX_DB=64*1024*1024,MAX_ROWS=20000,MAX_JSON=2*1024*1024;
const fingerprint=value=>sha(JSON.stringify(value,(_key,item)=>typeof item==='bigint'?{$integer:String(item)}:item instanceof Uint8Array?{$blob:Buffer.from(item).toString('base64')}:item));
const other=row=>{const copy={...row};delete copy.final_assistant_message;return fingerprint(copy)};
function schema(db){return {objects:db.prepare("SELECT type,name,tbl_name,sql FROM sqlite_schema WHERE tbl_name='session_turns' ORDER BY type,name").all(),columns:db.prepare('PRAGMA table_xinfo(session_turns)').all()}}
const expectedSchema=(()=>{const db=new DatabaseSync(':memory:');try{db.exec(PINNED_SESSION_TURN_CACHE_DDL);return JSON.stringify(schema(db))}finally{db.close()}})();
function allRows(db,table){
 if(!/^[A-Za-z_][A-Za-z0-9_]*$/.test(table))throw Error('Unsupported table name');
 const statement=db.prepare(`SELECT * FROM "${table}" LIMIT ${MAX_ROWS+1}`);statement.setReadBigInts(true);const rows=statement.all();if(rows.length>MAX_ROWS)throw Error('Cache migration row bound exceeded');return rows;
}
function integrity(db){const checks=db.prepare('PRAGMA quick_check').all();if(checks.length!==1||checks[0].quick_check!=='ok')throw Error('Cache database integrity failed')}
async function stopped(capability,hash,phase){if(!capability||!/^[-A-Za-z0-9]{8,128}$/.test(capability.id)||capability.disposable!==true||capability.exclusive!==true||capability.rollbackJournalAbsent!==true||typeof capability.assertStopped!=='function'||await capability.assertStopped({databaseSha256:hash,phase})!==true)throw Error('Stopped disposable cache snapshot capability required')}
async function cacheText(text,capability){
 if(typeof text!=='string'||Buffer.byteLength(text)>MAX_JSON)throw Error('Bounded cache JSON text required');
 const value=JSON.parse(text);if(!Array.isArray(value)||value.length!==1||value[0]?.role!=='assistant'||!Array.isArray(value[0].content)||value[0].content.length>1||value[0].content.some(block=>block?.type!=='text'||typeof block.text!=='string'||!block.text)||(!value[0].content.length&&value[0].stopReason!=='error'))throw Error('Unsupported cached final assistant projection');
 const start=text.indexOf('[')+1,end=text.lastIndexOf(']'),inner=Buffer.from(text.slice(start,end));
 // Framing the existing single object as one JSONL row reuses the reviewed
 // duplicate-aware direct-token parser. Actual LF whitespace is restored below.
 const framed=Buffer.alloc(inner.length+1);inner.copy(framed);for(let i=0;i<inner.length;i++)if(framed[i]===10)framed[i]=32;framed[inner.length]=10;
 const prepared=await prepareAuxTranscriptProviderIdentity({bytes:framed,expectedSha256:sha(framed),capability});
 const output=Buffer.from(prepared.bytes.subarray(0,inner.length));for(let i=0;i<inner.length;i++)if(inner[i]===10)output[i]=10;
 const result=text.slice(0,start)+output.toString('utf8')+text.slice(end);
 if(Buffer.byteLength(result)!==Buffer.byteLength(text))throw Error('Cached JSON byte length changed');
 return {text:result,fields:prepared.receipt.changedFields};
}
export async function prepareSessionTurnCacheIdentity({databaseBytes,expectedSha256,walBytes,capability}={}){
 if(!(databaseBytes instanceof Uint8Array)||databaseBytes.length<100||databaseBytes.length>MAX_DB)throw Error('Bounded cache database snapshot required');
 const input=Buffer.from(databaseBytes);let db,began=false;
 try{
  if(sha(input)!==expectedSha256)throw Error('Cache database hash mismatch');
  if(walBytes!==null&&(!(walBytes instanceof Uint8Array)||walBytes.length))throw Error('Cache migration requires absent or empty checkpointed WAL');
  if(input.subarray(0,16).toString()!=='SQLite format 3\0'||input[18]!==1||input[19]!==1)throw Error('Cache migration requires checkpointed DELETE-header main');
  await stopped(capability,expectedSha256,'cache-before-prepare');db=new DatabaseSync(':memory:',{allowExtension:false});db.deserialize(input);db.enableDefensive(true);db.exec('PRAGMA trusted_schema=OFF; PRAGMA temp_store=MEMORY; PRAGMA journal_mode=MEMORY; PRAGMA foreign_keys=OFF;');
  if(db.prepare('PRAGMA user_version').get().user_version!==PINNED_SESSION_TURN_CACHE_USER_VERSION||JSON.stringify(schema(db))!==expectedSchema||db.prepare("SELECT 1 FROM sqlite_schema WHERE name='session_runs'").get())throw Error('Unknown or unfinished session turn cache schema');
  const fullSchema=db.prepare('SELECT type,name,tbl_name,sql FROM sqlite_schema ORDER BY type,name').all();
  if(fullSchema.some(row=>row.type==='trigger'||/CREATE\s+VIRTUAL\s+TABLE/i.test(row.sql??'')))throw Error('Unsupported cache database triggers/virtual tables');
  const names=fullSchema.filter(row=>row.type==='table').map(row=>row.name);if(names.length>128)throw Error('Cache table count bound exceeded');
  integrity(db);const originals=new Map(names.map(name=>[name,allRows(db,name)]));
  let totalRows=0,totalBytes=0;for(const rows of originals.values()){totalRows+=rows.length;totalBytes+=Buffer.byteLength(JSON.stringify(rows,(_k,v)=>typeof v==='bigint'?String(v):v instanceof Uint8Array?Buffer.from(v).toString('base64'):v));if(totalRows>100000||totalBytes>128*1024*1024)throw Error('Cache database audit budget exceeded')}
  const plans=[];let skippedNull=0;const changedFields={provider:0,api:0};
  for(const row of originals.get('session_turns')){
   if(typeof row.id!=='bigint'||row.id<1n||typeof row.session_id!=='string'||!row.session_id.length)throw Error('Unsupported turn primary key');
   if(row.final_assistant_message===null){skippedNull++;plans.push({row,after:null});continue}
   const migrated=await cacheText(row.final_assistant_message,capability);for(const key of Object.keys(changedFields))changedFields[key]+=migrated.fields[key];plans.push({row,after:migrated.text});
  }
  db.setAuthorizer((action,table,column)=>[constants.SQLITE_INSERT,constants.SQLITE_DELETE].includes(action)||(action===constants.SQLITE_UPDATE&&(table!=='session_turns'||column!=='final_assistant_message'))?constants.SQLITE_DENY:constants.SQLITE_OK);
  db.exec('BEGIN IMMEDIATE');began=true;const update=db.prepare('UPDATE session_turns SET final_assistant_message=? WHERE id=? AND final_assistant_message=?');let changedRows=0;
  for(const {row,after} of plans)if(after!==row.final_assistant_message){if(update.run(after,row.id,row.final_assistant_message).changes!==1)throw Error('Cache row compare-and-exchange conflict');changedRows++}
  const actual=allRows(db,'session_turns');if(actual.length!==plans.length||actual.some((row,index)=>row.id!==plans[index].row.id||row.final_assistant_message!==plans[index].after||other(row)!==other(plans[index].row)))throw Error('Unrelated cached row fields changed');
  for(const name of names)if(name!=='session_turns'&&fingerprint(allRows(db,name))!==fingerprint(originals.get(name)))throw Error('Unrelated database table changed');
  if(JSON.stringify(db.prepare('SELECT type,name,tbl_name,sql FROM sqlite_schema ORDER BY type,name').all())!==JSON.stringify(fullSchema)||db.prepare('PRAGMA user_version').get().user_version!==PINNED_SESSION_TURN_CACHE_USER_VERSION)throw Error('Cache database schema/version changed');
  integrity(db);db.exec('COMMIT');began=false;await stopped(capability,expectedSha256,'cache-after-prepare');
  const bytes=changedRows?Buffer.from(db.serialize()):Buffer.from(input);if(bytes.length>MAX_DB||bytes[18]!==1||bytes[19]!==1)throw Error('Unsupported cache output');
  return {bytes,receipt:{format:'aux.session-turn-cache-identity.v1',daemonSourceSha256:AUX_TRANSCRIPT_SOURCE_SHA256,sourceSha256:expectedSha256,outputSha256:sha(bytes),targetSchemaSha256:sha(expectedSchema),userVersion:PINNED_SESSION_TURN_CACHE_USER_VERSION,changedRows,changedFields,skippedNull,rows:plans.length,unrelatedTablesVerified:names.filter(name=>name!=='session_turns').length,preparedOnly:true,uncoveredReferences:['opaque queued/steering/tool arguments','other cached projection columns','real startup/write fence']}};
 }catch(error){if(began)try{db.exec('ROLLBACK')}catch{}throw error}finally{db?.close();input.fill(0)}
}
