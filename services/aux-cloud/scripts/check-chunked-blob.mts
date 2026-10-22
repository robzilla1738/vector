import assert from 'node:assert/strict';
import { randomUUID, randomBytes, createHash } from 'node:crypto';
import { writeFile } from 'node:fs/promises';
import { SignJWT } from 'jose';
import { get, del } from '@vercel/blob';
import { sql } from '../src/db';

assert.equal(process.env.AUX_CHECK_DISPOSABLE, '1');
assert.equal(new URL(process.env.DATABASE_URL!).hostname, 'ep-spring-darkness-b824br4r-pooler.c-14.us-east-1.aws.neon.tech');
const origin = 'https://dev-cloud.getaux.co', owners = [randomUUID(), randomUUID()], sessions = [randomUUID(), randomUUID()], tokens: string[] = [];
const hash = (value: Uint8Array | string) => createHash('sha256').update(value).digest('hex');
let pathname: string | undefined, sourceChunked = false, apiAdvertisedLength: string | null = null, success = false;
async function call(owner: number, path: string, status: number, method = 'GET', body?: unknown, extra: Record<string, string> = {}) {
  const response = await fetch(origin + '/api/v1' + path, { method, redirect: 'error', signal: AbortSignal.timeout(60000), headers: { Authorization: `Bearer ${tokens[owner]}`, ...(body === undefined ? {} : { 'Content-Type': 'application/json' }), ...extra }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
  assert.equal(response.status, status, `Private file check: ${method} returned ${response.status}`);
  return response;
}
try {
  for (let n = 0; n < owners.length; n++) {
    const token = await new SignJWT({ sg: 0, sid: sessions[n] }).setProtectedHeader({ alg: 'HS256' }).setSubject(owners[n]!).setIssuer('https://api.getaux.co').setAudience('aux-desktop').setIssuedAt().setExpirationTime('15m').sign(new TextEncoder().encode(process.env.AUX_AUTH_SECRET));
    tokens.push(token);
    await sql`INSERT INTO aux_users(id,clerk_id,email,name) VALUES(${owners[n]},${'chunked_fixture:' + owners[n]},${owners[n] + '@example.invalid'},'Disposable private file fixture')`;
    await sql`INSERT INTO aux_sessions(id,user_id,access_hash,access_expires_at,expires_at,platform) VALUES(${sessions[n]},${owners[n]},${hash(token)},now()+interval '15 minutes',now()+interval '30 minutes','web')`;
  }
  const bytes = randomBytes(1024 * 1024);
  const intent = await (await call(0, '/attachments/intents', 201, 'POST', { name: 'synthetic.bin', contentType: 'application/octet-stream', size: bytes.length, sha256: hash(bytes) })).json();
  pathname = intent.pathname;
  const upload = await (await call(0, `/attachments/${intent.id}/upload-url`, 200, 'POST', {})).json();
  const uploaded = await fetch(upload.url, { method: 'PUT', headers: upload.headers, body: bytes, redirect: 'error', signal: AbortSignal.timeout(60000) });
  assert(uploaded.ok, 'Private synthetic upload failed');
  const observed = await get(pathname!, { access: 'private', useCache: false });
  assert(observed && observed.statusCode === 200);
  sourceChunked = !observed.headers.has('content-length');
  assert.equal(observed.blob.size, sourceChunked ? 0 : bytes.length);
  await observed.stream.cancel();
  await call(0, `/attachments/${intent.id}/commit`, 200, 'POST', {});
  const full = await call(0, `/attachments/${intent.id}/content`, 200);
  // Vercel may stream this API response without forwarding its Content-Length.
  // Validate any advertised value and always validate the actual bytes/hash.
  apiAdvertisedLength = full.headers.get('content-length');
  if (apiAdvertisedLength !== null) assert.equal(apiAdvertisedLength, String(bytes.length));
  assert.equal(hash(new Uint8Array(await full.arrayBuffer())), hash(bytes));
  const range = await call(0, `/attachments/${intent.id}/content`, 206, 'GET', undefined, { Range: 'bytes=4090-4137' });
  assert.deepEqual(Buffer.from(await range.arrayBuffer()), bytes.subarray(4090, 4138));
  await call(1, `/attachments/${intent.id}/content`, 404);
  await call(0, `/attachments/${intent.id}`, 200, 'DELETE');
  assert.equal(await get(pathname!, { access: 'private', useCache: false }), null);
  success = true;
} finally {
  if (pathname) await del(pathname);
  for (const owner of owners) {
    await sql`DELETE FROM aux_refresh_tokens WHERE session_id IN(SELECT id FROM aux_sessions WHERE user_id=${owner})`;
    await sql`DELETE FROM aux_sessions WHERE user_id=${owner}`;
    await sql`DELETE FROM aux_users WHERE id=${owner} AND clerk_id=${'chunked_fixture:' + owner}`;
  }
}
assert(success);
const proof = { checkedAt: new Date().toISOString(), origin, bytes: 1048576, sourceChunked, apiAdvertisedLength, sdkReportedZeroWhenLengthAbsent: sourceChunked, commitVerifiedBytesAndHash: true, fullReadHashMatches: true, rangedReadMatches: true, crossOwnerDenied: true, deletedContentUnavailable: true, fixtureRemoved: true, paidInference: false, productionActivated: false };
await writeFile('evidence/chunked-private-blob.json', JSON.stringify(proof, null, 2) + '\n');
console.log(JSON.stringify(proof));
