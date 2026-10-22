/** Inactive source patch: preserves supplied local file preparation and session authorization. */
export const cloudAttachmentHelpers = String.raw`
var auxCloudAttachmentRestores;
function auxCloudStoredAttachmentPath(value){if(typeof value!=='string')return null;const path=value.replace(/^\.\//,'');return/^attachments\/[^/\\\0]+$/.test(path)&&!['.','..'].includes(path.slice(12))?path:null;}
function auxCloudAttachmentIdentity(accountId,session){const account=AccountRegistry.getAccount(accountId),auth=AccountRegistry.getSession(accountId);return isSyncEnabled(accountId)&&!session.incognito&&!session.ephemeral&&account?.userId&&auth?JSON.stringify([accountId,account.userId,account.createdAt,session.id]):null;}
function auxCloudCheckAttachmentIdentity(accountId,session,identity){if(!identity||auxCloudAttachmentIdentity(accountId,session)!==identity)throw Error('Account changed during cloud attachment transfer.');}
async function auxCloudAttachmentJSON(accountId,route,method,body){const response=await fetchAsideAPIAuthenticatedRequest(accountId,route,{method,headers:body===void 0?void 0:{'content-type':'application/json'},body:body===void 0?void 0:JSON.stringify(body),fallbackErrorMessage:'Aux cloud attachment operation failed'});return response.json();}
async function auxCloudUploadBytes(accountId,bytes,name,mimeType,purpose){
  if(bytes.length>100*1024*1024)throw Error('Cloud attachment exceeds 100 MiB.');
  const intent=await auxCloudAttachmentJSON(accountId,'/attachments/intents','POST',{name,contentType:mimeType,size:bytes.length,sha256:sha256Hex(bytes),purpose});
  if(typeof intent.id!=='string'||!/^[a-f0-9-]{36}$/.test(intent.id))throw Error('Invalid cloud attachment intent.');
  const upload=await auxCloudAttachmentJSON(accountId,'/attachments/'+intent.id+'/upload-url','POST');
  const url=new URL(upload.url);
  if(url.protocol!=='https:'||url.username||url.password||!(url.hostname==='blob.vercel-storage.com'||url.hostname.endsWith('.blob.vercel-storage.com')))throw Error('Invalid private attachment upload origin.');
  const response=await fetch(url,{method:'PUT',headers:{'content-type':mimeType},body:bytes,redirect:'error',signal:AbortSignal.timeout(120000)});
  if(!response.ok)throw Error('Private attachment upload failed ('+response.status+').');
  const committed=await auxCloudAttachmentJSON(accountId,'/attachments/'+intent.id+'/commit','POST');
  if(committed.id!==intent.id||committed.sha256!==sha256Hex(bytes)||committed.size!==bytes.length)throw Error('Private attachment commit failed integrity verification.');
  return committed;
}
async function auxCloudBackupAttachment(accountId,session,attachment){
  const identity=auxCloudAttachmentIdentity(accountId,session),localPath=auxCloudStoredAttachmentPath(attachment.path);if(!identity||!localPath)return;
  const resolved=await resolveSessionFile(accountId,session,localPath,{auxRestoreAttempted:true});
  if(resolved.fileStat.size>100*1024*1024)throw Error('Cloud attachment exceeds 100 MiB.');
  const fs=await import('node:fs/promises'),bytes=await fs.readFile(resolved.filePath);
  auxCloudCheckAttachmentIdentity(accountId,session,identity);
  const supported=new Set(['application/octet-stream','application/pdf','application/json','text/plain','text/markdown','text/csv','image/png','image/jpeg','image/webp','image/gif','audio/mpeg','audio/wav','audio/webm']);
  const mime=supported.has(attachment.mimeType)?attachment.mimeType:'application/octet-stream';
  const uploaded=await auxCloudUploadBytes(accountId,bytes,attachment.name,mime,'attachment');
  auxCloudCheckAttachmentIdentity(accountId,session,identity);
  await auxCloudAttachmentJSON(accountId,'/attachment-sessions/'+encodeURIComponent(session.id)+'/files','PUT',{localPath,attachmentId:attachment.id,blobId:uploaded.id});
}
async function auxCloudRestoreAttachment(accountId,session,requestedPath){
  const identity=auxCloudAttachmentIdentity(accountId,session),localPath=auxCloudStoredAttachmentPath(requestedPath);if(!identity||!localPath)return null;
  auxCloudAttachmentRestores??=new Map;const stamp=JSON.stringify([identity,localPath]);if(auxCloudAttachmentRestores.has(stamp))return auxCloudAttachmentRestores.get(stamp);
  const operation=(async()=>{
    let record;try{record=await auxCloudAttachmentJSON(accountId,'/attachment-sessions/'+encodeURIComponent(session.id)+'/files?path='+encodeURIComponent(localPath),'GET');}catch(error){if(error instanceof AsideApiError&&error.status===404)return null;throw error;}
    if(record.localPath!==localPath||typeof record.id!=='string'||!/^[a-f0-9-]{36}$/.test(record.id)||typeof record.attachmentId!=='string'||!Number.isSafeInteger(record.size)||record.size<0||record.size>100*1024*1024||!/^[a-f0-9]{64}$/.test(record.sha256))throw Error('Invalid private attachment backup metadata.');
    const response=await fetchAsideAPIAuthenticatedRequest(accountId,'/attachments/'+record.id+'/content',{method:'GET',timeoutMs:120000,fallbackErrorMessage:'Failed to recover private attachment'}),reader=response.body?.getReader(),chunks=[];let size=0;if(!reader)throw Error('Private attachment body missing.');
    try{for(;;){const next=await reader.read();if(next.done)break;size+=next.value.byteLength;if(size>record.size){await reader.cancel();throw Error('Private attachment exceeds declared size.');}chunks.push(Buffer.from(next.value));}}finally{reader.releaseLock();}
    const bytes=Buffer.concat(chunks);if(size!==record.size||sha256Hex(bytes)!==record.sha256)throw Error('Private attachment recovery integrity check failed.');
    auxCloudCheckAttachmentIdentity(accountId,session,identity);
    // Reuse the supplied authorized attachment writer, which chooses a safe basename and
    // creates exclusively. No server path is passed as a filesystem destination.
    const fs=await import('node:fs/promises'),paths=await import('node:path'),root=getSessionStorageDir(session,accountId);
    const rootStat=await fs.lstat(root);if(rootStat.isSymbolicLink()||!rootStat.isDirectory())throw Error('Attachment recovery requires an existing real session directory.');
    const directory=paths.join(root,'attachments');let directoryStat;try{directoryStat=await fs.lstat(directory);}catch(error){if(error.code!=='ENOENT')throw error;}
    if(directoryStat&&(directoryStat.isSymbolicLink()||!directoryStat.isDirectory()))throw Error('Attachment recovery refuses redirected attachment directories.');
    if(directoryStat){const realRoot=await fs.realpath(root),realDirectory=await fs.realpath(directory);if(paths.dirname(realDirectory)!==realRoot)throw Error('Attachment recovery escapes the session directory.');}
    const restored=await prepareFileAttachment(root,{id:record.attachmentId,type:'file',name:localPath.slice(12),mimeType:record.mimeType||'application/octet-stream',data:bytes.toString('base64')});
    auxCloudCheckAttachmentIdentity(accountId,session,identity);
    return restored.path;
  })();auxCloudAttachmentRestores.set(stamp,operation);
  try{return await operation;}finally{auxCloudAttachmentRestores.delete(stamp);}
}
async function auxCloudForgetAttachment(accountId,session,requestedPath){const identity=auxCloudAttachmentIdentity(accountId,session),localPath=auxCloudStoredAttachmentPath(requestedPath);if(!identity||!localPath)return;await auxCloudAttachmentJSON(accountId,'/attachment-sessions/'+encodeURIComponent(session.id)+'/files?path='+encodeURIComponent(localPath),'DELETE');auxCloudCheckAttachmentIdentity(accountId,session,identity);}
async function auxCloudPublishLargeSession(accountId,session,messages){
  const body={sourceSessionId:session.id,title:session.title?.trim()||'Untitled session',messages:toSharedSessionMessages(messages)},bytes=Buffer.from(JSON.stringify(body));
  if(bytes.length>50000000)throw Error('Shared transcript exceeds 50 MB.');
  const result=await auxCloudUploadBytes(accountId,bytes,'shared-session.json','application/json','share');
  const shared=sharedSessionLinkSchema.parse(result.share);return toSharedSessionLink(shared.id);
}
`;

