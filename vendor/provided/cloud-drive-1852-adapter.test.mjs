import {test} from 'node:test';import {createRequire} from 'node:module';import assert from 'node:assert/strict';import fs from 'node:fs/promises';import vm from 'node:vm';import {createHash,randomBytes} from 'node:crypto';import {applyCloudDrive1852Adapter,cloudDrive1852Helpers,cloudDrive1852OriginalSourceSha256} from './cloud-drive-1852-adapter.mjs';import {applyCloudSessionAdapter} from './cloud-session-adapter.mjs';import {applyCloudAttachmentAdapter} from './cloud-attachment-adapter.mjs';
const original=await fs.readFile('/Users/rcourson/Documents/Vibe/web/out/provided-source-audit/daemon-original.mjs','utf8'),shipped=await fs.readFile('/Users/rcourson/Documents/Vibe/web/out/provided-candidate-local-browser-pass/Aux.app/Contents/Resources/aux/apps/daemon/Aux Daemon.app/Contents/Resources/node-development/index.mjs','utf8');
const {z}=createRequire(new URL('../../services/aux-cloud/package.json',import.meta.url))('zod');
function cookieParamSchemaFromSource(){
 const start=original.indexOf('cookieParamSchema=object('),end=original.indexOf(',discriminatedUnion(`encryption`',start);
 assert(start>=0&&end>start);assert.equal(original.includes('cookieEnvelopeSchema='),false);
 return new vm.Script(original.slice(start+'cookieParamSchema='.length,end)).runInNewContext({object:z.object,string$3:z.string,boolean$1:z.boolean,number$2:z.number,_enum:z.enum,unknown$1:z.unknown});
}
test('actual1852 original and shipped Aux both compose with exact Drive and session anchors',()=>{assert.equal(createHash('sha256').update(original).digest('hex'),cloudDrive1852OriginalSourceSha256);for(const [source,branding] of [[original,'aside'],[shipped,'aux']]){const drive=applyCloudDrive1852Adapter(source,{branding}),session=applyCloudSessionAdapter(drive.text,{version:'1852',branding});assert.equal(drive.anchors.length,9);assert.equal(session.anchors.length,4);assert.equal(applyCloudAttachmentAdapter(source).anchors.length,4);assert.ok(session.anchors.at(-1).replace.includes('waiting:!!(ti&&hasPendingCoderWork'));assert.throws(()=>applyCloudDrive1852Adapter(drive.text,{branding}),/anchor changed/);new vm.Script('var '+session.anchors[1].replace+'}));');}});
test('actual1852 Drive encrypts before per-file upload and decrypts through authenticated path mapping',async()=>{const key=randomBytes(32),account={userId:'fixture-user',createdAt:'2026-10-21'},generation=0,plain=Buffer.from('private encrypted credentials fixture'),path='credentials.json';let download;const context=vm.createContext({Buffer,Map,Set,JSON,Number,Error,Date,Object,Promise,Uint8Array,AccountRegistry:{getAccount:()=>account,getSession:()=>({accessToken:'fixture'})},getValidAccessToken:async()=>{},readAccessTokenSyncGeneration:()=>generation,fetchAccountSyncPassphrase:async()=>key.toString('base64'),sha256Hex:bytes=>createHash('sha256').update(bytes).digest('hex'),isValidAgentFilePath:path=>!!path&&!path.split('/').some(part=>!part||part==='..'),agentFileHeadSchema:{parse:head=>({formatVersion:head.formatVersion,files:head.files.map(({path,sha256,size})=>({path,sha256,size}))})},fetchAuxAPIAuthenticatedRequest:async(_account,route)=>{assert.equal(route,'/drive/files?path=credentials.json');return new Response(download);}});new vm.Script(cloudDrive1852Helpers('aux'),{importModuleDynamically:vm.constants.USE_MAIN_CONTEXT_DEFAULT_LOADER}).runInContext(context);const body=JSON.parse((await context.auxCloudDriveUpload(1,path,plain)).toString());download=Buffer.from(body.object,'base64');assert.equal(download.includes(plain),false);const head=await context.auxCloudDriveReadHead(1,{formatVersion:2,files:[body.entry]});assert.equal(head.files[0].sha256,createHash('sha256').update(plain).digest('hex'));assert.equal(Buffer.from(await context.auxCloudDriveDownload(1,path)).equals(plain),true);account.userId='wrong-user';await assert.rejects(context.auxCloudDriveReadHead(1,{formatVersion:1,files:[body.entry]}));await assert.rejects(context.auxCloudDriveDownload(1,path));});

