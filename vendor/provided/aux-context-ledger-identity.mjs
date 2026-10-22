/** Pure source transform + stopped snapshot buffer migration. No path/state I/O. */
import{createHash}from'node:crypto';
import{DatabaseSync,constants}from'node:sqlite';
import{PINNED_CONTEXT_LEDGER_DDL,PINNED_CONTEXT_LEDGER_USER_VERSION}from'./aux-context-ledger-schema.mjs';
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
export const AUX_CONTEXT_LEDGER_SOURCE_SHA256='5e35dfa1eb76d4614246f954b652fd505e271a0b3f1ac3168132fb8bc03814f5';
const MAX_DB=64*1024*1024,MAX_ROWS=20000,MAX_JSON=2*1024*1024;
const eventTable='context_awareness_events',tables=['context_awareness_blobs','context_awareness_frames',eventTable,'context_awareness_summaries'];
const sources=new Set(['aside_dom','aux_dom','mac_ax','win_uia']);
export function applyAuxContextLedgerIdentity({text,original}){
 if(typeof original!=='string'||sha(original)!==AUX_CONTEXT_LEDGER_SOURCE_SHA256)throw Error('Context ledger source pin mismatch');
 if(typeof text!=='string'||text.split('aside_dom').length-1!==15||text.includes('aux_dom'))throw Error('Context ledger producer/schema/query generation drift');
 const anchor={kind:'identity',name:'Aux context DOM producer/schema/query contract',find:'aside_dom',replace:'aux_dom',count:15};
 return{text:text.split(anchor.find).join(anchor.replace),anchors:[anchor]};
}
function schema(db){return{objects:db.prepare('SELECT type,name,tbl_name,sql FROM sqlite_schema ORDER BY type,name').all(),columns:tables.map(table=>({table,columns:db.prepare(`PRAGMA table_xinfo(${table})`).all()}))}}
function pinnedSchema(){const db=new DatabaseSync(':memory:',{allowExtension:false});try{db.exec(PINNED_CONTEXT_LEDGER_DDL);return JSON.stringify(schema(db))}finally{db.close()}}
const expectedSchema=pinnedSchema();
export const AUX_CONTEXT_LEDGER_SCHEMA_SHA256=sha(expectedSchema);
function rows(db,table){const statement=db.prepare(`SELECT * FROM ${table} ORDER BY id LIMIT ${MAX_ROWS+1}`);statement.setReadBigInts(true);const data=statement.all();if(data.length>MAX_ROWS||data.some(row=>typeof row.id!=='string'||!row.id.length))throw Error('Unsupported context ledger row count/identity');return data}
const fingerprint=value=>sha(JSON.stringify(value,(_key,item)=>typeof item==='bigint'?{$integer:String(item)}:item instanceof Uint8Array?{$blob:Buffer.from(item).toString('base64')}:item));
function otherFields(row){const copy={...row};delete copy.source;return fingerprint(copy)}
function jsonObject(text){if(typeof text!=='string'||Buffer.byteLength(text)>MAX_JSON)throw Error('Unsupported context ledger JSON size/type');let parsed;try{parsed=JSON.parse(text)}catch{throw Error('Malformed context ledger payload/target JSON')};if(!parsed||typeof parsed!=='object'||Array.isArray(parsed))throw Error('Unsupported context ledger payload/target schema')}
function integrity(db){const checks=db.prepare('PRAGMA quick_check').all();if(checks.length!==1||checks[0].quick_check!=='ok'||db.prepare('PRAGMA foreign_key_check').all().length)throw Error('Context ledger integrity failure')}
async function stopped(capability,hashes,phase){if(!capability||capability.disposable!==true||capability.exclusive!==true||capability.rollbackJournalAbsent!==true||!/^[A-Za-z0-9-]{8,128}$/.test(capability.id)||typeof capability.assertStopped!=='function'||await capability.assertStopped({...hashes,phase})!==true)throw Error('Live stopped-exclusive disposable context-ledger snapshot capability required')}

