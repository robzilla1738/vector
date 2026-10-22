/** Deployed encrypted-cookie transport only. Never reads a browser cookie jar. */
import assert from 'node:assert/strict';
import {createHash,createCipheriv,createDecipheriv,randomBytes,randomUUID} from 'node:crypto';
import {writeFile} from 'node:fs/promises';
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
 stage='download';const downloaded=await request('/object?generation=0',0,{headers:{'If-Match':tag}});assert.equal(downloaded.status,200);assert.equal(downloaded.headers.get('ETag'),tag);assert.equal(downloaded.headers.get('Content-Type'),'application/octet-stream');
 const bytes=Buffer.from(await downloaded.arrayBuffer());assert.equal(hash(bytes),body.objectSha256);assert.equal(bytes.length,body.objectSize);
 const envelope=JSON.parse(bytes.toString()),decipher=createDecipheriv('aes-256-gcm',key,Buffer.from(envelope.nonce,'base64'));decipher.setAAD(Buffer.from(JSON.stringify(['aux.cookie-snapshot.v1',users[0],0])));decipher.setAuthTag(Buffer.from(envelope.tag,'base64'));
 const plain=Buffer.concat([decipher.update(Buffer.from(envelope.ciphertext,'base64')),decipher.final()]);assert.equal(hash(plain),body.sha256);plain.fill(0);
 checks.push('actual deployed upload/metadata/versioned ciphertext download preserves authenticated encrypted bytes');
 stage='isolation';assert.equal((await request('/object?generation=0',1,{headers:{'If-Match':tag}})).status,404);assert.equal((await request('/object?generation=1',0,{headers:{'If-Match':tag}})).status,412);assert.equal((await request('/object?generation=0',0,{headers:{'If-Match':'"999"'}})).status,412);assert.equal((await request('/object?generation=0')).status,428);
 checks.push('other account denied, and stale revision/wrong generation/missing precondition refused');
 stage='delete';assert.equal((await request('?generation=0',0,{method:'DELETE',headers:{'X-Aux-If-Match':tag}})).status,200);assert.equal((await request('/object?generation=0',0,{headers:{'If-Match':tag}})).status,404);
 checks.push('actual deletion makes encrypted snapshot unavailable');
}catch(error){console.error(JSON.stringify({fixture:'deployed-cookie-export',failedAt:stage,checksPassed:checks.length,errorType:error instanceof Error?error.name:'Unknown'}));process.exitCode=1;
}finally{
 try{for(let index=0;index<users.length;index++){await sql`DELETE FROM aux_sessions WHERE id=${sessions[index]} AND user_id=${users[index]}`;await sql`DELETE FROM aux_users WHERE id=${users[index]} AND clerk_id=${'aux_cookie_export_fixture:'+users[index]}`;}cleaned=true;}finally{key.fill(0);}
 console.log(JSON.stringify({fixtureCleaned:cleaned,checksPassed:checks.length,browserCookiesAccessed:false,paidProviderCalls:0}));
}
if(checks.length===3&&cleaned)await writeFile(new URL('../evidence/cookie-export.json',import.meta.url),JSON.stringify({checkedAt:new Date().toISOString(),origin,checks,fixtureRemoved:true,syntheticSessions:true,browserCookiesAccessed:false,nativeCookieImportVerified:false,paidProviderCalls:0},null,2)+'\n');
