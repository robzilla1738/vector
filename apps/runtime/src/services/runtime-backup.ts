import {createHash,randomUUID} from 'node:crypto';
import {createReadStream,existsSync} from 'node:fs';
import {chmod,copyFile,lstat,mkdir,readFile,readdir,realpath,rename,rm,stat,writeFile} from 'node:fs/promises';
import {DatabaseSync} from 'node:sqlite';
import {dirname,isAbsolute,join,relative,resolve,sep} from 'node:path';
import {SCHEMA_VERSION} from '../store/db.js';
import type {Repo} from '../store/repo.js';
import {sanitizePortablePageRecall} from '@aux/contracts/portable-page-recall';
import {SENSITIVE_SQLITE_COLUMNS,protectedKvKey,protectedSqliteIdentity,type SqliteColumnCipher} from '../store/sqlite-protection.js';
import {minimizeLegacyObservationArtifacts,minimizedObservationArtifactBytes} from './observation-artifact-migration.js';
import {assertManagedRecoveryGeneration,ensureManagedRecoveryGeneration,type ManagedRecoveryGeneration} from './managed-recovery-generation.js';

const MAX_BACKUP_BYTES=2*1024*1024*1024,MAX_ARTIFACT_BYTES=1024*1024*1024,MAX_ARTIFACTS=10_000;
const BACKUP_PREFIX='aux-runtime-';
const RETENTION_KEY='backupRetentionKeep';
export const BACKUP_KEEP_OPTIONS=[3,5,10,20] as const;
export type BackupKeep=(typeof BACKUP_KEEP_OPTIONS)[number];
export function backupRetention(repo:Repo):{keep:BackupKeep}{
  const value=repo.getSetting<unknown>(RETENTION_KEY);
  return {keep:value===3||value===5||value===10||value===20?value:10};
}
export function setBackupRetention(repo:Repo,keep:BackupKeep){repo.setSetting(RETENTION_KEY,keep);return {keep};}
export async function listRuntimeBackups(dataDir:string){
  const backups=join(dataDir,'backups');let names:string[]=[];
  try{names=(await readdir(backups,{withFileTypes:true})).filter(item=>item.isDirectory()&&item.name.startsWith(BACKUP_PREFIX)).map(item=>item.name);}
  catch(error){if((error as NodeJS.ErrnoException).code!=='ENOENT')throw error;return [];}
  const listed:{path:string;name:string;createdAt:number;bytes:number;schemaVersion:number;sha256:string;artifactFiles:number;missingArtifacts:number}[]=[];
  for(const name of names.sort().reverse()){
    const root=join(backups,name);
    try{
      const manifest=await readManifest(root);
      const info=await stat(join(root,'state.sqlite'));
      listed.push({path:root,name,createdAt:manifest.createdAt,bytes:info.size+manifest.artifacts.reduce((sum,item)=>sum+item.bytes,0),schemaVersion:manifest.schemaVersion,sha256:manifest.database.sha256,artifactFiles:manifest.artifacts.length,missingArtifacts:manifest.missingArtifacts});
    }catch{/* Incomplete folders without a valid manifest are skipped. */}
  }
  return listed;
}
export async function deleteRuntimeBackup(dataDir:string,name:string,expectedSha256:string){
  if(!/^aux-runtime-[A-Za-z0-9._-]{1,160}$/.test(name))throw new Error('Choose a listed Aux backup.');
  const listed=(await listRuntimeBackups(dataDir)).find(item=>item.name===name&&item.sha256===expectedSha256);
  if(!listed)throw new Error('This backup changed or is no longer available. Refresh the list.');
  const info=await lstat(listed.path);
  if(info.isSymbolicLink()||!info.isDirectory())throw new Error('This backup folder is no longer valid.');
  await rm(listed.path,{recursive:true,force:false});
  return {deleted:true as const};
}
type ManifestArtifact={artifactId:string;relativePath:string;bytes:number;sha256:string};
type BackupManifest={formatVersion:1;createdAt:number;schemaVersion:number;database:{bytes:number;sha256:string};artifacts:ManifestArtifact[];missingArtifacts:number;recoveryGeneration?:ManagedRecoveryGeneration};

