/** Root-run disposable actual1852 Drive real-Neon fixture. No provider credentials or plaintext secrets. */
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { Hono } from 'hono';
import type { AuthVariables } from '../src/auth';
if (process.env.AUX_ALLOW_DISPOSABLE_DB_CHECK !== '1' || process.env.VERCEL_ENV === 'production') throw new Error('Explicit development-only disposable DB permission is required');
const hostname = new URL(process.env.DATABASE_URL || '').hostname;
if (!/^ep-spring-darkness-b824br4r(?:-pooler)?\./.test(hostname)) throw new Error('Only the reviewed Aux development database is allowed');
const originalFetch = globalThis.fetch, apiHost = hostname.replace(/^[^.]+\./, 'api.');
globalThis.fetch = async (input, init) => {
  const url = new URL(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url), headers = new Headers(init?.headers ?? (input instanceof Request ? input.headers : undefined));
  let target = ''; try { target = new URL(headers.get('Neon-Connection-String') || '').hostname; } catch {}
  if (url.protocol !== 'https:' || url.hostname !== apiHost || url.pathname !== '/sql' || target !== hostname) throw new Error('Unexpected network request blocked');
  return originalFetch(input, init);
};
const { sql } = await import('../src/db');
const { drive1852Routes } = await import('../src/drive-1852');
const { encryptSyncObject, decryptSyncObject } = await import('../src/sync');
const { randomBytes, createHash } = await import('node:crypto');
const users=[randomUUID(),randomUUID()],key=randomBytes(32),checks:string[]=[];let cleaned=false;
const apps=users.map(id=>{const app=new Hono<{Variables:AuthVariables}>();app.use('*',async(c,next)=>{c.set('user',{id,clerkId:`fixture_${id}`,email:`${id}@example.invalid`,sessionId:'fixture'});await next();});app.route('/',drive1852Routes);return app;});
function payload(text:string){const plain=Buffer.from(text),bytes=Buffer.from(encryptSyncObject(plain,key,{userId:users[0],path:'credentials.json',generation:0}));return{entry:{path:'credentials.json',sha256:createHash('sha256').update(plain).digest('hex'),size:plain.length,objectSha256:createHash('sha256').update(bytes).digest('hex'),objectSize:bytes.length,encryption:'aes-256-gcm',generation:0},object:bytes.toString('base64')};}
try{
 for(const user of users)await sql`INSERT INTO aux_users(id,clerk_id,email,name) VALUES(${user},${`fixture_${user}`},${`${user}@example.invalid`},'Disposable Drive fixture')`;
 const initial=payload('disposable secret fixture'),left=payload('left device update'),right=payload('right device update');
 const put=(app:typeof apps[number],body:ReturnType<typeof payload>,match?:string)=>app.request('/drive/files?path=credentials.json',{method:'PUT',headers:match?{'If-Match':'"'+match+'"'}:{'If-None-Match':'*'},body:JSON.stringify(body)});
 assert.equal((await put(apps[0],initial)).status,200,'Drive create');const first=await apps[0].request('/drive/head'),head=await first.json();assert.equal(head.formatVersion,2);assert.equal(head.files[0].sha256,initial.entry.sha256);checks.push('actual1852 head shape and encrypted per-file creation');
 assert.equal((await apps[1].request('/drive/files?path=credentials.json')).status,404,'cross-user download');assert.equal((await apps[1].request('/drive/head')).status,404,'cross-user head');checks.push('owner isolation');
 const encrypted=new Uint8Array(await(await apps[0].request('/drive/files?path=credentials.json')).arrayBuffer());assert.equal(Buffer.from(decryptSyncObject(encrypted,key,{userId:users[0],path:'credentials.json',generation:0})).toString(),'disposable secret fixture');checks.push('stored ciphertext decrypts only in matching owner/path/generation context');
 const race=await Promise.all([put(apps[0],left,initial.entry.sha256),put(apps[0],right,initial.entry.sha256)]);assert.deepEqual(race.map(result=>result.status).sort(),[200,412],'per-file CAS race');checks.push('one winner for concurrent original plaintext-hash CAS');
 const latest=await(await apps[0].request('/drive/head')).json();assert.equal((await apps[0].request('/drive/files?path=credentials.json',{method:'DELETE',headers:{'If-Match':'"'+initial.entry.sha256+'"'}})).status,412,'stale Drive deletion');assert.equal((await apps[0].request('/drive/files?path=credentials.json',{method:'DELETE',headers:{'If-Match':'"'+latest.files[0].sha256+'"'}})).status,200,'current Drive deletion');assert.equal((await(await apps[0].request('/drive/head')).json()).files.length,0);checks.push('stale deletion refusal and empty formatVersion2 head after deletion');
}catch(error){const value=error as {code?:unknown;constraint?:unknown;table?:unknown;actual?:unknown;expected?:unknown;message?:unknown};console.error(JSON.stringify({success:false,errorType:error instanceof Error?error.name:'Unknown',code:value.code,constraint:value.constraint,table:value.table,assertion:error instanceof assert.AssertionError?{label:value.message,actual:value.actual,expected:value.expected}:undefined}));process.exitCode=1;}
finally{try{for(const user of users)await sql`DELETE FROM aux_users WHERE id=${user} AND clerk_id=${`fixture_${user}`}`;const rows=await sql`SELECT count(*) AS count FROM aux_users WHERE id=ANY(${users}::uuid[])`;cleaned=Number(rows[0].count)===0;}finally{key.fill(0);globalThis.fetch=originalFetch;}console.log(JSON.stringify({success:!process.exitCode,checks,cleaned,providerAcceptance:false}));if(!cleaned)process.exitCode=1;}
