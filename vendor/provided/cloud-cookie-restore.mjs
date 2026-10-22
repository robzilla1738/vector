/** Read/decrypt only. Native application requires a separately verified profile binding. */
export const cloudCookieSnapshotHelpers = String.raw`
function auxCloudCookieSnapshot(value) {
  if (!value || value.formatVersion !== 1 || value.encryption !== 'none' || !Number.isSafeInteger(value.capturedAt) || value.capturedAt < 0 || !Array.isArray(value.cookies)) throw Error('Invalid cookie snapshot.');
  // The supplied1852 cookieEnvelopeSchema variable is never initialized. Reuse
  // its actual initialized cookieParamSchema and exact envelope structure.
  try { return {formatVersion:1,encryption:'none',capturedAt:value.capturedAt,cookies:value.cookies.map(cookie=>cookieParamSchema.parse(cookie))}; }
  catch { throw Error('Invalid cookie snapshot parameters.'); }
}
function auxCloudCookieMetadataValue(value) {
  if (!value || !Number.isSafeInteger(value.revision) || value.revision < 1 || !Number.isSafeInteger(value.generation) || value.generation < 0 || !Number.isSafeInteger(value.capturedAt) || value.capturedAt < 0 || !Number.isSafeInteger(value.size) || value.size < 0 || value.size > 2097152 || typeof value.sha256 !== 'string' || typeof value.objectSha256 !== 'string' || !Number.isSafeInteger(value.objectSize) || value.objectSize < 0 || value.objectSize > 3145728 || !/^[a-f0-9]{64}$/.test(value.sha256) || !/^[a-f0-9]{64}$/.test(value.objectSha256)) throw Error('Invalid encrypted cookie metadata.');
  return {revision:value.revision,generation:value.generation,capturedAt:value.capturedAt,size:value.size,objectSize:value.objectSize,sha256:value.sha256,objectSha256:value.objectSha256};
}
function auxCloudCookieAssertScope(accountId, scope) {
  if (auxCloudCookieScope(accountId) !== scope) throw Error('Account changed during encrypted cookie recovery.');
}
async function auxCloudReadCookieSnapshot(accountId) {
  const context = await auxCloudFileContext(accountId);
  const scope = JSON.stringify([accountId,context.userId,context.generation,AccountRegistry.getAccount(accountId)?.createdAt]);
  let plaintext;
  try {
    const metadata = await auxCloudCookieMetadata(accountId,scope);
    auxCloudCookieAssertScope(accountId,scope);
    if (!metadata) return null;
    if (metadata.generation !== context.generation) throw Error('Cookie backup key generation changed.');
    const response = await auxCloudCookieRequest(accountId,scope,'/drive/cookies/object?generation='+context.generation,{method:'GET',headers:{'If-Match':'"'+metadata.revision+'"'}});
    if (response.headers.get('X-Aux-Cookie-Revision') !== String(metadata.revision)) { await response.body?.cancel(); throw Error('Cookie backup revision changed.'); }
    const reader = response.body?.getReader();
    if (!reader) throw Error('Encrypted cookie backup body is unavailable.');
    const chunks = [];
    let size = 0;
    try {
      for (;;) {
        const next = await reader.read();
        if (next.done) break;
        size += next.value.byteLength;
        if (size > metadata.objectSize) { await reader.cancel(); throw Error('Encrypted cookie backup exceeds its declared size.'); }
        chunks.push(Buffer.from(next.value));
      }
    } finally { reader.releaseLock(); }
    auxCloudCookieAssertScope(accountId,scope);
    const bytes = Buffer.concat(chunks);
    if (bytes.length !== metadata.objectSize || sha256Hex(bytes) !== metadata.objectSha256) throw Error('Encrypted cookie backup hash mismatch.');
    let envelope;
    try { envelope = JSON.parse(bytes.toString('utf8')); } catch { throw Error('Invalid encrypted cookie envelope.'); }
    if (!envelope || Object.keys(envelope).sort().join(',') !== 'alg,ciphertext,nonce,tag,version' || envelope.version !== 1 || envelope.alg !== 'aes-256-gcm' || typeof envelope.nonce !== 'string' || typeof envelope.ciphertext !== 'string' || typeof envelope.tag !== 'string' || !/^[A-Za-z0-9+/]{16}$/.test(envelope.nonce) || !/^[A-Za-z0-9+/]*={0,2}$/.test(envelope.ciphertext) || !/^[A-Za-z0-9+/]{22}==$/.test(envelope.tag)) throw Error('Invalid encrypted cookie envelope.');
    const nonce = Buffer.from(envelope.nonce,'base64'), tag = Buffer.from(envelope.tag,'base64');
    if (nonce.toString('base64') !== envelope.nonce || tag.toString('base64') !== envelope.tag) throw Error('Noncanonical encrypted cookie envelope.');
    const ciphertext = Buffer.from(envelope.ciphertext,'base64');
    if (ciphertext.length !== metadata.size || ciphertext.toString('base64') !== envelope.ciphertext) throw Error('Encrypted cookie backup length mismatch.');
    const {createDecipheriv} = await import('node:crypto');
    const decipher = createDecipheriv('aes-256-gcm',context.key,nonce);
    decipher.setAAD(Buffer.from(JSON.stringify(['aux.cookie-snapshot.v1',context.userId,context.generation])));
    decipher.setAuthTag(tag);
    let unverified, tail;
    try {
      unverified = decipher.update(ciphertext);
      tail = decipher.final();
      plaintext = Buffer.concat([unverified,tail]);
    } catch { throw Error('Cookie backup authentication failed.'); }
    finally { unverified?.fill(0); tail?.fill(0); }
    if (plaintext.length !== metadata.size || sha256Hex(plaintext) !== metadata.sha256) throw Error('Cookie backup plaintext hash mismatch.');
    let decoded;
    try { decoded = JSON.parse(plaintext.toString('utf8')); } catch { throw Error('Invalid cookie snapshot.'); }
    const snapshot = auxCloudCookieSnapshot(decoded);
    if (snapshot.capturedAt !== metadata.capturedAt) throw Error('Cookie backup capture metadata changed.');
    auxCloudCookieAssertScope(accountId,scope);
    return {snapshot,metadata,userId:context.userId,generation:context.generation};
  } finally { plaintext?.fill(0); context.key.fill(0); }
}
`;