/** Authenticate every protected value before publishing a copy or pending restore. */
function authenticateProtectedCopy(db:DatabaseSync,cipher?:SqliteColumnCipher){
  const markers=db.prepare("SELECT key FROM aux_meta WHERE key LIKE 'protected_sqlite_v1:%'").all() as {key:string}[];
  if(!markers.length)return;
  if(!cipher)throw new Error('This protected backup requires the original Profile key or reviewed recovery.');
  const proof=db.prepare("SELECT value FROM aux_meta WHERE key='portable_profile_proof_v1'").get() as {value:string}|undefined;
  if(proof&&cipher.decrypt('aux_meta',JSON.stringify(['portable_profile_proof_v1']),'value',proof.value)!=='aux-portable-profile-v1')
    throw new Error('The protected backup belongs to another Profile.');
  for(const {key} of markers){
    const table=key.slice('protected_sqlite_v1:'.length);
    if(table==='kv_filtered'){
      for(const row of db.prepare('SELECT key,value FROM kv').all() as {key:string;value:string}[])
        if(protectedKvKey(row.key))cipher.decrypt('kv',JSON.stringify([row.key]),'value',row.value);
      continue;
    }
    const columns=SENSITIVE_SQLITE_COLUMNS[table];
    if(!columns||table==='kv')throw new Error('The backup contains an unknown protected storage plan.');
    const info=db.prepare(`PRAGMA table_info(${table})`).all() as {name:string;pk:number}[];
    const identity=protectedSqliteIdentity(table,info);
    if(!identity.length||columns.some(column=>!info.some(item=>item.name===column)))
      throw new Error('The protected backup schema is invalid.');
    const rows=db.prepare(`SELECT ${[...new Set([...identity,...columns])].join(',')} FROM ${table}`).all() as Record<string,unknown>[];
    for(const row of rows){
      const id=JSON.stringify(identity.map(column=>row[column]));
      for(const column of columns){
        const value=row[column];
        if(value===null||value===undefined)continue;
        if(typeof value!=='string')throw new Error('The protected backup contains a non-text value.');
        cipher.decrypt(table,id,column,value);
      }
    }
  }
}

async function digest(path:string){return new Promise<string>((ok,fail)=>{const hash=createHash('sha256'),stream=createReadStream(path);stream.on('data',chunk=>hash.update(chunk));stream.on('error',fail);stream.on('end',()=>ok(hash.digest('hex')));});}
function validateDatabase(path:string){const db=new DatabaseSync(path,{readOnly:true});try{const version=(db.prepare('PRAGMA user_version').get() as {user_version:number}).user_version;if(version<1||version>SCHEMA_VERSION)throw new Error(`This backup uses unsupported database schema ${version}.`);if(!db.prepare("SELECT 1 FROM sqlite_schema WHERE name='aux_meta'").get()||(db.prepare("SELECT value FROM aux_meta WHERE key='schema'").get() as {value:string}|undefined)?.value!=='aux')throw new Error('The selected file is not an Aux database.');const check=db.prepare('PRAGMA quick_check').get() as {'quick_check':string};if(check['quick_check']!=='ok')throw new Error('The selected backup failed SQLite integrity checking.');for(const table of ['kv','pages','runs','tasks','artifacts'])if(!db.prepare("SELECT 1 FROM sqlite_schema WHERE type='table' AND name=?").get(table))throw new Error(`The selected file is missing the ${table} table.`);if(db.prepare("SELECT 1 FROM sqlite_schema WHERE (type IN ('trigger','view') OR upper(coalesce(sql,'')) LIKE '%VIRTUAL TABLE%') AND name NOT LIKE 'history_fts%' LIMIT 1").get())throw new Error('The selected backup contains unsupported executable database schema.');return version;}finally{db.close();}}
function safeRelative(value:unknown){if(typeof value!=='string'||!value||value.length>1024||isAbsolute(value))throw new Error('The backup contains an invalid artifact path.');const normalized=value.replaceAll('\\','/');if(normalized.split('/').some(part=>!part||part==='.'||part==='..'))throw new Error('The backup contains an unsafe artifact path.');return normalized;}
async function readManifest(root:string):Promise<BackupManifest>{const path=join(root,'manifest.json'),info=await lstat(path);if(info.isSymbolicLink()||!info.isFile()||info.size>10*1024*1024)throw new Error('The backup manifest is invalid.');const value=JSON.parse(await import('node:fs/promises').then(fs=>fs.readFile(path,'utf8'))) as Partial<BackupManifest>;if(value.formatVersion!==1||typeof value.createdAt!=='number'||typeof value.schemaVersion!=='number'||!value.database||typeof value.database.bytes!=='number'||typeof value.database.sha256!=='string'||!Array.isArray(value.artifacts)||value.artifacts.length>MAX_ARTIFACTS||typeof value.missingArtifacts!=='number')throw new Error('This is not a supported Aux runtime backup.');const ids=new Set<string>(),paths=new Set<string>();for(const item of value.artifacts){if(!item||typeof item.artifactId!=='string'||!/^[A-Za-z0-9_-]{1,128}$/.test(item.artifactId)||typeof item.bytes!=='number'||item.bytes<0||typeof item.sha256!=='string'||!/^[a-f0-9]{64}$/.test(item.sha256))throw new Error('The backup manifest contains an invalid artifact.');const rel=safeRelative(item.relativePath);if(ids.has(item.artifactId)||paths.has(rel))throw new Error('The backup manifest repeats an artifact.');ids.add(item.artifactId);paths.add(rel);}return value as BackupManifest;}

