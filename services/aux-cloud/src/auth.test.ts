import assert from 'node:assert/strict';
import { createHash, generateKeyPairSync } from 'node:crypto';
import test from 'node:test';
import { authRoutes, validateDevice } from './auth';

test('installation fingerprint is checked against exact P-256 public bytes',()=>{
  const {publicKey}=generateKeyPairSync('ec',{namedCurve:'prime256v1'});
  const jwk=publicKey.export({format:'jwk'});
  const bytes=Buffer.concat([Buffer.from([4]),Buffer.from(jwk.x!,'base64url'),Buffer.from(jwk.y!,'base64url')]);
  const device={platform:'macos' as const,installationScheme:'p256_v1' as const,ikSigPublicKeyJwk:jwk as Record<string,unknown>,ikSigKeyFingerprint:`sha256:${createHash('sha256').update(bytes).digest('hex')}`};
  assert.equal(validateDevice(device),device);
  assert.throws(()=>validateDevice({...device,ikSigKeyFingerprint:`sha256:${'0'.repeat(64)}`}));
  assert.throws(()=>validateDevice({...device,ikSigPublicKeyJwk:{...jwk,x:'AQ'}}));
});
test('ML-DSA device keys must have actual ML-DSA-65 length',()=>{
  assert.throws(()=>validateDevice({platform:'macos',installationScheme:'pq_v1',ikSigKeyFingerprint:`sha256:${'0'.repeat(64)}`,ikSigPublicKeyJwk:{kty:'RAW',alg:'ML-DSA-65',public_key_b64:Buffer.alloc(64).toString('base64')}}));
});
test('device approval and profile changes reject unauthenticated requests before querying data',async()=>{
  for(const path of ['/device-code/decide','/me','/devices/550e8400-e29b-41d4-a716-446655440000/signout']){
    const response=await authRoutes.request(path,{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});
    assert.equal(response.status,401,path);
    assert.equal((await response.json()).code,'ACCESS_TOKEN_INVALID');
  }
});
test('email verification rejects malformed codes before provider or database calls',async()=>{
  const response=await authRoutes.request('/email/verify-code',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'test@example.com',code:'123'})});
  assert.equal(response.status,400);
  assert.equal((await response.json()).code,'INVALID_REQUEST');
});
test('token exchange cannot accept an email-only identity claim',async()=>{
  const response=await authRoutes.request('/token/exchange',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'test@example.com'})});
  assert.equal(response.status,400);
});

test('Clerk webhook rejects forged signatures without touching persistence',async()=>{
  const {authWebhooks}=await import('./auth');
  const previous=process.env.CLERK_WEBHOOK_SIGNING_SECRET;
  process.env.CLERK_WEBHOOK_SIGNING_SECRET=`whsec_${Buffer.alloc(32,7).toString('base64')}`;
  try{
    const response=await authWebhooks.request('/',{method:'POST',headers:{'Content-Type':'application/json','svix-id':'msg_forged','svix-timestamp':String(Math.floor(Date.now()/1000)),'svix-signature':'v1,not-a-real-signature'},body:JSON.stringify({type:'user.deleted',data:{id:'user_fake'}})});
    assert.equal(response.status,400);
  }finally{if(previous===undefined)delete process.env.CLERK_WEBHOOK_SIGNING_SECRET;else process.env.CLERK_WEBHOOK_SIGNING_SECRET=previous;}
});

test('refresh retry cache encrypts token replies and rejects a different session/context or tampering',async()=>{
  const {sealRotationReply,openRotationReply}=await import('./auth');
  const previous=process.env.AUX_AUTH_SECRET;
  process.env.AUX_AUTH_SECRET='disposable-auth-cache-fixture-secret-32-bytes';
  try{
    const response={accessToken:'disposable-access-token-with-private-value',refreshToken:'disposable-refresh-token-with-private-value',expiresIn:900};
    const binding='old-token-hash:session-id:context-hash';
    const sealed=sealRotationReply(response,binding);
    assert.equal(sealed.includes(response.accessToken),false);
    assert.equal(sealed.includes(response.refreshToken),false);
    assert.deepEqual(openRotationReply(sealed,binding),response);
    assert.throws(()=>openRotationReply(sealed,'old-token-hash:other-session:context-hash'));
    assert.throws(()=>openRotationReply(sealed,'old-token-hash:session-id:different-context'));
    const parts=sealed.split('.'),cipher=Buffer.from(parts[2],'base64url');cipher[0]^=1;parts[2]=cipher.toString('base64url');
    assert.throws(()=>openRotationReply(parts.join('.'),binding));
  }finally{if(previous===undefined)delete process.env.AUX_AUTH_SECRET;else process.env.AUX_AUTH_SECRET=previous;}
});

test('a committed rotation recovers a lost response only within ten seconds and before a newer rotation',async()=>{
  const {sealRotationReply,recoverRotationReply,tokenHash}=await import('./auth');
  const previous=process.env.AUX_AUTH_SECRET;
  process.env.AUX_AUTH_SECRET='disposable-lost-response-fixture-secret-32';
  try{
    const reply={accessToken:'valid-fixture-access-token-opaque-value',refreshToken:'valid-fixture-refresh-token-opaque-value',expiresIn:900};
    const row={id:'session-id',used_at:new Date(),access_expires_at:new Date(Date.now()+900000),access_hash:tokenHash(reply.accessToken),rotation_context_hash:'context',rotation_reply:sealRotationReply(reply,'old-hash:session-id:context')};
    const recovered=await recoverRotationReply(row,'old-hash','context');
    assert.equal(recovered?.accessToken,reply.accessToken);
    assert.equal(recovered?.refreshToken,reply.refreshToken);
    assert.ok(recovered!.expiresIn<=900&&recovered!.expiresIn>=898);
    assert.equal(await recoverRotationReply({...row,used_at:new Date(Date.now()-11000)},'old-hash','context'),null);
    assert.equal(await recoverRotationReply(row,'old-hash','other-context'),null);
    assert.equal(await recoverRotationReply({...row,access_hash:'superseding-token-hash'},'old-hash','context'),null);
  }finally{if(previous===undefined)delete process.env.AUX_AUTH_SECRET;else process.env.AUX_AUTH_SECRET=previous;}
});

test('expired Aux access tokens trigger the supplied refresh code without falling through to Clerk',async()=>{
  const {SignJWT}=await import('jose');
  const previous=process.env.AUX_AUTH_SECRET;
  process.env.AUX_AUTH_SECRET='disposable-expired-token-fixture-key-32';
  try{
    const token=await new SignJWT({sid:'fixture',sg:0}).setProtectedHeader({alg:'HS256'}).setSubject('fixture').setIssuer('https://api.getaux.co').setAudience('aux-desktop').setExpirationTime(Math.floor(Date.now()/1000)-20).sign(new TextEncoder().encode(process.env.AUX_AUTH_SECRET));
    const response=await authRoutes.request('/me',{headers:{Authorization:`Bearer ${token}`}});
    assert.equal(response.status,401);assert.equal((await response.json()).code,'ACCESS_TOKEN_EXPIRED');
  }finally{if(previous===undefined)delete process.env.AUX_AUTH_SECRET;else process.env.AUX_AUTH_SECRET=previous;}
});
