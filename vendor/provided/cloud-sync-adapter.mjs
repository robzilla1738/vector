/** Reviewed, inactive until composed by the integrator into the pinned daemon transform. */
export const cloudSyncOriginalSourceSha256 = '9012caa45761482f936ef5d3994fc39444eb9a96202cdb65e931c10d5faf0439';
export const cloudSyncHelpers = String.raw`
var auxCloudFileObjectScopes;
async function auxCloudFileContext(accountId){
  await getValidAccessToken(accountId);
  const account=AccountRegistry.getAccount(accountId),session=AccountRegistry.getSession(accountId),generation=readAccessTokenSyncGeneration(session?.accessToken);
  if(!account?.userId||!session||!Number.isSafeInteger(generation)||generation<0)throw Error('Sign in before encrypted file sync.');
  const stamp=JSON.stringify([accountId,account.userId,generation,account.createdAt]);
  const encoded=await fetchAccountSyncPassphrase(accountId);
  if(!encoded)throw Error('Recover the account sync key before syncing files.');
  const key=Buffer.from(encoded,'base64');
  const current=AccountRegistry.getAccount(accountId),currentSession=AccountRegistry.getSession(accountId);
  if(key.length!==32||stamp!==JSON.stringify([accountId,current?.userId,readAccessTokenSyncGeneration(currentSession?.accessToken),current?.createdAt])){key.fill(0);throw Error('Account changed during encrypted sync.');}
  auxCloudFileObjectScopes??=new Map;
  if(!auxCloudFileObjectScopes.has(stamp)){for(const existing of auxCloudFileObjectScopes.keys())if(JSON.parse(existing)[0]===accountId)auxCloudFileObjectScopes.delete(existing);auxCloudFileObjectScopes.set(stamp,new Map);}
  return{accountId,userId:account.userId,generation,key,objects:auxCloudFileObjectScopes.get(stamp)};
}
function auxCloudFileAAD(context,path){if(!isValidAgentFilePath(path))throw Error('Invalid encrypted sync path.');return Buffer.from(JSON.stringify(['aux.agent-file.v1',context.userId,path,context.generation]));}
function auxCloudFileMapKey(path,hash){return JSON.stringify([path,hash]);}
async function auxCloudEncryptFile(accountId,hash,bytes,path){
  const context=await auxCloudFileContext(accountId);
  try{
    if(sha256Hex(bytes)!==hash||bytes.byteLength>2097152)throw Error('Invalid plaintext sync object.');
    const{createCipheriv,randomBytes}=await import('node:crypto'),nonce=randomBytes(12),cipher=createCipheriv('aes-256-gcm',context.key,nonce);
    cipher.setAAD(auxCloudFileAAD(context,path));
    const ciphertext=Buffer.concat([cipher.update(bytes),cipher.final()]);
    const encrypted=Buffer.from(JSON.stringify({version:1,alg:'aes-256-gcm',nonce:nonce.toString('base64'),ciphertext:ciphertext.toString('base64'),tag:cipher.getAuthTag().toString('base64')}));
    const entry={path,sha256:hash,size:bytes.byteLength,objectSha256:sha256Hex(encrypted),objectSize:encrypted.length,encryption:'aes-256-gcm',generation:context.generation};
    context.objects.set(auxCloudFileMapKey(path,hash),entry);
    return{entry,bytes:encrypted};
  }finally{context.key.fill(0);}
}
async function auxCloudReadHead(accountId,head){
  const context=await auxCloudFileContext(accountId);
  try{
    if(head?.formatVersion!==1||!Array.isArray(head.files)||head.files.length>1000)throw Error('Invalid encrypted sync head.');
    const paths=new Set;
    for(const entry of head.files){
      if(!isValidAgentFilePath(entry.path)||paths.has(entry.path)||entry.encryption!=='aes-256-gcm'||entry.generation!==context.generation||!/^[a-f0-9]{64}$/.test(entry.sha256)||!/^[a-f0-9]{64}$/.test(entry.objectSha256)||!Number.isSafeInteger(entry.size)||entry.size<0||entry.size>2097152||!Number.isSafeInteger(entry.objectSize)||entry.objectSize<0||entry.objectSize>3145728)throw Error('Invalid encrypted sync object metadata.');
      paths.add(entry.path);context.objects.set(auxCloudFileMapKey(entry.path,entry.sha256),entry);
    }
    return agentFileHeadSchema.parse(head);
  }finally{context.key.fill(0);}
}
async function auxCloudWriteHead(accountId,head){
  const context=await auxCloudFileContext(accountId);
  try{return{formatVersion:1,files:head.files.map(entry=>{const encrypted=context.objects.get(auxCloudFileMapKey(entry.path,entry.sha256));if(!encrypted||encrypted.size!==entry.size)throw Error('Encrypted object mapping missing; refresh sync before publishing.');return encrypted;})};}finally{context.key.fill(0);}
}
async function auxCloudHasHeadCache(accountId){const context=await auxCloudFileContext(accountId);try{return context.objects.size>0;}finally{context.key.fill(0);}}
async function auxCloudDecryptFile(accountId,hash,path){
  const context=await auxCloudFileContext(accountId);
  try{
    const entry=context.objects.get(auxCloudFileMapKey(path,hash));if(!entry)throw Error('Encrypted sync object mapping missing.');
    const response=await fetchAsideAPIAuthenticatedRequest(accountId,'/sync/agent-files/objects/'+entry.objectSha256,{method:'GET',fallbackErrorMessage:'Failed to download encrypted file'});
    const reader=response.body?.getReader(),chunks=[];let size=0;if(!reader)throw Error('Encrypted sync object body missing.');
    try{for(;;){const next=await reader.read();if(next.done)break;size+=next.value.byteLength;if(size>entry.objectSize||size>3145728){await reader.cancel();throw Error('Encrypted sync object exceeds declared size.');}chunks.push(Buffer.from(next.value));}}finally{reader.releaseLock();}
    const bytes=Buffer.concat(chunks);if(size!==entry.objectSize||sha256Hex(bytes)!==entry.objectSha256)throw Error('Encrypted sync object integrity check failed.');
    const envelope=JSON.parse(bytes.toString('utf8'));
    if(envelope.version!==1||envelope.alg!=='aes-256-gcm'||!/^[A-Za-z0-9+/]{16}$/.test(envelope.nonce)||!/^[A-Za-z0-9+/]{22}==$/.test(envelope.tag)||typeof envelope.ciphertext!=='string'||envelope.ciphertext.length>2796204||!/^[A-Za-z0-9+/]*={0,2}$/.test(envelope.ciphertext))throw Error('Invalid encrypted sync envelope.');
    const{createDecipheriv}=await import('node:crypto'),decipher=createDecipheriv('aes-256-gcm',context.key,Buffer.from(envelope.nonce,'base64'));
    decipher.setAAD(auxCloudFileAAD(context,path));decipher.setAuthTag(Buffer.from(envelope.tag,'base64'));
    const plaintext=Buffer.concat([decipher.update(Buffer.from(envelope.ciphertext,'base64')),decipher.final()]);
    if(plaintext.length!==entry.size||sha256Hex(plaintext)!==hash){plaintext.fill(0);throw Error('Decrypted sync object integrity check failed.');}
    const current=AccountRegistry.getAccount(accountId),session=AccountRegistry.getSession(accountId);
    if(current?.userId!==context.userId||readAccessTokenSyncGeneration(session?.accessToken)!==context.generation){plaintext.fill(0);throw Error('Account changed during encrypted sync download.');}
    return new Uint8Array(plaintext);
  }finally{context.key.fill(0);}
}
`;