export async function prepareContextLedgerIdentity({databaseBytes,expectedSha256,walBytes,rollbackJournalBytes,capability}){
 if(!(databaseBytes instanceof Uint8Array)||databaseBytes.length<100||databaseBytes.length>MAX_DB||!/^[a-f0-9]{64}$/.test(expectedSha256)||sha(databaseBytes)!==expectedSha256)throw Error('Invalid or changed bounded context ledger snapshot');
 if(walBytes!==null&&!(walBytes instanceof Uint8Array))throw Error('Explicit absent/empty WAL snapshot required');
 if(walBytes?.length)throw Error('Context ledger WAL unsupported: require separately verified checkpointed DELETE snapshot');
 if(rollbackJournalBytes!==null)throw Error('Explicit absent rollback journal required');
 const input=Buffer.from(databaseBytes),wal=walBytes===null?null:Buffer.from(walBytes);
 try{
  if(input.subarray(0,16).toString()!=='SQLite format 3\0'||input[18]!==1||input[19]!==1)throw Error('Unknown or WAL-mode context ledger snapshot: checkpoint private clone first');
  const hashes={databaseSha256:expectedSha256,walSha256:wal===null?null:sha(wal)};
  await stopped(capability,hashes,'prepare-context-ledger-copy');
  if(sha(input)!==expectedSha256)throw Error('Context ledger snapshot changed before cloning');
  const db=new DatabaseSync(':memory:',{allowExtension:false});let began=false;
  try{
   db.deserialize(input);db.enableDefensive(true);db.exec('PRAGMA trusted_schema=OFF; PRAGMA temp_store=MEMORY; PRAGMA journal_mode=MEMORY; PRAGMA foreign_keys=OFF;');
   if(db.prepare('PRAGMA user_version').get().user_version!==PINNED_CONTEXT_LEDGER_USER_VERSION||JSON.stringify(schema(db))!==expectedSchema)throw Error('Unknown or unfinished supplied context ledger schema');
   integrity(db);const snapshots=new Map(tables.map(table=>[table,rows(db,table)])),events=snapshots.get(eventTable);
   for(const row of events){if(!sources.has(row.source))throw Error('Unknown context ledger event source');jsonObject(row.target);jsonObject(row.payload)}
   const plans=events.map(row=>({id:row.id,before:row.source,after:row.source==='aside_dom'?'aux_dom':row.source,otherHash:otherFields(row)}));
   db.setAuthorizer((action,table,column)=>{if([constants.SQLITE_INSERT,constants.SQLITE_DELETE].includes(action))return constants.SQLITE_DENY;if(action===constants.SQLITE_UPDATE&&(table!==eventTable||column!=='source'))return constants.SQLITE_DENY;return constants.SQLITE_OK});
   db.exec('BEGIN IMMEDIATE');began=true;let changedRows=0;
   const update=db.prepare('UPDATE context_awareness_events SET source=? WHERE id=? AND source=?');
   for(const row of plans){if(row.before===row.after)continue;if(update.run(row.after,row.id,row.before).changes!==1)throw Error('Context ledger row compare-and-exchange conflict');changedRows++}
   const actual=rows(db,eventTable);if(actual.length!==plans.length||actual.some((row,index)=>row.id!==plans[index].id||row.source!==plans[index].after||otherFields(row)!==plans[index].otherHash))throw Error('Unrelated context event fields/rows changed');
   for(const table of tables)if(table!==eventTable&&fingerprint(rows(db,table))!==fingerprint(snapshots.get(table)))throw Error('Unrelated ledger table rows changed');
   if(JSON.stringify(schema(db))!==expectedSchema||db.prepare('PRAGMA user_version').get().user_version!==PINNED_CONTEXT_LEDGER_USER_VERSION)throw Error('Context ledger schema/version changed');
   integrity(db);db.exec('COMMIT');began=false;
   await stopped(capability,hashes,'context-ledger-copy-prepared');
   const output=changedRows?Buffer.from(db.serialize()):Buffer.from(input);
   if(output.length>MAX_DB||output[18]!==1||output[19]!==1)throw Error('Unsupported prepared context ledger output');
   return{bytes:output,receipt:{format:'aux.context-ledger-identity.v1',sourceIdentity:'aside_dom',targetIdentity:'aux_dom',daemonSourceSha256:AUX_CONTEXT_LEDGER_SOURCE_SHA256,sourceSha256:expectedSha256,outputSha256:sha(output),sourceSchemaSha256:AUX_CONTEXT_LEDGER_SCHEMA_SHA256,ledgerDdlSha256:sha(PINNED_CONTEXT_LEDGER_DDL),userVersion:PINNED_CONTEXT_LEDGER_USER_VERSION,changed:changedRows>0,changedRows,eventRows:events.length,walDisposition:wal===null?'verified-absent':'verified-empty',uncoveredReferences:['encrypted evidence blob contents','summary prose/citations','other databases','WAL checkpoint lineage until separately paired']}};
  }catch(error){if(began){try{db.exec('ROLLBACK')}catch{}}throw error}finally{db.close()}
 }finally{input.fill(0);wal?.fill(0)}
}