export async function createRuntimeBackup(repo:Repo,dataDir:string,opts:{maxBackupBytes?:number;interrupt?:()=>void}={}){
  const maxBytes=opts.maxBackupBytes??MAX_BACKUP_BYTES,keep=backupRetention(repo).keep;
  const recoveryGeneration=ensureManagedRecoveryGeneration(dataDir);
  const backups=join(dataDir,'backups');await mkdir(backups,{recursive:true,mode:0o700});await mkdir(resolve(dataDir,'artifacts'),{recursive:true,mode:0o700});const createdAt=Date.now(),root=join(backups,`${BACKUP_PREFIX}${new Date(createdAt).toISOString().replace(/[:.]/g,'-')}-${randomUUID().slice(0,8)}`),database=join(root,'state.sqlite'),artifactRoot=await realpath(resolve(dataDir,'artifacts'));await mkdir(root,{recursive:true,mode:0o700});
  try{
    await minimizeLegacyObservationArtifacts(repo,artifactRoot);
    repo.db.prepare('VACUUM INTO ?').run(database);await chmod(database,0o600);const sanitized=new DatabaseSync(database);try{authenticateProtectedCopy(sanitized,repo.columnCipher);sanitized.prepare("DELETE FROM kv WHERE key='setting:gatewayApiKey'").run();sanitizePortablePageRecall(sanitized,repo.columnCipher);if(repo.columnCipher&&sanitized.prepare("SELECT 1 FROM aux_meta WHERE key LIKE 'protected_sqlite_v1:%' LIMIT 1").get())sanitized.prepare("INSERT INTO aux_meta(key,value) VALUES('portable_profile_proof_v1',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").run(repo.columnCipher.encrypt('aux_meta',JSON.stringify(['portable_profile_proof_v1']),'value','aux-portable-profile-v1'));sanitized.exec('VACUUM');}finally{sanitized.close();}opts.interrupt?.();const databaseInfo=await stat(database);if(!databaseInfo.isFile())throw new Error('The runtime database backup is invalid or exceeds 2 GB.');if(databaseInfo.size>maxBytes)throw new Error('Not enough free space for a complete runtime backup. Free disk space and try again.');const schemaVersion=validateDatabase(database);
    const snapshot=new DatabaseSync(database,{readOnly:true});let rows:{artifact_id:string;path:string}[];try{rows=snapshot.prepare("SELECT artifact_id,path FROM artifacts WHERE status='complete' ORDER BY created_at").all() as {artifact_id:string;path:string}[];}finally{snapshot.close();}if(rows.length>MAX_ARTIFACTS)throw new Error(`The runtime has more than ${MAX_ARTIFACTS} artifact records; remove old task data before creating a portable backup.`);const artifacts:ManifestArtifact[]=[];let missingArtifacts=0,totalBytes=databaseInfo.size,artifactBytes=0;
    for(const row of rows){try{const source=await realpath(row.path),rel=relative(artifactRoot,source);if(!rel||rel==='..'||rel.startsWith(`..${sep}`))throw new Error('outside artifact root');const info=await lstat(source);if(info.isSymbolicLink()||!info.isFile())throw new Error('not regular');if(artifactBytes+info.size>MAX_ARTIFACT_BYTES)throw new Error('Aux artifact backups are limited to 1 GB. Remove old artifacts and try again.');if(totalBytes+info.size>maxBytes)throw new Error('Not enough free space for a complete runtime backup. Free disk space and try again.');const relativePath=safeRelative(rel),target=join(root,'artifacts',relativePath);await mkdir(dirname(target),{recursive:true,mode:0o700});await copyFile(source,target);await chmod(target,0o600);artifacts.push({artifactId:row.artifact_id,relativePath,bytes:info.size,sha256:await digest(target)});artifactBytes+=info.size;totalBytes+=info.size;}catch(error){if(error instanceof Error&&(error.message.includes('limited to 1 GB')||error.message.includes('Not enough free space')))throw error;missingArtifacts++;}}
    assertManagedRecoveryGeneration(dataDir,recoveryGeneration);
    const manifest:BackupManifest={formatVersion:1,createdAt,schemaVersion,database:{bytes:databaseInfo.size,sha256:await digest(database)},artifacts,missingArtifacts,recoveryGeneration};await writeFile(join(root,'manifest.json'),JSON.stringify(manifest,null,2)+'\n',{encoding:'utf8',mode:0o600});const entries=(await readdir(backups,{withFileTypes:true})).filter(item=>item.isDirectory()&&item.name.startsWith(BACKUP_PREFIX)).map(item=>item.name).sort().reverse();for(const name of entries.slice(keep))await rm(join(backups,name),{recursive:true,force:true});return{path:root,createdAt,bytes:totalBytes,schemaVersion,sha256:manifest.database.sha256,artifactFiles:artifacts.length,missingArtifacts};
  }catch(error){await rm(root,{recursive:true,force:true});throw error;}
}