/** Anchors deliberately target original supplied functions; unknown source drift refuses. */
export function applyCloudSyncAdapter(source) {
  let text = source;
  const anchors = [];
  const edit = (find, replace, count = 1) => {
    if (text.split(find).length - 1 !== count) throw new Error(`Cloud sync adapter anchor changed: ${find.slice(0, 100)}`);
    text = text.split(find).join(replace);
    anchors.push({ find, replace, count, kind: 'integration' });
  };
  edit('function requireEtag(Cn){', `${cloudSyncHelpers}\nfunction requireEtag(Cn){`);
  edit('async function getRemoteHead(Cn,ei){try{let ti={};', 'async function getRemoteHead(Cn,ei){if(!await auxCloudHasHeadCache(Cn))ei=void 0;try{let ti={};');
  edit('head:agentFileHeadSchema.parse(await ni.json())', 'head:await auxCloudReadHead(Cn,await ni.json())');
  edit('async function putRemoteHead(Cn,ei,ti){let ni=', 'async function putRemoteHead(Cn,ei,ti){ei=await auxCloudWriteHead(Cn,ei);let ni=');
  edit('head:agentFileHeadSchema.parse(await ri.json())', 'head:await auxCloudReadHead(Cn,await ri.json())');
  edit('`ifMatch`in ti?ni[`If-Match`]=ti.ifMatch:ni[`If-None-Match`]=`*`', '`ifMatch`in ti?ni[`X-Aux-If-Match`]=ti.ifMatch:ni[`X-Aux-If-None-Match`]=`*`');
  edit('async function putRemoteObject(Cn,ei,ti){let ni;', 'async function putRemoteObject(Cn,ei,ti,auxPath){const auxEncrypted=await auxCloudEncryptFile(Cn,ei,ti,auxPath);ei=auxEncrypted.entry.objectSha256;ti=auxEncrypted.bytes;let ni;');
  edit('async function getRemoteObject(Cn,ei){let ti=await fetchAsideAPIAuthenticatedRequest(Cn,`/sync/agent-files/objects/${ei}`,{method:`GET`,fallbackErrorMessage:`Failed to download agent file object`});return new Uint8Array(await ti.arrayBuffer())}', 'async function getRemoteObject(Cn,ei,auxPath){return auxCloudDecryptFile(Cn,ei,auxPath)}');
  edit('await putRemoteObject(Cn,ni.sha256,ni.bytes)', 'await putRemoteObject(Cn,ni.sha256,ni.bytes,ni.path)');
  edit('await putRemoteObject(Cn,ei.sha256,ei.bytes)', 'await putRemoteObject(Cn,ei.sha256,ei.bytes,ei.path)');
  edit('await getRemoteObject(Cn,ei.sha256)', 'await getRemoteObject(Cn,ei.sha256,ei.path)');
  return { text, anchors };
}
