/** Root-run disposable encrypted-cookie Neon fixture. No actual browser/profile cookie reads. */
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
const { driveCookieRoutes }=await import('../src/drive-cookies');
const {createHash,createCipheriv,createDecipheriv,randomBytes}=await import('node:crypto');
const users=[randomUUID(),randomUUID()],key=randomBytes(32),checks:string[]=[];let cleaned=false;
const apps=users.map(id=>{const app=new Hono<{Variables:AuthVariables}>();app.use('*',async(c,next)=>{c.set('user',{id,clerkId:`fixture_${id}`,email:`${id}@example.invalid`,sessionId:'fixture'});await next();});app.route('/',driveCookieRoutes);return app;});
function payload(capturedAt:number){const plain=Buffer.from(JSON.stringify({formatVersion:1,encryption:'none',capturedAt,cookies:[{name:'fixture',value:'disposable encrypted cookie fixture'}]})),nonce=randomBytes(12),cipher=createCipheriv('aes-256-gcm',key,nonce);cipher.setAAD(Buffer.from(JSON.stringify(['aux.cookie-snapshot.v1',users[0],0])));const ciphertext=Buffer.concat([cipher.update(plain),cipher.final()]),bytes=Buffer.from(JSON.stringify({version:1,alg:'aes-256-gcm',nonce:nonce.toString('base64'),ciphertext:ciphertext.toString('base64'),tag:cipher.getAuthTag().toString('base64')}));return{generation:0,capturedAt,sha256:createHash('sha256').update(plain).digest('hex'),size:plain.length,objectSha256:createHash('sha256').update(bytes).digest('hex'),objectSize:bytes.length,object:bytes.toString('base64')};}
try{
 for(const user of users)await sql`INSERT INTO aux_users(id,clerk_id,email,name) VALUES(${user},${`fixture_${user}`},${`${user}@example.invalid`},'Disposable encrypted cookie fixture')`;
 const put=(body:ReturnType<typeof payload>,match?:string)=>apps[0].request('/drive/cookies',{method:'PUT',headers:match?{'If-Match':match}:{'If-None-Match':'*'},body:JSON.stringify(body)});
 assert.equal((await put(payload(1))).status,200,'cookie creation');assert.equal((await apps[1].request('/drive/cookies')).status,404,'cross-user cookie metadata');checks.push('opaque cookie creation and owner metadata isolation');
 const [stored]=await sql`SELECT encode(content,'base64') AS content FROM aux_drive_cookies WHERE user_id=${users[0]}`;const envelope=JSON.parse(Buffer.from(stored.content,'base64').toString()),decipher=createDecipheriv('aes-256-gcm',key,Buffer.from(envelope.nonce,'base64'));decipher.setAAD(Buffer.from(JSON.stringify(['aux.cookie-snapshot.v1',users[0],0])));decipher.setAuthTag(Buffer.from(envelope.tag,'base64'));assert.equal(JSON.parse(Buffer.concat([decipher.update(Buffer.from(envelope.ciphertext,'base64')),decipher.final()]).toString()).cookies[0].value,'disposable encrypted cookie fixture');checks.push('stored bytes authenticate and decrypt with matching cookie AAD');
 const race=await Promise.all([put(payload(2),'"1"'),put(payload(3),'"1"')]);assert.deepEqual(race.map(response=>response.status).sort(),[200,412],'cookie CAS race');const latest=await(await apps[0].request('/drive/cookies')).json();assert.equal((await put(payload(0),'"'+latest.revision+'"')).status,412,'older capture refusal');checks.push('cookie concurrent CAS and capture ordering');
 const remove=(tag:string)=>apps[0].request('/drive/cookies?generation=0',{method:'DELETE',headers:{'If-Match':tag}});assert.equal((await remove('"1"')).status,412,'stale cookie delete');assert.equal((await remove('"2"')).status,200,'current cookie delete');assert.equal((await apps[0].request('/drive/cookies')).status,404,'deleted cookie metadata');assert.equal((await put(payload(4))).status,200,'new cookie after tombstone');assert.equal((await(await apps[0].request('/drive/cookies')).json()).revision,4,'monotonic revision after recreation');assert.equal((await remove('"1"')).status,412,'ABA cookie deletion refusal');checks.push('cookie deletion clears ciphertext and tombstones prevent stale ETag ABA');
}catch(error){const value=error as{code?:unknown;constraint?:unknown;table?:unknown;actual?:unknown;expected?:unknown;message?:unknown};console.error(JSON.stringify({success:false,errorType:error instanceof Error?error.name:'Unknown',code:value.code,constraint:value.constraint,table:value.table,assertion:error instanceof assert.AssertionError?{label:value.message,actual:value.actual,expected:value.expected}:undefined}));process.exitCode=1;}
finally{try{for(const user of users)await sql`DELETE FROM aux_users WHERE id=${user} AND clerk_id=${`fixture_${user}`}`;const rows=await sql`SELECT count(*) AS count FROM aux_users WHERE id=ANY(${users}::uuid[])`;cleaned=Number(rows[0].count)===0;}finally{key.fill(0);globalThis.fetch=originalFetch;}console.log(JSON.stringify({success:!process.exitCode,checks,cleaned,providerAcceptance:false}));if(!cleaned)process.exitCode=1;}