test('actual1852 cookie consumer encrypts before upload and uses generation-scoped CAS for deletion',async()=>{const key=randomBytes(32),account={userId:'fixture-user',createdAt:'2026-10-21'},snapshot={formatVersion:1,encryption:'none',capturedAt:123,cookies:[{name:'fixture',value:'sensitive-cookie-fixture'}]},calls=[];let saved=null;class ApiError extends Error{constructor(status){super();this.status=status;}}const context=vm.createContext({Buffer,Map,Set,JSON,Number,Error,Date,Object,Promise,Uint8Array,URL,AbortSignal,AccountRegistry:{getAccount:()=>account,getSession:()=>({accessToken:'fixture'})},getValidAccessToken:async()=>{},readAccessTokenSyncGeneration:()=>0,fetchAccountSyncPassphrase:async()=>key.toString('base64'),sha256Hex:bytes=>createHash('sha256').update(bytes).digest('hex'),cookieParamSchema:cookieParamSchemaFromSource(),isValidAgentFilePath:()=>true,fetchWithAccessTokenRefresh:async(_account,_route,callback)=>callback('fixture'),withAuthorizationHeader:headers=>headers,AUX_API_BASE_URL:'https://fixture.invalid',AuxApiError:ApiError,normalizeAuxApiError:({response})=>new ApiError(response.status),fetch:async(url,options)=>{calls.push({url:String(url),options});if(options.method==='GET')return saved?Response.json(saved):new Response(null,{status:404});if(options.method==='PUT'){const body=JSON.parse(options.body);assert.equal(options.body.includes('sensitive-cookie-fixture'),false);const envelope=JSON.parse(Buffer.from(body.object,'base64').toString());const {createDecipheriv}=await import('node:crypto');const decipher=createDecipheriv('aes-256-gcm',key,Buffer.from(envelope.nonce,'base64'));decipher.setAAD(Buffer.from(JSON.stringify(['aux.cookie-snapshot.v1',account.userId,0])));decipher.setAuthTag(Buffer.from(envelope.tag,'base64'));assert.deepEqual(JSON.parse(Buffer.concat([decipher.update(Buffer.from(envelope.ciphertext,'base64')),decipher.final()]).toString()),snapshot);saved={...body,revision:3};return Response.json(saved);}assert.equal(url.searchParams.get('generation'),'0');assert.equal(options.headers['X-Aux-If-Match'],'"3"');return Response.json({deleted:true});}});new vm.Script(cloudDrive1852Helpers('aux'),{importModuleDynamically:vm.constants.USE_MAIN_CONTEXT_DEFAULT_LOADER}).runInContext(context);await context.auxCloudUploadCookies(1,snapshot);assert.equal(calls[1].options.headers['X-Aux-If-None-Match'],'*');await context.auxCloudDeleteCookies(1);assert.equal(calls.at(-1).options.method,'DELETE');});