export async function stageRuntimeRestore(dataDir:string,sourcePath:string,cipher?:SqliteColumnCipher){
  const root=await realpath(sourcePath),rootInfo=await lstat(root);
  if(rootInfo.isSymbolicLink()||!rootInfo.isDirectory())throw new Error('Choose an Aux runtime backup folder.');
  const manifest=await readManifest(root),sourceDatabase=await realpath(join(root,'state.sqlite'));
  ensureManagedRecoveryGeneration(dataDir);
  assertManagedRecoveryGeneration(dataDir,manifest.recoveryGeneration,true);
  const databaseRel=relative(root,sourceDatabase);
  if(databaseRel==='..'||databaseRel.startsWith(`..${sep}`))throw new Error('The backup database escapes its folder.');
  const databaseInfo=await lstat(sourceDatabase);
  if(databaseInfo.isSymbolicLink()||!databaseInfo.isFile()||databaseInfo.size!==manifest.database.bytes||await digest(sourceDatabase)!==manifest.database.sha256)
    throw new Error('The backup database failed its integrity check.');
  const schemaVersion=validateDatabase(sourceDatabase);
  if(schemaVersion!==manifest.schemaVersion)throw new Error('The backup schema does not match its manifest.');

  const pendingDatabase=join(dataDir,'pending-runtime-restore.sqlite');
  const pendingArtifacts=join(dataDir,'pending-runtime-restore-artifacts');
  const temporaryDatabase=`${pendingDatabase}.${randomUUID()}.tmp`;
  const temporaryArtifacts=`${pendingArtifacts}.${randomUUID()}.tmp`;
  await mkdir(temporaryArtifacts,{recursive:true,mode:0o700});
  try{
    await copyFile(sourceDatabase,temporaryDatabase);
    await chmod(temporaryDatabase,0o600);
    const staged=new DatabaseSync(temporaryDatabase);
    let omittedArtifacts:Set<string>;
    let artifactRows:Map<string,{pageId:string|null;mediaType:string;path:string}>;
    try{
      authenticateProtectedCopy(staged,cipher);
      staged.prepare("DELETE FROM kv WHERE key='setting:gatewayApiKey'").run();
      omittedArtifacts=sanitizePortablePageRecall(staged,cipher);
      const rows=staged.prepare('SELECT artifact_id AS artifactId,page_id AS pageId,media_type AS mediaType,path FROM artifacts').all() as
        {artifactId:string;pageId:string|null;mediaType:string;path:string}[];
      artifactRows=new Map(rows.map(row=>[row.artifactId,row]));
    }finally{staged.close();}

    const portableArtifacts=manifest.artifacts.filter(item=>!omittedArtifacts.has(item.artifactId));
    const stagedArtifacts:ManifestArtifact[]=[];
    const stagedPaths=new Set<string>();
    let artifactBytes=0;
    for(const item of portableArtifacts){
      const rel=safeRelative(item.relativePath);
      const metadata=artifactRows.get(item.artifactId);
      if(!metadata)throw new Error(`Backup artifact ${item.artifactId} has no database record.`);
      const sourcePath=join(root,'artifacts',rel);
      const linkInfo=await lstat(sourcePath);
      if(linkInfo.isSymbolicLink())throw new Error(`Backup artifact ${item.artifactId} is a symbolic link.`);
      const source=await realpath(sourcePath),sourceRel=relative(join(root,'artifacts'),source);
      if(sourceRel==='..'||sourceRel.startsWith(`..${sep}`))throw new Error('A backup artifact escapes its folder.');
      const info=await lstat(source);
      if(!info.isFile()||info.size!==item.bytes||await digest(source)!==item.sha256)
        throw new Error(`Backup artifact ${item.artifactId} failed its integrity check.`);
      const evidencePath=/-observation-r\d+\.json$/.test(metadata.path)?metadata.path:rel;
      const candidate=metadata.mediaType==='application/json'&&/-observation-r\d+\.json$/.test(evidencePath);
      if(candidate&&info.size>4*1024*1024)throw new Error('An observation artifact is too large to minimize.');
      const original=candidate?await readFile(source):undefined;
      const minimized=original?minimizedObservationArtifactBytes({...metadata,path:evidencePath},original):undefined;
      const transformed=!!minimized&&!!original&&!minimized.equals(original);
      const bytes=minimized?.length??info.size;
      artifactBytes+=bytes;
      if(artifactBytes>MAX_ARTIFACT_BYTES)throw new Error('Aux artifact restores are limited to 1 GB.');
      const stagedDigest=minimized?createHash('sha256').update(minimized).digest('hex'):item.sha256;
      let targetRel=rel;
      const current=join(dataDir,'artifacts',rel);
      try{
        const currentInfo=await lstat(current);
        if(currentInfo.isSymbolicLink()||!currentInfo.isFile())throw new Error(`Artifact ${item.artifactId} conflicts with existing Aux data.`);
        const currentDigest=await digest(current);
        if(currentInfo.size!==bytes||currentDigest!==stagedDigest){
          if(!transformed||currentInfo.size!==item.bytes||currentDigest!==item.sha256)
            throw new Error(`Artifact ${item.artifactId} conflicts with existing Aux data.`);
          // Preserve the current profile's file for its recovery snapshot.
          targetRel=safeRelative(join(dirname(rel),`${item.artifactId}-minimized-observation.json`));
        }
      }catch(error){if((error as NodeJS.ErrnoException).code!=='ENOENT')throw error;}
      const targetCurrent=join(dataDir,'artifacts',targetRel);
      try{
        const existing=await lstat(targetCurrent);
        if(existing.isSymbolicLink()||!existing.isFile()||existing.size!==bytes||await digest(targetCurrent)!==stagedDigest)
          throw new Error(`Artifact ${item.artifactId} conflicts with existing Aux data.`);
      }catch(error){if((error as NodeJS.ErrnoException).code!=='ENOENT')throw error;}
      if(stagedPaths.has(targetRel))throw new Error('The backup maps multiple artifacts to one restored file.');
      stagedPaths.add(targetRel);
      const target=join(temporaryArtifacts,targetRel);
      await mkdir(dirname(target),{recursive:true,mode:0o700});
      if(minimized)await writeFile(target,minimized,{mode:0o600});else await copyFile(source,target);
      await chmod(target,0o600);
      const stagedItem:ManifestArtifact={artifactId:item.artifactId,relativePath:targetRel,bytes,sha256:await digest(target)};
      stagedArtifacts.push(stagedItem);
    }

    const prepared=new DatabaseSync(temporaryDatabase);
    try{
      const included=new Set(stagedArtifacts.map(item=>item.artifactId));
      const update=prepared.prepare("UPDATE artifacts SET path=?,size=?,status='complete' WHERE artifact_id=?");
      const missing=prepared.prepare("UPDATE artifacts SET path=?,status='failed' WHERE artifact_id=?");
      for(const item of stagedArtifacts)update.run(join(dataDir,'artifacts',item.relativePath),item.bytes,item.artifactId);
      for(const row of prepared.prepare('SELECT artifact_id FROM artifacts').all() as {artifact_id:string}[])
        if(!included.has(row.artifact_id))missing.run(join(dataDir,'artifacts','missing',row.artifact_id),row.artifact_id);
      prepared.exec('VACUUM');
    }finally{prepared.close();}
    const stagedInfo=await stat(temporaryDatabase),sha256=await digest(temporaryDatabase);
    await rm(pendingArtifacts,{recursive:true,force:true});
    await rename(temporaryArtifacts,pendingArtifacts);
    await rename(temporaryDatabase,pendingDatabase);
    const recoveryGeneration=assertManagedRecoveryGeneration(dataDir,manifest.recoveryGeneration,true);
    await writeFile(join(dataDir,'pending-runtime-restore.json'),JSON.stringify({version:2,createdAt:Date.now(),schemaVersion,
      bytes:stagedInfo.size,sha256,artifactFiles:stagedArtifacts,
      recoveryGeneration},null,2)+'\n',{encoding:'utf8',mode:0o600});
    return{staged:true as const,schemaVersion,bytes:stagedInfo.size+artifactBytes,sha256,
      artifactFiles:stagedArtifacts.length,missingArtifacts:manifest.missingArtifacts};
  }catch(error){await Promise.all([rm(temporaryDatabase,{force:true}),rm(temporaryArtifacts,{recursive:true,force:true})]);throw error;}
}

