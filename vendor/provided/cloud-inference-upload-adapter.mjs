/** Transport-only patch for the actual shipped1852 daemon. The supplied UI stays intact. */
export const cloudInferenceUploadHelpers = String.raw`
function auxInferenceIdentity(accountId){const account=AccountRegistry.getAccount(accountId);if(!account?.userId||!AccountRegistry.getSession(accountId))throw Error('Sign in to Aux before using hosted inference.');return JSON.stringify([accountId,account.userId,account.createdAt]);}
function auxInferenceCheck(accountId,identity){if(auxInferenceIdentity(accountId)!==identity)throw Error('Account changed during inference upload.');}
async function auxInferenceJSON(accountId,route,method,body,signal){const response=await fetchAuxAPIAuthenticatedRequest(accountId,route,{method,headers:body===void 0?void 0:{'content-type':'application/json'},body:body===void 0?void 0:JSON.stringify(body),signal,timeoutMs:120000,fallbackErrorMessage:'Aux private inference upload failed.'});return response.json();}
async function auxInferenceUpload(accountId,identity,bytes,mimeType,ids,signal){
 if(bytes.length<1||bytes.length>20*1024*1024)throw Error('Inference input must be 20 MiB or smaller.');
 auxInferenceCheck(accountId,identity);signal?.throwIfAborted();
 const hash=sha256Hex(bytes),intent=await auxInferenceJSON(accountId,'/attachments/intents','POST',{name:'inference-input',contentType:mimeType,size:bytes.length,sha256:hash,purpose:'inference'},signal);
 if(typeof intent.id!=='string'||!/^[a-f0-9-]{36}$/.test(intent.id))throw Error('Invalid private inference intent.');
 ids.push(intent.id);auxInferenceCheck(accountId,identity);
 const upload=await auxInferenceJSON(accountId,'/attachments/'+intent.id+'/upload-url','POST',void 0,signal),url=new URL(upload.url);
 if(url.protocol!=='https:'||url.username||url.password||!(url.hostname==='blob.vercel-storage.com'||url.hostname.endsWith('.blob.vercel-storage.com')))throw Error('Invalid private inference upload origin.');
 auxInferenceCheck(accountId,identity);signal?.throwIfAborted();
 const response=await fetch(url,{method:'PUT',headers:{'content-type':mimeType},body:bytes,redirect:'error',signal:signal?AbortSignal.any([signal,AbortSignal.timeout(120000)]):AbortSignal.timeout(120000)});
 if(!response.ok)throw Error('Private inference upload failed ('+response.status+').');
 auxInferenceCheck(accountId,identity);
 const committed=await auxInferenceJSON(accountId,'/attachments/'+intent.id+'/commit','POST',void 0,signal);
 if(committed.id!==intent.id||committed.sha256!==hash||committed.size!==bytes.length||committed.purpose!=='inference'||committed.state!=='ready')throw Error('Private inference commit failed integrity verification.');
 auxInferenceCheck(accountId,identity);return{uploadId:intent.id};
}
async function auxInferenceCleanup(accountId,identity,ids){if(!ids.length)return;try{auxInferenceCheck(accountId,identity);}catch{return;}await Promise.allSettled(ids.map(id=>auxInferenceJSON(accountId,'/attachments/'+id,'DELETE')));}
async function auxCloudImageJSON(accountId,route,options){
 if(Buffer.byteLength(JSON.stringify(options.body))<=3500000)return fetchAuxAPIAuthenticatedJson(accountId,route,options);
 const identity=auxInferenceIdentity(accountId),ids=[];try{
  const images=options.body.inputImages??[],references=[];let total=0;
  if(images.length>16)throw Error('Use at most16 reference images.');
  for(const image of images){const bytes=Buffer.from(image.data,'base64');total+=bytes.length;if(total>20*1024*1024)throw Error('Reference images must total20 MiB or less.');references.push(await auxInferenceUpload(accountId,identity,bytes,image.mimeType,ids,options.signal));}
  auxInferenceCheck(accountId,identity);const result=await fetchAuxAPIAuthenticatedJson(accountId,route,{...options,body:{...options.body,inputImages:references}});auxInferenceCheck(accountId,identity);return result;
 }finally{await auxInferenceCleanup(accountId,identity,ids);}
}
async function auxCloudTranscribeLarge(accountId,file,options){
 if(file.size<1||file.size>20*1024*1024)throw Error('Audio input must be 20 MiB or smaller.');
 const identity=auxInferenceIdentity(accountId),ids=[];try{
  const reference=await auxInferenceUpload(accountId,identity,Buffer.from(await file.arrayBuffer()),file.type.split(';')[0].toLowerCase(),ids);
  const result=await auxInferenceJSON(accountId,'/stt/transcribe','POST',{...reference,...options?.language?{language:options.language}:{}});
  auxInferenceCheck(accountId,identity);return transcribeResponseSchema.parse(result).text?.trim()??'';
 }finally{await auxInferenceCleanup(accountId,identity,ids);}
}
`;

export function applyCloudInferenceUploadAdapter(source) {
  let text = source;
  const anchors = [];
  const edit = (find, replace) => {
    if (text.split(find).length - 1 !== 1) throw Error(`Cloud inference upload anchor changed: ${find.slice(0,100)}`);
    text = text.replace(find,()=>replace); anchors.push({find,replace,count:1,kind:'integration'});
  };
  edit('async function generateAuxImages(Cn,ei,ti,ni){let ri=', cloudInferenceUploadHelpers+'\nasync function generateAuxImages(Cn,ei,ti,ni){let ri=');
  edit('await fetchAuxAPIAuthenticatedJson(Cn,`/ai/images/generations`,{body:asideImageGenerationRequestSchema.parse(', 'await auxCloudImageJSON(Cn,`/ai/images/generations`,{body:asideImageGenerationRequestSchema.parse(');
  edit('async function transcribeAudio(Cn,ei,ti){let ni=new FormData;', 'async function transcribeAudio(Cn,ei,ti){if(ei.size>3*1024*1024)return auxCloudTranscribeLarge(Cn,ei,ti);let ni=new FormData;');
  return {text,anchors};
}