async function cookieReadFixture(options={}){
 const {createCipheriv}=await import('node:crypto');
 const key=randomBytes(32),account={userId:'fixture-cookie-user',createdAt:'2026-10-22'},generation=2;
 const snapshot={formatVersion:1,encryption:'none',capturedAt:1234,cookies:[{name:'synthetic',value:options.invalidCookie?42:'private-fixture-value',domain:'example.invalid',path:'/'}]};
 const plaintext=Buffer.from(JSON.stringify(snapshot)),nonce=randomBytes(12),cipher=createCipheriv('aes-256-gcm',key,nonce);
 cipher.setAAD(Buffer.from(JSON.stringify(['aux.cookie-snapshot.v1',account.userId,generation])));
 const encrypted=Buffer.concat([cipher.update(plaintext),cipher.final()]);
 let bytes=Buffer.from(JSON.stringify({version:1,alg:'aes-256-gcm',nonce:nonce.toString('base64'),ciphertext:encrypted.toString('base64'),tag:cipher.getAuthTag().toString('base64')}));
 const hash=value=>createHash('sha256').update(value).digest('hex');
 const metadata={revision:4,generation,capturedAt:snapshot.capturedAt,size:plaintext.length,sha256:hash(plaintext),objectSize:bytes.length,objectSha256:hash(bytes)};
 if(options.badObjectHash)bytes[bytes.length-2]^=1;
 if(options.badPlaintextHash)metadata.sha256='0'.repeat(64);
 if(options.badGeneration)metadata.generation++;
 if(options.badCapture)metadata.capturedAt++;
 let canceled=false,requests=0;
 class ApiError extends Error{constructor(status){super();this.status=status;}}
 const context=vm.createContext({Buffer,Map,Set,JSON,Number,Error,Date,Object,Promise,Uint8Array,URL,AbortSignal,AccountRegistry:{getAccount:()=>account,getSession:()=>({accessToken:'fixture'})},getValidAccessToken:async()=>{},readAccessTokenSyncGeneration:()=>generation,fetchAccountSyncPassphrase:async()=>(options.wrongKey?randomBytes(32):key).toString('base64'),sha256Hex:hash,cookieParamSchema:cookieParamSchemaFromSource(),isValidAgentFilePath:()=>true,fetchWithAccessTokenRefresh:async(_account,_route,callback)=>callback('fixture'),withAuthorizationHeader:headers=>headers,AUX_API_BASE_URL:'https://fixture.invalid',AuxApiError:ApiError,normalizeAuxApiError:({response})=>new ApiError(response.status),fetch:async(url,init)=>{
  requests++;
  if(url.pathname==='/drive/cookies')return options.missing?new Response(null,{status:404}):Response.json(metadata);
  assert.equal(url.pathname,'/drive/cookies/object');assert.equal(url.searchParams.get('generation'),String(generation));assert.equal(init.headers['If-Match'],'"4"');
  if(options.rebindAtResponse)account.userId='different-cookie-owner';
  let chunk=0;
  return new Response(new ReadableStream({pull(controller){
   if(options.oversized){controller.enqueue(Buffer.alloc(metadata.objectSize+1));return;}
   if(chunk===0){controller.enqueue(bytes.subarray(0,bytes.length>>1));chunk++;}
   else{if(options.rebindInBody)account.userId='different-cookie-owner';controller.enqueue(bytes.subarray(bytes.length>>1));controller.close();}
  },cancel(){canceled=true;}}),{headers:{'X-Aux-Cookie-Revision':options.badRevision?'5':'4'}});
 }});
 new vm.Script(cloudDrive1852Helpers('aux'),{importModuleDynamically:vm.constants.USE_MAIN_CONTEXT_DEFAULT_LOADER}).runInContext(context);
 const acquire=context.auxCloudFileContext;
 context.auxCloudFileContext=async(...args)=>{const value=await acquire(...args);context.lastKey=value.key;return value;};
 return {context,snapshot,get canceled(){return canceled;},get requests(){return requests;}};
}
test('cookie recovery uses the supplied initialized parameter schema and decrypts without applying browser cookies',async()=>{
 const fixture=await cookieReadFixture();
 const result=await fixture.context.auxCloudReadCookieSnapshot(1);
 assert.deepEqual(JSON.parse(JSON.stringify(result.snapshot)),fixture.snapshot);
 assert.equal(result.metadata.revision,4);assert.equal(result.generation,2);
 assert.ok(fixture.context.lastKey.every(byte=>byte===0));
 assert.equal(fixture.context.globalCdpClient,undefined);
 const absent=await cookieReadFixture({missing:true});assert.equal(await absent.context.auxCloudReadCookieSnapshot(1),null);assert.ok(absent.context.lastKey.every(byte=>byte===0));
});
test('cookie recovery refuses corrupt ciphertext, key/generation/revision and original parameter-schema mismatches',async()=>{
 for(const option of ['badObjectHash','badPlaintextHash','wrongKey','badGeneration','badCapture','badRevision','invalidCookie','oversized']){
  const fixture=await cookieReadFixture({[option]:true});
  await assert.rejects(fixture.context.auxCloudReadCookieSnapshot(1),undefined,option);
  assert.ok(fixture.context.lastKey.every(byte=>byte===0),option+' clears acquired key');
  if(option==='badGeneration')assert.equal(fixture.requests,1);
  if(option==='oversized')assert.equal(fixture.canceled,true);
 }
});
test('cookie recovery rejects account rebinding during response and body work',async()=>{
 for(const option of ['rebindAtResponse','rebindInBody']){
  const fixture=await cookieReadFixture({[option]:true});
  await assert.rejects(fixture.context.auxCloudReadCookieSnapshot(1),/Account changed/);
  assert.ok(fixture.context.lastKey.every(byte=>byte===0));
 }
});