export function applyCloudAttachmentAdapter(source) {
  let text = source;
  const anchors = [];
  const edit = (find, replace, count = 1) => {
    if (text.split(find).length - 1 !== count) throw new Error(`Cloud attachment adapter anchor changed: ${find.slice(0, 100)}`);
    text = text.split(find).join(replace);
    anchors.push({ find, replace, count, kind: 'integration' });
  };
  edit('async function publishSharedSession(Cn,ei,ti){let ni=', `${cloudAttachmentHelpers}\nasync function publishSharedSession(Cn,ei,ti){if(Buffer.byteLength(JSON.stringify({sourceSessionId:ei.id,title:ei.title?.trim()||'Untitled session',messages:toSharedSessionMessages(ti)}))>3500000)return auxCloudPublishLargeSession(Cn,ei,ti);let ni=`);
  edit('if(!ti.path)throw new TRPCError({code:`INTERNAL_SERVER_ERROR`,message:`Attachment upload did not return a path`});return{...ti,path:ti.path}', 'if(!ti.path)throw new TRPCError({code:`INTERNAL_SERVER_ERROR`,message:`Attachment upload did not return a path`});await auxCloudBackupAttachment(Cn.accountId,Cn.session,ti).catch(error=>logger.warn(`[Aux cloud] Attachment remains local; backup failed`,{accountId:Cn.accountId,sessionId:Cn.session.id}));return{...ti,path:ti.path}');
  edit('async function resolveSessionFile(Cn,ei,ti,ni={}){let ri=', 'async function resolveSessionFile(Cn,ei,ti,ni={}){if(!ni.auxRestoreAttempted&&auxCloudStoredAttachmentPath(ti)){const fs=await import("node:fs/promises");let missing=false;try{await fs.access(resolve(getSessionStorageDir(ei,Cn),ti));}catch(error){if(error.code==="ENOENT")missing=true;else throw error;}if(missing){const restored=await auxCloudRestoreAttachment(Cn,ei,ti);if(restored)return resolveSessionFile(Cn,ei,restored,{...ni,auxRestoreAttempted:true});}}let ri=');
  edit('await rm(ti.filePath,{recursive:!0,force:!0})})}),update:', 'await auxCloudForgetAttachment(Cn.accountId,Cn.session,ei.path);await rm(ti.filePath,{recursive:!0,force:!0})})}),update:');
  return { text, anchors };
}
