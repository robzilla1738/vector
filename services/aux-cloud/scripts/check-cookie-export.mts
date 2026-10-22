/** Deployed encrypted-cookie transport only. Never reads a browser cookie jar. */
import assert from 'node:assert/strict';
import {createHash,createCipheriv,createDecipheriv,randomBytes,randomUUID} from 'node:crypto';
import {readFile,writeFile} from 'node:fs/promises';
import vm from 'node:vm';
import {z} from 'zod';
import {cloudDrive1852Helpers} from '../../../vendor/provided/cloud-drive-1852-adapter.mjs';
import {SignJWT} from 'jose';
import {checkEnvironment} from './check-environment.mjs';
import resources from '../config/deployment-resources.json';
import {sql} from '../src/db';

if(process.env.AUX_CHECK_DISPOSABLE!=='1'||checkEnvironment(process.env,resources).profile!=='development')throw Error('Explicit Aux development fixture permission required.');
const origin='https://dev-cloud.getaux.co',users=[randomUUID(),randomUUID()],sessions=[randomUUID(),randomUUID()],key=randomBytes(32),checks:string[]=[];
const hash=(bytes:Uint8Array|string)=>createHash('sha256').update(bytes).digest('hex');
let stage='create-fixtures',cleaned=false;
const tokens=await Promise.all(users.map((id,index)=>new SignJWT({sg:0,sid:sessions[index]}).setProtectedHeader({alg:'HS256'}).setSubject(id).setIssuer('https://api.getaux.co').setAudience('aux-desktop').setIssuedAt().setExpirationTime('10m').sign(new TextEncoder().encode(process.env.AUX_AUTH_SECRET!))));
async function request(path:string,owner=0,options:RequestInit={}){
 return fetch(origin+'/api/v1/drive/cookies'+path,{...options,headers:{Authorization:'Bearer '+tokens[owner],...options.headers},redirect:'error',signal:AbortSignal.timeout(20_000)});
}
function payload(capturedAt:number){
 const plain=Buffer.from(JSON.stringify({formatVersion:1,encryption:'none',capturedAt,cookies:[{name:'fixture',value:'disposable cookie transport fixture',domain:'cookie.example.invalid',path:'/'}]})),nonce=randomBytes(12),cipher=createCipheriv('aes-256-gcm',key,nonce);
 cipher.setAAD(Buffer.from(JSON.stringify(['aux.cookie-snapshot.v1',users[0],0])));
 const ciphertext=Buffer.concat([cipher.update(plain),cipher.final()]),bytes=Buffer.from(JSON.stringify({version:1,alg:'aes-256-gcm',nonce:nonce.toString('base64'),ciphertext:ciphertext.toString('base64'),tag:cipher.getAuthTag().toString('base64')}));
 return{generation:0,capturedAt,sha256:hash(plain),size:plain.length,objectSha256:hash(bytes),objectSize:bytes.length,object:bytes.toString('base64')};
}
try{
 for(let index=0;index<users.length;index++){
  await sql`INSERT INTO aux_users(id,clerk_id,email,name) VALUES(${users[index]},${'aux_cookie_export_fixture:'+users[index]},${users[index]+'@example.invalid'},'Disposable Aux cookie transport fixture')`;
  await sql`INSERT INTO aux_sessions(id,user_id,access_hash,access_expires_at,expires_at,platform) VALUES(${sessions[index]},${users[index]},${hash(tokens[index])},now()+interval '10 minutes',now()+interval '15 minutes','web')`;
 }
 const body=payload(Date.now());stage='upload';
 assert.equal((await request('',0,{method:'PUT',headers:{'Content-Type':'application/json','X-Aux-If-None-Match':'*'},body:JSON.stringify(body)})).status,200);
 const metadata=await request('');assert.equal(metadata.status,200);const current=await metadata.json(),tag='"'+current.revision+'"';
 stage='download';const downloaded=await request('/object?generation=0',0,{headers:{'If-Match':tag}});assert.equal(downloaded.status,200);assert.equal(downloaded.headers.get('X-Aux-Cookie-Revision'),String(current.revision));assert.equal(downloaded.headers.get('Content-Type'),'application/octet-stream');
 const bytes=Buffer.from(await downloaded.arrayBuffer());assert.equal(hash(bytes),body.objectSha256);assert.equal(bytes.length,body.objectSize);
 const envelope=JSON.parse(bytes.toString()),decipher=createDecipheriv('aes-256-gcm',key,Buffer.from(envelope.nonce,'base64'));decipher.setAAD(Buffer.from(JSON.stringify(['aux.cookie-snapshot.v1',users[0],0])));decipher.setAuthTag(Buffer.from(envelope.tag,'base64'));
 const plain=Buffer.concat([decipher.update(Buffer.from(envelope.ciphertext,'base64')),decipher.final()]);assert.equal(hash(plain),body.sha256);plain.fill(0);
 checks.push('actual deployed upload/metadata/versioned ciphertext download preserves authenticated encrypted bytes');
 stage='actual-adapter-reader';
 const original=await readFile(new URL('../../../out/provided-source-audit/daemon-original.mjs',import.meta.url),'utf8');
 assert.equal(hash(original),'5e35dfa1eb76d4614246f954b652fd505e271a0b3f1ac3168132fb8bc03814f5');
 const schemaStart=original.indexOf('cookieParamSchema=object('),schemaEnd=original.indexOf(',discriminatedUnion(`encryption`',schemaStart);
 assert(schemaStart>=0&&schemaEnd>schemaStart);
 const cookieParamSchema=new vm.Script(original.slice(schemaStart+'cookieParamSchema='.length,schemaEnd)).runInNewContext({object:z.object,string$3:z.string,boolean$1:z.boolean,number$2:z.number,_enum:z.enum,unknown$1:z.unknown});
 class FixtureApiError extends Error{status:number;constructor(status:number){super('Synthetic cookie transport failure');this.status=status;}}
 const context=vm.createContext({Buffer,Map,Set,JSON,Number,Error,Date,Object,Promise,Uint8Array,URL,AbortSignal,cookieParamSchema,
  AccountRegistry:{getAccount:()=>({userId:users[0],createdAt:'synthetic-cookie-reader'}),getSession:()=>({accessToken:tokens[0]})},
  getValidAccessToken:async()=>tokens[0],readAccessTokenSyncGeneration:()=>0,fetchAccountSyncPassphrase:async()=>key.toString('base64'),sha256Hex:hash,isValidAgentFilePath:()=>true,
  fetchWithAccessTokenRefresh:async(_account:number,_path:string,callback:(token:string)=>Promise<Response>)=>callback(tokens[0]!),
  withAuthorizationHeader:(headers:Record<string,string>,token:string)=>({...headers,Authorization:'Bearer '+token}),AUX_API_BASE_URL:origin,AuxApiError:FixtureApiError,
  normalizeAuxApiError:({response}:{response:{status:number}})=>new FixtureApiError(response.status),fetch:async(input:URL,options:RequestInit)=>{
   assert.equal(input.origin,origin);assert(input.pathname==='/drive/cookies'||input.pathname==='/drive/cookies/object');
   return fetch(input,{...options,redirect:'error'});
  }});
 new vm.Script(cloudDrive1852Helpers('aux'),{importModuleDynamically:vm.constants.USE_MAIN_CONTEXT_DEFAULT_LOADER}).runInContext(context);
 const restored=await context.auxCloudReadCookieSnapshot(1);
 assert.equal(restored.userId,users[0]);assert.equal(restored.generation,0);assert.equal(restored.metadata.revision,current.revision);
 assert.equal(restored.snapshot.capturedAt,body.capturedAt);assert.equal(restored.snapshot.cookies[0].value,'disposable cookie transport fixture');
 assert.equal(context.globalCdpClient,undefined);
 checks.push('actual supplied-structure adapter reads/decrypts the deployed root rewrite with synthetic CSK and original parameter schema, without browser import');
 stage='isolation';assert.equal((await request('/object?generation=0',1,{headers:{'If-Match':tag}})).status,404);assert.equal((await request('/object?generation=1',0,{headers:{'If-Match':tag}})).status,412);assert.equal((await request('/object?generation=0',0,{headers:{'If-Match':'"999"'}})).status,412);assert.equal((await request('/object?generation=0')).status,428);
 checks.push('other account denied, and stale revision/wrong generation/missing precondition refused');
 stage='delete';assert.equal((await request('?generation=0',0,{method:'DELETE',headers:{'X-Aux-If-Match':tag}})).status,200);assert.equal((await request('/object?generation=0',0,{headers:{'If-Match':tag}})).status,404);
 checks.push('actual deletion makes encrypted snapshot unavailable');
}catch(error){console.error(JSON.stringify({fixture:'deployed-cookie-export',failedAt:stage,checksPassed:checks.length,errorType:error instanceof Error?error.name:'Unknown'}));process.exitCode=1;
}finally{
 try{for(let index=0;index<users.length;index++){await sql`DELETE FROM aux_sessions WHERE id=${sessions[index]} AND user_id=${users[index]}`;await sql`DELETE FROM aux_users WHERE id=${users[index]} AND clerk_id=${'aux_cookie_export_fixture:'+users[index]}`;}cleaned=true;}finally{key.fill(0);}
 console.log(JSON.stringify({fixtureCleaned:cleaned,checksPassed:checks.length,browserCookiesAccessed:false,paidProviderCalls:0}));
}
if(checks.length===4&&cleaned)await writeFile(new URL('../evidence/cookie-export.json',import.meta.url),JSON.stringify({checkedAt:new Date().toISOString(),origin,checks,fixtureRemoved:true,syntheticSessions:true,actualAdapterReaderVerified:true,browserCookiesAccessed:false,nativeCookieImportVerified:false,paidProviderCalls:0},null,2)+'\n');
