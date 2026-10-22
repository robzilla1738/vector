/** Actual pinned1852 per-file Drive implementation. Archival object/head adapter is separate. */
import { cloudSyncHelpers } from './cloud-sync-adapter.mjs';
export const cloudDrive1852OriginalSourceSha256 = '5e35dfa1eb76d4614246f954b652fd505e271a0b3f1ac3168132fb8bc03814f5';
export function cloudDrive1852Helpers(branding = 'aside') {
  const context = cloudSyncHelpers.slice(0, cloudSyncHelpers.indexOf('async function auxCloudReadHead('));
  const decrypt = cloudSyncHelpers.slice(cloudSyncHelpers.indexOf('async function auxCloudDecryptFile(')).replace("'/sync/agent-files/objects/'+entry.objectSha256", "'/drive/files?path='+encodeURIComponent(path)");
  let helpers = context + String.raw`
async function auxCloudDriveReadHead(accountId,head){const context=await auxCloudFileContext(accountId);try{if(head?.formatVersion!==2||!Array.isArray(head.files)||head.files.length>1000)throw Error('Invalid encrypted Drive head.');const paths=new Set;for(const entry of head.files){if(!entry.path||!isValidAgentFilePath(entry.path)||paths.has(entry.path)||entry.encryption!=='aes-256-gcm'||entry.generation!==context.generation||!/^[a-f0-9]{64}$/.test(entry.sha256)||!/^[a-f0-9]{64}$/.test(entry.objectSha256)||!Number.isSafeInteger(entry.size)||entry.size<0||entry.size>2097152||!Number.isSafeInteger(entry.objectSize)||entry.objectSize<0||entry.objectSize>3145728)throw Error('Invalid encrypted Drive metadata.');paths.add(entry.path);context.objects.set(auxCloudFileMapKey(entry.path,entry.sha256),entry);context.objects.set('drive-path:'+entry.path,entry);}return agentFileHeadSchema.parse(head);}finally{context.key.fill(0);}}
async function auxCloudDriveHasCache(accountId){const context=await auxCloudFileContext(accountId);try{return context.objects.size>0;}finally{context.key.fill(0);}}
async function auxCloudDriveUpload(accountId,path,bytes){const encrypted=await auxCloudEncryptFile(accountId,sha256Hex(bytes),bytes,path);return Buffer.from(JSON.stringify({entry:encrypted.entry,object:encrypted.bytes.toString('base64')}));}
async function auxCloudDriveDownload(accountId,path){const context=await auxCloudFileContext(accountId);let entry;try{entry=context.objects.get('drive-path:'+path);if(!entry)throw Error('Refresh the Drive head before downloading.');}finally{context.key.fill(0);}return auxCloudDecryptFile(accountId,entry.sha256,path);}
` + decrypt;
  if (branding === 'aux') helpers = helpers.replaceAll('fetchAsideAPIAuthenticatedRequest', 'fetchAuxAPIAuthenticatedRequest');
  else if (branding !== 'aside') throw Error('Unknown Drive branding');
  return helpers;
}
export function applyCloudDrive1852Adapter(source,{branding='aside'}={}) {
  let text=source;const anchors=[];const edit=(find,replace)=>{if(text.split(find).length-1!==1)throw Error('1852 Drive anchor changed: '+find.slice(0,100));text=text.replace(find,replace);anchors.push({find,replace,count:1,kind:'integration'});};
  const api=branding==='aux'?'fetchAuxAPIAuthenticatedRequest':'fetchAsideAPIAuthenticatedRequest';
  edit('function requireEtag(Cn){', cloudDrive1852Helpers(branding)+'\nfunction requireEtag(Cn){');
  edit('async function getRemoteHead(Cn,ei){try{let ti={};','async function getRemoteHead(Cn,ei){if(!await auxCloudDriveHasCache(Cn))ei=void 0;try{let ti={};');
  edit('head:agentFileHeadSchema.parse(await ni.json())','head:await auxCloudDriveReadHead(Cn,await ni.json())');
  edit('async function putRemoteObject(Cn,ei,ti,ni){let ri;','async function putRemoteObject(Cn,ei,ti,ni){ti=await auxCloudDriveUpload(Cn,ei,ti);let ri;');
  edit('headers:{"content-type":`application/octet-stream`,...ni?{"If-Match":`"${ni}"`}:{"If-None-Match":`*`}},body:Buffer.from(ti),fallbackErrorMessage:`Failed to upload drive file`}', 'headers:{"content-type":`application/json`,...ni?{"X-Aux-If-Match":`"${ni}"`}:{"X-Aux-If-None-Match":`*`}},body:Buffer.from(ti),fallbackErrorMessage:`Failed to upload drive file`}');
  edit('headers:{"If-Match":`"${ti}"`},fallbackErrorMessage:`Failed to delete drive file`}', 'headers:{"X-Aux-If-Match":`"${ti}"`},fallbackErrorMessage:`Failed to delete drive file`}');
  edit('async function getRemoteObject(Cn,ei){let ti=await '+api+'(Cn,`/drive/files?path=${encodeURIComponent(ei)}`,{method:`GET`,fallbackErrorMessage:`Failed to download agent file object`});return new Uint8Array(await ti.arrayBuffer())}','async function getRemoteObject(Cn,ei){return auxCloudDriveDownload(Cn,ei)}');
  return{text,anchors};
}