export async function cancelRuntimeRestore(dataDir:string){await Promise.all([rm(join(dataDir,'pending-runtime-restore.sqlite'),{force:true}),rm(join(dataDir,'pending-runtime-restore-artifacts'),{recursive:true,force:true}),rm(join(dataDir,'pending-runtime-restore-space-memory'),{recursive:true,force:true}),rm(join(dataDir,'pending-runtime-restore.json'),{force:true})]);return{cancelled:true as const};}

type PendingRestore={version:2;createdAt:number;schemaVersion:number;bytes:number;sha256:string;artifactFiles:ManifestArtifact[];recoveryGeneration?:ManagedRecoveryGeneration;
  recoveryPackage?:boolean;recoveryProfileId?:string;spaceMemoryFiles?:{relativePath:string;bytes:number;sha256:string}[]};

export async function runtimeRestoreStatus(dataDir:string){
  let lastAppliedAt:number|undefined;
  try{
    const value=JSON.parse(await readFile(join(dataDir,'runtime-restore-status.json'),'utf8')) as {lastAppliedAt?:unknown};
    if(typeof value.lastAppliedAt==='number'&&Number.isFinite(value.lastAppliedAt))lastAppliedAt=value.lastAppliedAt;
  }catch(error){if((error as NodeJS.ErrnoException).code!=='ENOENT')throw error;}
  return{pending:existsSync(join(dataDir,'pending-runtime-restore.json')),...(lastAppliedAt?{lastAppliedAt}:{})};
}

