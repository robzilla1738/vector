/** External exact-path tracking-cache migration. No filesystem/runtime access. */
import {createHash} from 'node:crypto';
import {DatabaseSync,constants} from 'node:sqlite';
import {parseAuxIdentityJsonTokens,replaceAuxIdentityJsonStringToken} from './aux-identity-json-tokens.mjs';
import {PINNED_PROVIDER_STATE_TARGET_DDL,PINNED_PROVIDER_STATE_USER_VERSION} from './aux-sqlite-provider-identity-schema.mjs';
import {AUX_TRANSCRIPT_SOURCE_SHA256} from './aux-transcript-provider-identity.mjs';
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const object=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
const own=(value,key)=>Object.hasOwn(value,key);
const fingerprint=value=>sha(JSON.stringify(value,(_key,item)=>typeof item==='bigint'?{$integer:String(item)}:item instanceof Uint8Array?{$blob:Buffer.from(item).toString('base64')}:item));
const recordKeys=new Set(['sessionId','description','model','isRunning','isBackground','unawaited']);
const modelKeys=new Set(['provider','modelId','thinkingLevel','fastMode']);
const levels=new Set(['off','minimal','low','medium','high','xhigh','max']);
export function prepareSubagentTrackingJson({bytes,expectedSha256}={}){
 if(!(bytes instanceof Uint8Array)||bytes.length>2*1024*1024)throw Error('Bounded tracking JSON bytes required');
 const before=Buffer.from(bytes);if(sha(before)!==expectedSha256)throw Error('Tracking JSON source hash mismatch');
 const text=new TextDecoder('utf-8',{fatal:true,ignoreBOM:true}).decode(before);if(text.startsWith('\uFEFF'))throw Error('Tracking BOM refused');
 const {value,root}=parseAuxIdentityJsonTokens(text);if(!object(value))throw Error('Unknown tool-state shape');
 const output=Buffer.from(before),expected=structuredClone(value);let changedModels=0;
 if(own(value,'subagent')){
  if(!object(value.subagent)||Object.keys(value.subagent).join(',')!=='subagents'||!Array.isArray(value.subagent.subagents)||value.subagent.subagents.length>1000)throw Error('Unknown tracked-subagent branch');
  const ids=new Set();for(const [index,entry] of value.subagent.subagents.entries()){
   if(!object(entry)||Object.keys(entry).some(key=>!recordKeys.has(key))||typeof entry.sessionId!=='string'||!/^[A-Za-z0-9_-]{1,128}$/.test(entry.sessionId)||ids.has(entry.sessionId)||typeof entry.description!=='string'||typeof entry.isRunning!=='boolean'||typeof entry.isBackground!=='boolean'||own(entry,'unawaited')&&typeof entry.unawaited!=='boolean'||!object(entry.model)||Object.keys(entry.model).some(key=>!modelKeys.has(key))||typeof entry.model.provider!=='string'||!entry.model.provider.length||typeof entry.model.modelId!=='string'||!entry.model.modelId.trim()||!levels.has(entry.model.thinkingLevel)||own(entry.model,'fastMode')&&typeof entry.model.fastMode!=='boolean')throw Error('Unknown or ambiguous tracked-subagent record');
   ids.add(entry.sessionId);if(entry.model.provider!=='aside')continue;
   const token=root.fields.get('subagent').fields.get('subagents').items[index].fields.get('model').fields.get('provider');
   replaceAuxIdentityJsonStringToken({text,output,token,replacement:'aux'});expected.subagent.subagents[index].model.provider='aux';changedModels++;
  }
 }
 if(output.length!==before.length||JSON.stringify(JSON.parse(output.toString('utf8')))!==JSON.stringify(expected))throw Error('Tracking preservation check failed');
 return {bytes:output,receipt:{format:'aux.subagent-tracking-json.v1',sourceSha256:expectedSha256,outputSha256:sha(output),changedModels,byteLengthPreserved:true}};
}
function schema(db){return {objects:db.prepare("SELECT type,name,tbl_name,sql FROM sqlite_schema WHERE tbl_name='sessions' ORDER BY type,name").all(),columns:db.prepare('PRAGMA table_xinfo(sessions)').all()}}
const expectedSchema=(()=>{const db=new DatabaseSync(':memory:');try{db.exec(PINNED_PROVIDER_STATE_TARGET_DDL);return JSON.stringify(schema(db))}finally{db.close()}})();
function rows(db,table){if(!/^[A-Za-z_][A-Za-z0-9_]*$/.test(table))throw Error('Unsupported tracking table name');const statement=db.prepare(`SELECT * FROM "${table}" LIMIT 20001`);statement.setReadBigInts(true);const result=statement.all();if(result.length>20000)throw Error('Tracking row bound exceeded');return result}
const other=row=>{const copy={...row};delete copy.tool_state;return fingerprint(copy)};
async function stopped(capability,hash,phase){if(!capability||!/^[-A-Za-z0-9]{8,128}$/.test(capability.id)||capability.disposable!==true||capability.exclusive!==true||capability.rollbackJournalAbsent!==true||typeof capability.assertStopped!=='function'||await capability.assertStopped({databaseSha256:hash,phase})!==true)throw Error('Stopped tracking snapshot capability required')}
function integrity(db){const result=db.prepare('PRAGMA quick_check').all();if(result.length!==1||result[0].quick_check!=='ok')throw Error('Tracking database integrity failed')}
export async function prepareSqliteSubagentTrackingIdentity({databaseBytes,expectedSha256,walBytes,capability}={}){
 if(!(databaseBytes instanceof Uint8Array)||databaseBytes.length<100||databaseBytes.length>64*1024*1024)throw Error('Bounded tracking database required');
 const input=Buffer.from(databaseBytes);let db,began=false;try{
  if(sha(input)!==expectedSha256)throw Error('Tracking database hash mismatch');
  if(walBytes!==null&&(!(walBytes instanceof Uint8Array)||walBytes.length)||input.subarray(0,16).toString()!=='SQLite format 3\0'||input[18]!==1||input[19]!==1)throw Error('Tracking migration requires checkpointed main and absent/empty WAL');
  await stopped(capability,expectedSha256,'tracking-before-prepare');db=new DatabaseSync(':memory:',{allowExtension:false});db.deserialize(input);db.enableDefensive(true);db.exec('PRAGMA trusted_schema=OFF; PRAGMA temp_store=MEMORY; PRAGMA journal_mode=MEMORY; PRAGMA foreign_keys=OFF;');
  if(db.prepare('PRAGMA user_version').get().user_version!==PINNED_PROVIDER_STATE_USER_VERSION||JSON.stringify(schema(db))!==expectedSchema)throw Error('Unknown tracking session schema');
  const fullSchema=db.prepare('SELECT type,name,tbl_name,sql FROM sqlite_schema ORDER BY type,name').all();if(fullSchema.some(row=>row.type==='trigger'||/CREATE\s+VIRTUAL\s+TABLE/i.test(row.sql??'')))throw Error('Unsupported tracking triggers/virtual tables');
  const names=fullSchema.filter(row=>row.type==='table').map(row=>row.name);if(names.length>128)throw Error('Tracking table budget exceeded');integrity(db);
  const originals=new Map();let rowBudget=0,byteBudget=0;for(const name of names){const values=rows(db,name);rowBudget+=values.length;byteBudget+=Buffer.byteLength(JSON.stringify(values,(_k,v)=>typeof v==='bigint'?String(v):v instanceof Uint8Array?Buffer.from(v).toString('base64'):v));if(rowBudget>100000||byteBudget>128*1024*1024)throw Error('Tracking audit budget exceeded');originals.set(name,values)}
  const plans=originals.get('sessions').map(row=>{if(typeof row.id!=='string'||!row.id.length||typeof row.tool_state!=='string')throw Error('Unknown tracking row');const migrated=prepareSubagentTrackingJson({bytes:Buffer.from(row.tool_state),expectedSha256:sha(Buffer.from(row.tool_state))});return{row,after:migrated.bytes.toString('utf8'),changedModels:migrated.receipt.changedModels}});
  db.setAuthorizer((action,table,column)=>[constants.SQLITE_INSERT,constants.SQLITE_DELETE].includes(action)||(action===constants.SQLITE_UPDATE&&(table!=='sessions'||column!=='tool_state'))?constants.SQLITE_DENY:constants.SQLITE_OK);
  db.exec('BEGIN IMMEDIATE');began=true;const update=db.prepare('UPDATE sessions SET tool_state=? WHERE id=? AND tool_state=?');let changedRows=0,changedModels=0;
  for(const {row,after,changedModels:count} of plans)if(after!==row.tool_state){if(update.run(after,row.id,row.tool_state).changes!==1)throw Error('Tracking row compare-and-exchange conflict');changedRows++;changedModels+=count}
  const actual=rows(db,'sessions');if(actual.length!==plans.length||actual.some((row,index)=>row.id!==plans[index].row.id||row.tool_state!==plans[index].after||other(row)!==other(plans[index].row)))throw Error('Unrelated session values changed');
  for(const name of names)if(name!=='sessions'&&fingerprint(rows(db,name))!==fingerprint(originals.get(name)))throw Error('Unrelated tracking table values changed');
  if(JSON.stringify(db.prepare('SELECT type,name,tbl_name,sql FROM sqlite_schema ORDER BY type,name').all())!==JSON.stringify(fullSchema)||db.prepare('PRAGMA user_version').get().user_version!==PINNED_PROVIDER_STATE_USER_VERSION)throw Error('Tracking database schema/version changed');
  integrity(db);db.exec('COMMIT');began=false;await stopped(capability,expectedSha256,'tracking-after-prepare');const bytes=changedRows?Buffer.from(db.serialize()):Buffer.from(input);if(bytes.length>64*1024*1024||bytes[18]!==1||bytes[19]!==1)throw Error('Unsupported tracking database output');
  return {bytes,receipt:{format:'aux.sqlite-subagent-tracking.v1',daemonSourceSha256:AUX_TRANSCRIPT_SOURCE_SHA256,sourceSha256:expectedSha256,outputSha256:sha(bytes),userVersion:PINNED_PROVIDER_STATE_USER_VERSION,targetSchemaSha256:sha(expectedSchema),changedRows,changedModels,unrelatedTablesVerified:names.filter(name=>name!=='sessions').length,preparedOnly:true,uncoveredReferences:['opaque result/details/prose','signed historical arguments','real startup/write fence']}};
 }catch(error){if(began)try{db.exec('ROLLBACK')}catch{}throw error}finally{db?.close();input.fill(0)}
}