/** Apply a user-staged restore before opening the runtime's active database. */
export async function applyPendingRuntimeRestore(dataDir:string,dbPath:string,profileId?:string){
  const metadataPath=join(dataDir,'pending-runtime-restore.json');
  if(!existsSync(metadataPath))return{applied:false as const};
  // A separate SQLite database provides a cross-process startup lock, released
  // by the OS on crash. Never swap a database while another runtime owns it.
  const lockPath=join(dataDir,'runtime-restore-lock.sqlite');
  const lock=new DatabaseSync(lockPath);
  try{
    await chmod(lockPath,0o600);
    lock.exec('PRAGMA busy_timeout=5000; BEGIN EXCLUSIVE');
    if(!existsSync(metadataPath))return{applied:false as const};
    const descriptorPath=join(dataDir,'runtime.json');
    try{
      const descriptor=JSON.parse(await readFile(descriptorPath,'utf8')) as {pid?:unknown};
      if(Number.isInteger(descriptor.pid)&&Number(descriptor.pid)>0){
        try{process.kill(Number(descriptor.pid),0);throw new Error('Quit the running Aux runtime before applying a staged restore.');}
        catch(error){if((error as NodeJS.ErrnoException).code!=='ESRCH')throw error;}
      }
    }catch(error){if((error as NodeJS.ErrnoException).code!=='ENOENT')throw error;}
    const metadata=JSON.parse(await readFile(metadataPath,'utf8')) as Partial<PendingRestore>;
    if(metadata.version!==2||!Number.isInteger(metadata.createdAt)||!Number.isInteger(metadata.schemaVersion)||
      !Number.isInteger(metadata.bytes)||typeof metadata.sha256!=='string'||!/^[a-f0-9]{64}$/.test(metadata.sha256)||
      !Array.isArray(metadata.artifactFiles)||metadata.artifactFiles.length>MAX_ARTIFACTS)
      throw new Error('The staged runtime restore metadata is invalid.');
    if(metadata.recoveryPackage){
      if(!profileId||metadata.recoveryProfileId!==profileId||!Array.isArray(metadata.spaceMemoryFiles)||metadata.spaceMemoryFiles.length>20_000)
        throw new Error('The staged recovery Profile or Space-memory inventory is invalid.');
      if(existsSync(dbPath)&&await digest(dbPath)!==metadata.sha256){
        const current=new DatabaseSync(dbPath,{readOnly:true});
        try{for(const table of ['workspaces','runs','artifacts','content_memory'])
          if(current.prepare(`SELECT 1 FROM ${table} LIMIT 1`).get())throw new Error('The recovery destination is no longer empty.');}
        finally{current.close();}
      }
    }else assertManagedRecoveryGeneration(dataDir,metadata.recoveryGeneration);
    const pendingDatabase=join(dataDir,'pending-runtime-restore.sqlite');
    const dbInfo=await lstat(pendingDatabase);
    if(dbInfo.isSymbolicLink()||!dbInfo.isFile()||dbInfo.size!==metadata.bytes||await digest(pendingDatabase)!==metadata.sha256||
      validateDatabase(pendingDatabase)!==metadata.schemaVersion)
      throw new Error('The staged runtime database failed validation.');
    const alreadySwapped=existsSync(dbPath)&&await digest(dbPath)===metadata.sha256;
    const stagedRoot=join(dataDir,'pending-runtime-restore-artifacts');
    const artifactRoot=join(dataDir,'artifacts');
    await mkdir(artifactRoot,{recursive:true,mode:0o700});
    const stagedRootInfo=await lstat(stagedRoot);
    if(stagedRootInfo.isSymbolicLink()||!stagedRootInfo.isDirectory())throw new Error('The staged artifact folder is invalid.');
    if((await lstat(artifactRoot)).isSymbolicLink())throw new Error('The Aux artifact folder is a symbolic link.');
    const resolvedStagedRoot=await realpath(stagedRoot),resolvedArtifactRoot=await realpath(artifactRoot);
    const stagedMemoryRoot=join(dataDir,'pending-runtime-restore-space-memory');
    const memoryRoot=join(dataDir,'space-memory');
    if(metadata.recoveryPackage){
      const rootInfo=await lstat(stagedMemoryRoot);
      if(rootInfo.isSymbolicLink()||!rootInfo.isDirectory())throw new Error('The staged Space memory is invalid.');
      await mkdir(memoryRoot,{recursive:true,mode:0o700});
      if((await lstat(memoryRoot)).isSymbolicLink())throw new Error('The destination Space memory is unsafe.');
      const resolvedMemoryRoot=await realpath(stagedMemoryRoot);
      const paths=new Set<string>();
      for(const item of metadata.spaceMemoryFiles!){
        if(!item||!Number.isInteger(item.bytes)||item.bytes<0||typeof item.sha256!=='string'||!/^[a-f0-9]{64}$/.test(item.sha256))
          throw new Error('The staged Space-memory inventory is invalid.');
        const rel=safeRelative(item.relativePath);
        if(paths.has(rel))throw new Error('The staged Space memory repeats a file.');
        paths.add(rel);
        const source=join(stagedMemoryRoot,rel),info=await lstat(source),resolved=await realpath(source);
        if(info.isSymbolicLink()||relative(resolvedMemoryRoot,resolved).startsWith('..')||
          !info.isFile()||info.size!==item.bytes||await digest(source)!==item.sha256)
          throw new Error('A staged Space-memory file failed validation.');
        const target=join(memoryRoot,rel);
        try{const existing=await lstat(target);
          if(existing.isSymbolicLink()||!existing.isFile()||existing.size!==item.bytes||await digest(target)!==item.sha256)
            throw new Error('Recovery Space memory conflicts with destination data.');
        }catch(error){if((error as NodeJS.ErrnoException).code!=='ENOENT')throw error;}
      }
    }
    const ids=new Set<string>(),paths=new Set<string>();
    for(const item of metadata.artifactFiles){
      if(!item||typeof item.artifactId!=='string'||!/^[A-Za-z0-9_-]{1,128}$/.test(item.artifactId)||
        !Number.isInteger(item.bytes)||item.bytes<0||typeof item.sha256!=='string'||!/^[a-f0-9]{64}$/.test(item.sha256))
        throw new Error('The staged restore has invalid artifact metadata.');
      const rel=safeRelative(item.relativePath);
      if(ids.has(item.artifactId)||paths.has(rel))throw new Error('The staged restore repeats an artifact.');
      ids.add(item.artifactId);paths.add(rel);
      const source=join(stagedRoot,rel),sourceInfo=await lstat(source),resolved=await realpath(source);
      if(sourceInfo.isSymbolicLink()||relative(resolvedStagedRoot,resolved).startsWith('..')||
        !sourceInfo.isFile()||sourceInfo.size!==item.bytes||await digest(source)!==item.sha256)
        throw new Error(`Staged artifact ${item.artifactId} failed validation.`);
      const target=join(artifactRoot,rel);
      await mkdir(dirname(target),{recursive:true,mode:0o700});
      const parent=await realpath(dirname(target));
      if(relative(resolvedArtifactRoot,parent).startsWith('..'))throw new Error('An artifact destination escapes Aux storage.');
      try{
        const current=await lstat(target);
        if(current.isSymbolicLink()||!current.isFile()||current.size!==item.bytes||await digest(target)!==item.sha256)
          throw new Error(`Artifact ${item.artifactId} conflicts with existing Aux data.`);
      }catch(error){if((error as NodeJS.ErrnoException).code!=='ENOENT')throw error;}
    }
    // A crash after the atomic database swap can leave the pending marker.
    // All artifacts must still be present before that marker is retired.
    if(alreadySwapped){
      for(const item of metadata.artifactFiles)
        if(!existsSync(join(artifactRoot,safeRelative(item.relativePath))))
          throw new Error(`Restored artifact ${item.artifactId} is missing.`);
      for(const item of metadata.spaceMemoryFiles??[])
        if(!existsSync(join(memoryRoot,safeRelative(item.relativePath))))
          throw new Error('Restored Space memory is missing.');
      await finishRestore(dataDir,Date.now());
      return{applied:true as const,recovered:true as const};
    }
    const recoveryRoot=join(dataDir,'recovery',`runtime-${new Date().toISOString().replace(/[:.]/g,'-')}-${randomUUID()}`);
    await mkdir(recoveryRoot,{recursive:true,mode:0o700});
    if(existsSync(dbPath)){
      const previous=new DatabaseSync(dbPath);
      try{
        previous.exec('PRAGMA wal_checkpoint(TRUNCATE)');
        previous.prepare('VACUUM INTO ?').run(join(recoveryRoot,'state.sqlite'));
      }finally{previous.close();}
      await chmod(join(recoveryRoot,'state.sqlite'),0o600);
    }
    for(const item of metadata.artifactFiles){
      const target=join(artifactRoot,safeRelative(item.relativePath));
      if(existsSync(target))continue;
      const temporary=`${target}.${randomUUID()}.tmp`;
      try{
        await copyFile(join(stagedRoot,item.relativePath),temporary);
        await chmod(temporary,0o600);
        if(await digest(temporary)!==item.sha256)throw new Error(`Artifact ${item.artifactId} changed during restore.`);
        await rename(temporary,target);
      }finally{await rm(temporary,{force:true});}
    }
    for(const item of metadata.spaceMemoryFiles??[]){
      const rel=safeRelative(item.relativePath),target=join(memoryRoot,rel);
      if(existsSync(target))continue;
      await mkdir(dirname(target),{recursive:true,mode:0o700});
      const parent=await realpath(dirname(target));
      if(relative(await realpath(memoryRoot),parent).startsWith('..'))throw new Error('Space-memory destination escapes Aux storage.');
      const temporary=`${target}.${randomUUID()}.tmp`;
      try{await copyFile(join(stagedMemoryRoot,rel),temporary);await chmod(temporary,0o600);
        if(await digest(temporary)!==item.sha256)throw new Error('Space memory changed during recovery.');
        await rename(temporary,target);
      }finally{await rm(temporary,{force:true});}
    }
    const temporaryDatabase=`${dbPath}.${randomUUID()}.restore`;
    try{
      await copyFile(pendingDatabase,temporaryDatabase);
      await chmod(temporaryDatabase,0o600);
      if(await digest(temporaryDatabase)!==metadata.sha256)throw new Error('The staged database changed during restore.');
      await Promise.all([rm(`${dbPath}-wal`,{force:true}),rm(`${dbPath}-shm`,{force:true})]);
      await rename(temporaryDatabase,dbPath);
    }finally{await rm(temporaryDatabase,{force:true});}
    await finishRestore(dataDir,Date.now());
    return{applied:true as const,recoveryPath:recoveryRoot};
  }finally{
    try{lock.exec('ROLLBACK');}catch{/* No transaction after a failed BEGIN. */}
    lock.close();
  }
}

async function finishRestore(dataDir:string,lastAppliedAt:number){
  const status=join(dataDir,'runtime-restore-status.json');
  await writeFile(status,JSON.stringify({lastAppliedAt})+'\n',{mode:0o600});
  await cancelRuntimeRestore(dataDir);
}
