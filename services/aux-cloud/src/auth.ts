import { createHash, createHmac, createCipheriv, createDecipheriv, randomBytes, randomInt, randomUUID, timingSafeEqual } from 'node:crypto';
import { isIPv4, isIPv6 } from 'node:net';
import { createClerkClient, verifyToken } from '@clerk/backend';
import { Hono, type Context } from 'hono';
import { SignJWT, jwtVerify, decodeProtectedHeader, errors as joseErrors, type JWTPayload } from 'jose';
import { verifyWebhook } from '@clerk/backend/webhooks';
import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';
import { z } from 'zod';
import { sql } from './db';
import { TERMS_VERSION } from './legal';
import { logEvent, safeLabel } from './log';

export type AuthUser = { id: string; clerkId: string; email: string; sessionId: string };
export type AuthVariables = { user: AuthUser; requestId?: string };
type AuthEnv = { Variables: AuthVariables };
type Row = Record<string, any>;
class AuthInputError extends Error {}
class AuthIdentityError extends Error {}
const ACCESS_SECONDS = 900;
const REFRESH_DAYS = 30;
const emailSchema = z.string().trim().email().max(254).transform(v => v.toLowerCase());
export const deviceSchema = z.object({
  appVersion: z.string().max(80).optional(), deviceName: z.string().max(200).optional(),
  platform: z.enum(['macos','windows','ios','android','cli','web']),
  installationScheme: z.enum(['p256_v1','pq_v1']),
  ikSigPublicKeyJwk: z.record(z.string(), z.unknown()),
  ikSigKeyFingerprint: z.string().regex(/^sha256:[a-f0-9]{64}$/),
});
type Device = z.infer<typeof deviceSchema>;
const clerk = () => createClerkClient({ secretKey: required('CLERK_SECRET_KEY') });
function required(key: string) { const value = process.env[key]; if (!value) throw new Error(`${key} is not configured`); return value; }
function pepper() { const key = required('AUX_AUTH_SECRET'); if (key.length < 32) throw new Error('AUX_AUTH_SECRET must contain at least 32 characters'); return key; }
export const tokenHash = (value: string) => createHash('sha256').update(value).digest('hex');
const opaque = () => randomBytes(32).toString('base64url');
const ownIssuer = 'https://api.getaux.co';
async function accessToken(user: Row, sessionId: string) {
  return new SignJWT({sg:Number(user.sync_generation),sid:sessionId}).setProtectedHeader({alg:'HS256',typ:'JWT'}).setSubject(user.id).setJti(randomUUID()).setIssuer(ownIssuer).setAudience('aux-desktop').setIssuedAt().setExpirationTime(`${ACCESS_SECONDS}s`).sign(new TextEncoder().encode(pepper()));
}
async function clerkIdentity(token: string) {
  const origins=(process.env.CLERK_AUTHORIZED_PARTIES||process.env.NEXT_PUBLIC_APP_URL||'').split(',').map(v=>v.trim()).filter(Boolean);
  if (!origins.length) throw new Error('Clerk authorized parties must be configured');
  const claims=await verifyToken(token,{secretKey:required('CLERK_SECRET_KEY'),authorizedParties:origins});
  if (!claims.sub||typeof claims.sid!=='string') throw new Error('Invalid Clerk session');
  const client=clerk(), session=await client.sessions.getSession(claims.sid);
  if (session.status!=='active'||session.userId!==claims.sub) throw new Error('Inactive Clerk session');
  return { user:await client.users.getUser(claims.sub), sessionId:claims.sid };
}
const secretHash = (purpose: string, value: string) => createHmac('sha256', pepper()).update(`${purpose}\0${value}`).digest('hex');
export type RotationReply={accessToken:string;refreshToken:string;expiresIn:number};
function rotationKey() {return createHmac('sha256',pepper()).update('aux.refresh-response.aes-gcm.v1').digest();}
/** Ciphertext is authenticated to its exact refresh/session/context tuple. */
export function sealRotationReply(reply:RotationReply,binding:string) {
  const iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',rotationKey(),iv);
  cipher.setAAD(Buffer.from(binding));
  const encrypted=Buffer.concat([cipher.update(JSON.stringify(reply),'utf8'),cipher.final()]);
  return ['v1',iv.toString('base64url'),encrypted.toString('base64url'),cipher.getAuthTag().toString('base64url')].join('.');
}
export function openRotationReply(sealed:string,binding:string):RotationReply {
  const parts=sealed.split('.');
  if(parts.length!==4||parts[0]!=='v1')throw new Error('Invalid cached rotation reply');
  const iv=Buffer.from(parts[1],'base64url'),tag=Buffer.from(parts[3],'base64url');
  if(iv.length!==12||tag.length!==16)throw new Error('Invalid cached rotation reply');
  const decipher=createDecipheriv('aes-256-gcm',rotationKey(),iv);decipher.setAAD(Buffer.from(binding));decipher.setAuthTag(tag);
  const plain=Buffer.concat([decipher.update(Buffer.from(parts[2],'base64url')),decipher.final()]);
  return z.object({accessToken:z.string().min(20).max(4096),refreshToken:z.string().min(20).max(256),expiresIn:z.number().int().positive().max(ACCESS_SECONDS)}).parse(JSON.parse(plain.toString('utf8')));
}
const rotationContext=(c:Context,device:Device|null)=>secretHash('refresh-context',`${device?.ikSigKeyFingerprint??'unbound'}\0${c.req.header('user-agent')??''}`);
const rotationBinding=(token:string,session:string,context:string)=>`${token}:${session}:${context}`;
export async function recoverRotationReply(row:Row,oldHash:string,context:string) {
  if(!row.rotation_reply||row.rotation_context_hash!==context||Date.now()-new Date(row.used_at).getTime()>10_000)return null;
  let reply;try{reply=openRotationReply(row.rotation_reply,rotationBinding(oldHash,row.id,context));}catch{return null;}
  // A later rotation supersedes this cached result; do not resurrect it.
  if(tokenHash(reply.accessToken)!==row.access_hash)return null;
  return {...reply,expiresIn:Math.max(1,Math.floor((new Date(row.access_expires_at).getTime()-Date.now())/1000))};
}

const error = (c: Context, message: string, code = 'UNAUTHORIZED', status: 400 | 401 | 403 | 404 | 409 | 429 | 503 = 401) => c.json({ error: message, code }, status);
async function input<T>(c: Context, schema: z.ZodType<T>): Promise<T> {
  let body; try { body=await c.req.json(); } catch { throw new AuthInputError('Invalid JSON'); }
  return schema.parse(body);
}
function ip(c: Context) { return c.req.header('x-vercel-forwarded-for')?.split(',')[0]?.trim() || c.req.header('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'; }
function ipv6Groups(address: string) {
  const [left, right] = address.includes('::') ? address.split('::') : [address, ''];
  const part = (text: string) => text ? text.split(':').flatMap(g => g.includes('.') ? (([a,b,c,d]) => [(a<<8|b).toString(16),(c<<8|d).toString(16)])(g.split('.').map(Number)) : [parseInt(g,16).toString(16)]) : [];
  const head = part(left), tail = part(right);
  return [...head, ...Array(8 - head.length - tail.length).fill('0'), ...tail];
}
/** Rate-limit identities for a client: one subscriber (IPv4 address, IPv6 /64) and its network (IPv4 /24, IPv6 /48). */
export function clientNetworks(address: string) {
  const v4 = address.replace(/^::ffff:/i, '');
  if (isIPv4(v4)) return { address: v4, network: v4.split('.').slice(0,3).join('.') + '.0/24' };
  if (isIPv6(address)) { const g = ipv6Groups(address.split('%')[0]); return { address: g.slice(0,4).join(':') + '::/64', network: g.slice(0,3).join(':') + '::/48' }; }
  return { address: 'unknown', network: 'unknown' };
}
/** Atomic fixed-window counter; identifiers are HMACs, never raw email/IP values. */
async function hit(key: string, seconds: number) {
  const bucket = Math.floor(Date.now() / (seconds * 1000));
  const rows = await sql`INSERT INTO aux_rate_limits(key,window_start,expires_at) VALUES (${secretHash('rate',key)},${bucket},now()+${seconds}*interval '1 second')
    ON CONFLICT(key,window_start) DO UPDATE SET attempts=aux_rate_limits.attempts+1 RETURNING attempts`;
  return { attempts: Number(rows[0]?.attempts), retryAfter: Math.max(1, Math.ceil(((bucket + 1) * seconds * 1000 - Date.now()) / 1000)) };
}
export async function rateLimit(key: string, limit: number, seconds: number) { return (await hit(key, seconds)).attempts <= limit; }
type Limit = readonly [name: string, subject: string, limit: number, seconds: number];
/** Checks in order and stops at the first refusal, so a client already over its own budget
 * cannot also spend the budget of the address it targets. Returns the refusal, if any. */
async function firstExceeded(limits: readonly Limit[]) {
  for (const [name, subject, limit, seconds] of limits) {
    const result = await hit(`${name}:${subject}`, seconds);
    if (result.attempts > limit) return { name, retryAfter: result.retryAfter };
  }
  return null;
}
function limited(c: Context, refusal: { name: string; retryAfter: number }, message: string) {
  logEvent('warn', c, 'aux.auth.rate_limited', { limit: refusal.name });
  c.header('Retry-After', String(refusal.retryAfter));
  return error(c, message, 'RATE_LIMITED', 429);
}
/** Validate the fingerprint against the actual installation public-key bytes. */
export function validateDevice(device: Device | undefined) {
  if (!device) return null;
  let bytes: Buffer;
  if (device.installationScheme === 'p256_v1') {
    const key = z.object({ kty: z.literal('EC'), crv: z.literal('P-256'), x: z.string(), y: z.string() }).parse(device.ikSigPublicKeyJwk);
    const x = Buffer.from(key.x,'base64url'), y = Buffer.from(key.y,'base64url');
    if (x.length !== 32 || y.length !== 32) throw new AuthInputError('Invalid installation public key');
    bytes = Buffer.concat([Buffer.from([4]),x,y]);
  } else {
    const key = z.object({ kty: z.literal('RAW'), alg: z.literal('ML-DSA-65'), public_key_b64: z.string() }).parse(device.ikSigPublicKeyJwk);
    bytes = Buffer.from(key.public_key_b64,'base64');
    if (bytes.length !== 1952) throw new AuthInputError('Invalid installation public key');
  }
  if (`sha256:${createHash('sha256').update(bytes).digest('hex')}` !== device.ikSigKeyFingerprint) throw new AuthInputError('Installation fingerprint mismatch');
  return device;
}
/** Creates the Aux account on first sight. Web sign-up shows the terms and age statement before
 * Clerk creates the user, so `webConsent` records them; desktop email sign-up records its own consent. */
async function mapUser(user: { id: string; emailAddresses: {id:string;emailAddress:string;verification: {status:string} | null}[]; primaryEmailAddressId: string | null; firstName: string | null; lastName: string | null; imageUrl: string; banned: boolean; locked: boolean }, verifiedEmail?: string, webConsent = true) {
  if (user.banned || user.locked) throw new AuthIdentityError('Account is not available');
  const email = user.emailAddresses.find(e => verifiedEmail ? e.emailAddress.toLowerCase() === verifiedEmail : e.id === user.primaryEmailAddressId);
  if (!email || email.verification?.status !== 'verified') throw new AuthIdentityError('Verified email address required');
  let rows;
  try {
    // Touch the row only when the email changed: updated_at drives "account changed" events.
    const consentAt = webConsent ? new Date() : null;
    rows = await sql`INSERT INTO aux_users(clerk_id,email,name,terms_version,terms_accepted_at,age_confirmed_at) VALUES (${user.id},${email.emailAddress.toLowerCase()},${[user.firstName,user.lastName].filter(Boolean).join(' ')},${webConsent ? TERMS_VERSION : null},${consentAt},${consentAt})
      ON CONFLICT(clerk_id) DO UPDATE SET email=excluded.email,updated_at=now() WHERE aux_users.deleted_at IS NULL AND aux_users.email IS DISTINCT FROM excluded.email RETURNING *`;
  } catch (cause) {
    if ((cause as {code?:string}).code === '23505') throw new AuthIdentityError('Email belongs to another Aux account');
    throw cause;
  }
  if (!rows[0]) rows = await sql`SELECT * FROM aux_users WHERE clerk_id=${user.id} AND deleted_at IS NULL`;
  if (!rows[0]) throw new AuthIdentityError('Account was deleted');
  return rows[0] as Row;
}
async function issueSession(user: Row, device: Device | null, provider: 'email' | 'google' = 'email', clerkSessionId: string | null = null) {
  const sessionId=randomUUID(), access=await accessToken(user,sessionId), refresh=opaque();
  const rows = await sql`WITH session AS (
    INSERT INTO aux_sessions(id,user_id,access_hash,access_expires_at,expires_at,device_fingerprint,device_name,platform,app_version,device_public_key,clerk_session_id)
    VALUES (${sessionId},${user.id},${tokenHash(access)},now()+${ACCESS_SECONDS}*interval '1 second',now()+${REFRESH_DAYS}*interval '1 day',${device?.ikSigKeyFingerprint ?? null},${device?.deviceName ?? null},${device?.platform ?? 'web'},${device?.appVersion ?? null},${JSON.stringify(device?.ikSigPublicKeyJwk ?? null)}::jsonb,${clerkSessionId}) RETURNING id
    ) INSERT INTO aux_refresh_tokens(token_hash,session_id) SELECT ${tokenHash(refresh)},id FROM session RETURNING session_id`;
  if (!rows[0]) throw new Error('Could not create session');
  return { user: { id: user.id, email: user.email, onboardingCompletedAt: user.onboarding_completed_at ?? null }, accessToken: access, refreshToken: refresh, expiresIn: ACCESS_SECONDS, provider };
}
export const requireUser = createMiddleware<AuthEnv>(async (c,next) => {
  const value = c.req.header('authorization');
  if (!value?.startsWith('Bearer ') || value.length > 4096) return error(c,'Sign in to continue.','ACCESS_TOKEN_INVALID');
  const token=value.slice(7);
  let own: {payload: JWTPayload} | undefined;
  try { own=await jwtVerify(token,new TextEncoder().encode(pepper()),{issuer:ownIssuer,audience:'aux-desktop',algorithms:['HS256']}); } catch(cause) {
    if(cause instanceof joseErrors.JWTExpired)return error(c,'Session expired.','ACCESS_TOKEN_EXPIRED');
    // Header inspection only chooses a denial path; it never authorizes. An
    // invalid Aux/capability MAC must not fall through to Clerk or fetch JWKS.
    try{if(decodeProtectedHeader(token).alg==='HS256')return error(c,'Sign in to continue.','ACCESS_TOKEN_INVALID');}catch{ /* Malformed tokens are rejected by Clerk's verifier below. */ }
  }
  if (own) {
    const rows = await sql`SELECT s.id AS session_id,u.id,u.clerk_id,u.email,u.sync_generation,s.access_expires_at FROM aux_sessions s JOIN aux_users u ON u.id=s.user_id
      WHERE s.access_hash=${tokenHash(token)} AND s.revoked_at IS NULL AND s.expires_at>now() AND u.deleted_at IS NULL`;
    const row=rows[0];
    if (!row||own.payload.sub!==row.id||own.payload.sid!==row.session_id) return error(c,'Sign in to continue.','ACCESS_TOKEN_INVALID');
    if (own.payload.sg!==Number(row.sync_generation)) return error(c,'Session claims changed. Refresh your session.','ACCESS_TOKEN_STALE_CLAIMS');
    if (new Date(row.access_expires_at).getTime()<=Date.now()) return error(c,'Session expired.','ACCESS_TOKEN_EXPIRED');
    c.set('user',{id:row.id,clerkId:row.clerk_id,email:row.email,sessionId:row.session_id});
  } else {
    // Portal sessions are never accepted by decoding alone: verify signature,
    // authorized party, active Clerk session and verified account identity.
    let identity;
    try { identity=await clerkIdentity(token); } catch { return error(c,'Sign in to continue.','ACCESS_TOKEN_INVALID'); }
    let row;try{row=await mapUser(identity.user);}catch(cause){if(cause instanceof AuthIdentityError)return error(c,'This account cannot sign in.','ACCOUNT_UNAVAILABLE',403);throw cause;}
    c.set('user',{id:row.id,clerkId:row.clerk_id,email:row.email,sessionId:`clerk:${identity.sessionId}`});
  }
  await next();
});
// Keys, files and sessions belong to a bound desktop installation, never a web sign-in.
export const requireInstallation = createMiddleware<AuthEnv>(async (c,next) => {
  if (c.get('user').sessionId.startsWith('clerk:')) return error(c,'Use an installation-authenticated desktop session.','DEVICE_REQUIRED',403);
  await next();
});
export const authRoutes = new Hono<AuthEnv>();
authRoutes.use('*',async(c,next)=>{c.header('Cache-Control','no-store');await next();});
authRoutes.onError((err,c) => {
  if(err instanceof HTTPException)return c.json({error:err.message,code:'REQUEST_REJECTED'},err.status);
  if (err instanceof AuthIdentityError)return error(c,'This account cannot sign in.','ACCOUNT_UNAVAILABLE',403);
  if (err instanceof z.ZodError || err instanceof AuthInputError) return error(c,'Invalid request.','INVALID_REQUEST',400);
  // Provider/database errors may contain identifiers; never relay or log their raw messages.
  logEvent('error',c,'aux.auth.request_failed',{name:safeLabel(err.name),kind:safeLabel(err.constructor.name),providerStatus:(({status})=>typeof status==='number'?status:undefined)(err as {status?:unknown})});
  return error(c,'Authentication is temporarily unavailable. Please try again.','AUTH_UNAVAILABLE',503);
});

// Sign-in mail limits, cheapest refusal first: the client's address, its network, then the
// recipient (a one-minute cooldown, an hourly and a daily cap). The Vercel Firewall rate rule
// in docs/operations.md sits in front of these.
export const OTP_SEND_LIMITS = { address: [15, 3600], addressDay: [40, 86400], network: [60, 3600], cooldown: [1, 60], email: [5, 3600], emailDay: [10, 86400] } as const;
export const OTP_VERIFY_LIMITS = { address: [30, 600], network: [120, 600] } as const;
// No global cap: one would let a distributed attack lock everyone out. Crossing this volume
// logs an alert instead; the Firewall and Resend's own limits bound the cost.
export const OTP_ALERT_PER_HOUR = 1000;
const L = OTP_SEND_LIMITS, V = OTP_VERIFY_LIMITS;
authRoutes.post('/email/start', async c => {
  const body = await input(c,z.object({email:emailSchema,accountId:z.number().int().nonnegative().optional(),intent:z.string().max(40).optional(),signInAttemptId:z.string().uuid().optional()}));
  const from = clientNetworks(ip(c));
  const refusal = await firstExceeded([['otp-ip',from.address,...L.address],['otp-ip-day',from.address,...L.addressDay],['otp-net',from.network,...L.network],
    ['otp-resend',body.email,...L.cooldown],['otp-email',body.email,...L.email],['otp-email-day',body.email,...L.emailDay]]);
  if (refusal) return limited(c,refusal,'Please wait before requesting another code.');
  const sent = (await hit('otp-global',3600)).attempts;
  if (sent % OTP_ALERT_PER_HOUR === 0) logEvent('error',c,'aux.auth.otp_volume_alert',{sentThisHour:sent,threshold:OTP_ALERT_PER_HOUR});
  const code = String(randomInt(0,1_000_000)).padStart(6,'0');
  const hash = secretHash('otp',`${body.email}:${code}`);
  await sql`INSERT INTO aux_email_challenges(email,code_hash,expires_at) VALUES (${body.email},${hash},now()+interval '10 minutes')
    ON CONFLICT(email) DO UPDATE SET code_hash=excluded.code_hash,expires_at=excluded.expires_at,attempts=0,delivered_at=NULL,consumed_at=NULL,created_at=now()`;
  const response = await fetch('https://api.resend.com/emails',{ method:'POST', headers:{Authorization:`Bearer ${required('RESEND_API_KEY')}`,'Content-Type':'application/json'},
    body:JSON.stringify({from:required('RESEND_FROM'),to:[body.email],reply_to:'hello@getaux.co',subject:'Your Aux sign-in code',text:`Your Aux sign-in code is ${code}. It expires in 10 minutes. If you did not request this code, ignore this email.`}),signal:AbortSignal.timeout(15000)});
  if (!response.ok) {
    logEvent('error',c,'aux.auth.email_send_failed',{providerStatus:response.status});
    await sql`DELETE FROM aux_email_challenges WHERE email=${body.email} AND code_hash=${hash}`; return error(c,'Could not send the code. Please try again.','EMAIL_UNAVAILABLE',503);
  }
  await sql`UPDATE aux_email_challenges SET delivered_at=now() WHERE email=${body.email} AND code_hash=${hash}`;
  return c.json({email:body.email,requiresEmailVerification:true,...body.signInAttemptId?{signInAttemptId:body.signInAttemptId}:{}});
});
authRoutes.post('/email/verify-code',async c => {
  // consent: the desktop sign-in screen's terms link and age confirmation. See docs/auth-contract.md.
  const body = await input(c,z.object({email:emailSchema,code:z.string().regex(/^\d{6}$/),accountId:z.number().int().nonnegative().optional(),device:deviceSchema.optional(),
    consent:z.object({termsVersion:z.string().max(40),ageConfirmed:z.literal(true)}).strict().optional()}));
  if (body.consent && body.consent.termsVersion!==TERMS_VERSION) return error(c,'The terms have changed. Review them and try again.','TERMS_CHANGED',409);
  const from = clientNetworks(ip(c));
  const refusal = await firstExceeded([['otp-verify',from.address,...V.address],['otp-verify-net',from.network,...V.network]]);
  if (refusal) return limited(c,refusal,'Too many attempts. Request a new code later.');
  const device = validateDevice(body.device);
  const hash = secretHash('otp',`${body.email}:${body.code}`);
  // Every attempt increments atomically. Matching code can be consumed exactly once.
  const rows = await sql`UPDATE aux_email_challenges SET attempts=attempts+1,consumed_at=CASE WHEN code_hash=${hash} THEN now() ELSE consumed_at END
    WHERE email=${body.email} AND consumed_at IS NULL AND delivered_at IS NOT NULL AND expires_at>now() AND attempts<5 RETURNING code_hash`;
  if (!rows[0] || !timingSafeEqual(Buffer.from(rows[0].code_hash),Buffer.from(hash))) return error(c,'Invalid or expired verification code.','INVALID_CODE',400);
  const client = clerk();
  const matches = await client.users.getUserList({emailAddress:[body.email],limit:2});
  let user = matches.data[0];
  if (matches.data.length>1) return error(c,'Use the account portal to sign in.','HOSTED_SIGN_IN_REQUIRED',403);
  if (user && (user.twoFactorEnabled || user.banned || user.locked)) return error(c,'Use the account portal to complete secure sign-in.','HOSTED_SIGN_IN_REQUIRED',403);
  if (!user) user = await client.users.createUser({emailAddress:[body.email],skipPasswordRequirement:true});
  else {
    const address = user.emailAddresses.find(e=>e.emailAddress.toLowerCase()===body.email);
    if (!address) return error(c,'Use the account portal to sign in.','HOSTED_SIGN_IN_REQUIRED',403);
    if (address.verification?.status!=='verified') {
      await client.emailAddresses.updateEmailAddress(address.id,{verified:true});
      user = await client.users.getUser(user.id);
    }
  }
  const account = await mapUser(user,body.email,false);
  // Record the terms version and age confirmation the person accepted, or leave the account without one.
  if (body.consent) await sql`UPDATE aux_users SET terms_version=${TERMS_VERSION},terms_accepted_at=now(),age_confirmed_at=now() WHERE id=${account.id} AND terms_version IS DISTINCT FROM ${TERMS_VERSION}`;
  else if (!account.terms_version) logEvent('warn',c,'aux.auth.consent_missing');
  return c.json(await issueSession(account,device));
});

authRoutes.post('/token/exchange', async c => {
  const body = await input(c,z.object({supabaseAccessToken:z.string().min(1).max(16384),authProtocol:z.literal(2).optional(),accountId:z.number().int().optional(),device:deviceSchema.optional(),oauthAttemptToken:z.string().max(500).optional()}));
  if (!await rateLimit(`exchange:${ip(c)}`,30,600)) return error(c,'Too many requests.','RATE_LIMITED',429);
  const device = validateDevice(body.device);
  let identity;
  try { identity=await clerkIdentity(body.supabaseAccessToken); } catch { return error(c,'Invalid sign-in session.','ACCESS_TOKEN_INVALID'); }
  return c.json(await issueSession(await mapUser(identity.user),device,identity.user.externalAccounts.some(a=>a.provider==='oauth_google')?'google':'email',identity.sessionId));
});
authRoutes.post('/token/refresh',async c => {
  const body=await input(c,z.object({refreshToken:z.string().min(20).max(256),device:deviceSchema.optional()}));
  if (!await rateLimit(`refresh:${ip(c)}`,120,60)) return error(c,'Too many requests.','RATE_LIMITED',429);
  const device=validateDevice(body.device), oldHash=tokenHash(body.refreshToken);
  const found=await sql`SELECT s.*,r.used_at,r.rotation_reply,r.rotation_context_hash,u.deleted_at,u.sync_generation,u.clerk_id FROM aux_refresh_tokens r JOIN aux_sessions s ON s.id=r.session_id JOIN aux_users u ON u.id=s.user_id WHERE r.token_hash=${oldHash}`;
  const row=found[0];
  if (!row || row.revoked_at || row.deleted_at || new Date(row.expires_at).getTime()<=Date.now()) return error(c,'Refresh token expired or revoked.','REFRESH_TOKEN_REVOKED');
  // Verify the original installation before considering a cached result.
  if ((row.device_fingerprint??null)!==(device?.ikSigKeyFingerprint??null)) return error(c,'Token device mismatch.','REFRESH_TOKEN_DEVICE_MISMATCH');
  const context=rotationContext(c,device);
  if (row.used_at) {
    const replay=await recoverRotationReply(row,oldHash,context);
    if(replay)return c.json(replay);
    await sql`UPDATE aux_sessions SET revoked_at=now() WHERE family_id=${row.family_id}`;
    return error(c,'Refresh token was reused. Sign in again.','REFRESH_TOKEN_COMPROMISED');
  }
  let account;
  try{account=await clerk().users.getUser(row.clerk_id);}catch(cause){
    if((cause as {status?:number}).status===404){await sql`UPDATE aux_sessions SET revoked_at=now() WHERE user_id=${row.user_id}`;return error(c,'Account no longer exists.','REFRESH_TOKEN_REVOKED');}
    throw cause;
  }
  if(row.clerk_session_id){
    let linked;try{linked=await clerk().sessions.getSession(row.clerk_session_id);}catch(cause){
      if((cause as {status?:number}).status===404){await sql`UPDATE aux_sessions SET revoked_at=now() WHERE id=${row.id}`;return error(c,'Session was revoked.','REFRESH_TOKEN_REVOKED');}
      throw cause;
    }
    if(linked.status!=='active'||linked.userId!==row.clerk_id){await sql`UPDATE aux_sessions SET revoked_at=now() WHERE id=${row.id}`;return error(c,'Session was revoked.','REFRESH_TOKEN_REVOKED');}
  }
  if(account.banned||account.locked){ await sql`UPDATE aux_sessions SET revoked_at=now() WHERE user_id=${row.user_id}`; return error(c,'Account is unavailable.','REFRESH_TOKEN_REVOKED'); }
  const access=await accessToken({id:row.user_id,sync_generation:row.sync_generation},row.id),refresh=opaque();
  const reply={accessToken:access,refreshToken:refresh,expiresIn:ACCESS_SECONDS};
  const cached=sealRotationReply(reply,rotationBinding(oldHash,row.id,context));
  const rotated=await sql`WITH consumed AS (
      UPDATE aux_refresh_tokens SET used_at=now(),rotation_reply=${cached},rotation_context_hash=${context} WHERE token_hash=${oldHash} AND used_at IS NULL RETURNING session_id
    ), updated AS (
      UPDATE aux_sessions SET access_hash=${tokenHash(access)},access_expires_at=now()+${ACCESS_SECONDS}*interval '1 second',last_seen_at=now()
      WHERE id IN (SELECT session_id FROM consumed) AND revoked_at IS NULL AND expires_at>now() RETURNING id
    ) INSERT INTO aux_refresh_tokens(token_hash,session_id) SELECT ${tokenHash(refresh)},id FROM updated RETURNING session_id`;
  if (!rotated[0]) {
    // A concurrent request may have performed exactly this rotation while we
    // waited. Re-read its committed ciphertext before treating it as reuse.
    const latest=await sql`SELECT s.*,r.used_at,r.rotation_reply,r.rotation_context_hash FROM aux_refresh_tokens r JOIN aux_sessions s ON s.id=r.session_id WHERE r.token_hash=${oldHash}`;
    if(latest[0]&&!latest[0].revoked_at){const replay=await recoverRotationReply(latest[0],oldHash,context);if(replay)return c.json(replay);}
    await sql`UPDATE aux_sessions SET revoked_at=now() WHERE family_id=${row.family_id}`;
    return error(c,'Refresh token was reused. Sign in again.','REFRESH_TOKEN_COMPROMISED');
  }
  return c.json(reply);
});

authRoutes.use('/signout',requireUser);
authRoutes.post('/signout', async c => {
  const body=await input(c,z.object({refreshToken:z.string().max(256),device:deviceSchema.optional(),revokeScope:z.literal('refresh_token').optional()}));
  const user=c.get('user');
  if (user.sessionId.startsWith('clerk:')) { await clerk().sessions.revokeSession(user.sessionId.slice(6)); return c.json({success:true}); }
  await sql`UPDATE aux_sessions SET revoked_at=now() WHERE id=${user.sessionId} AND user_id=${user.id} AND id IN (SELECT session_id FROM aux_refresh_tokens WHERE token_hash=${tokenHash(body.refreshToken)})`;
  return c.json({success:true});
});
authRoutes.use('/me',requireUser);
authRoutes.use('/me/*',requireUser);
async function currentUser(id:string) {
  const rows=await sql`SELECT u.* FROM aux_users u WHERE u.id=${id} AND deleted_at IS NULL`;
  const u=rows[0];
  if(!u)throw new Error('Account unavailable');
  let profileUrl=u.profile_url??null;
  if(u.avatar_path){
    const capability=await new SignJWT({path:u.avatar_path}).setProtectedHeader({alg:'HS256',typ:'JWT'}).setSubject(u.id).setIssuer(ownIssuer).setAudience('aux-avatar').setIssuedAt().setExpirationTime('2h').sign(new TextEncoder().encode(pepper()));
    profileUrl=`${process.env.AUX_API_ORIGIN||ownIssuer}/auth/avatar/${u.id}?cap=${capability}`;
  }
  return {userId:u.id,name:u.name||u.email,email:u.email,plan:'free',profileUrl,onboardingCompletedAt:u.onboarding_completed_at??null,features:[]};
}
authRoutes.get('/me',async c=>c.json(await currentUser(c.get('user').id)));
authRoutes.post('/me',async c=>{
  const body=await input(c,z.object({name:z.string().trim().min(1).max(100)}));
  await sql`UPDATE aux_users SET name=${body.name},updated_at=now() WHERE id=${c.get('user').id}`;
  return c.json(await currentUser(c.get('user').id));
});
authRoutes.delete('/me',async c=>{
  const user=c.get('user');
  await sql`WITH removed AS (UPDATE aux_users SET deleted_at=now(),updated_at=now() WHERE id=${user.id} RETURNING id),
    revoked AS (UPDATE aux_sessions SET revoked_at=now() WHERE user_id IN (SELECT id FROM removed))
    UPDATE shared_sessions SET revoked_at=now() WHERE user_id IN (SELECT id FROM removed)`;
  let purgePending=true;
  try{purgePending=!(await purgeDeletedUserData(user.id)).complete;}catch{ /* Maintenance retries safely; account access is already revoked. */ }
  return c.json({success:true,purgePending});
});
authRoutes.post('/onboarding/complete',requireUser,async c=>{
  const rows=await sql`UPDATE aux_users SET onboarding_completed_at=COALESCE(onboarding_completed_at,now()),updated_at=now() WHERE id=${c.get('user').id} RETURNING onboarding_completed_at`;
  return c.json({onboardingCompletedAt:rows[0].onboarding_completed_at,saved:true});
});
authRoutes.get('/devices',requireUser,async c=>{
  const rows=await sql`SELECT id,app_version,created_at,device_name,device_fingerprint,last_seen_at,platform FROM aux_sessions WHERE user_id=${c.get('user').id} AND revoked_at IS NULL AND expires_at>now() ORDER BY created_at DESC LIMIT 100`;
  return c.json({devices:rows.map(r=>({id:r.id,appVersion:r.app_version,createdAt:r.created_at,deviceName:r.device_name,ikSigKeyFingerprint:r.device_fingerprint??'',lastSeenAt:r.last_seen_at,lastUsedAt:r.last_seen_at,platform:r.platform,updatedAt:r.last_seen_at}))});
});
authRoutes.post('/devices/:id/signout',requireUser,async c=>{
  const id=z.string().uuid().parse(c.req.param('id'));
  if(id===c.get('user').sessionId)return error(c,'Use sign out this device for the current device.','CURRENT_DEVICE',409);
  const rows=await sql`UPDATE aux_sessions SET revoked_at=now() WHERE id=${id} AND user_id=${c.get('user').id} RETURNING id`;
  return rows[0]?c.json({success:true}):error(c,'Device not found.','NOT_FOUND',404);
});

const userCode = z.string().trim().min(1).max(32).transform(v=>v.replace(/[ -]/g,'').toUpperCase());
authRoutes.post('/device-code/start',async c=>{
  const body=await input(c,z.object({email:emailSchema,deviceName:z.string().trim().min(1).max(200),device:deviceSchema.optional()}));
  if(!await rateLimit(`device-start:${ip(c)}`,10,600)||!await rateLimit(`device-email:${body.email}`,5,600))return error(c,'Too many device requests.','RATE_LIMITED',429);
  const device=validateDevice(body.device), code=randomBytes(5).toString('hex').toUpperCase(), secret=opaque();
  await sql`INSERT INTO aux_device_requests(device_code_hash,user_code_hash,requested_email_hash,device_name,device)
    VALUES (${tokenHash(secret)},${secretHash('device-code',code)},${secretHash('device-email',body.email)},${body.deviceName},${JSON.stringify(device)}::jsonb)`;
  return c.json({deviceCode:secret,userCode:`${code.slice(0,5)}-${code.slice(5)}`,expiresIn:600,interval:5});
});
authRoutes.post('/device-code/poll',async c=>{
  const body=await input(c,z.object({deviceCode:z.string().min(20).max(256)}));
  if(!await rateLimit(`device-poll:${ip(c)}`,60,60))return error(c,'Slow down.','RATE_LIMITED',429);
  const rows=await sql`UPDATE aux_device_requests SET poll_after=now()+interval '4 seconds' WHERE device_code_hash=${tokenHash(body.deviceCode)} AND poll_after<=now() RETURNING *`;
  const row=rows[0];
  if(!row){ c.header('Retry-After','5'); return error(c,'Wait before polling again.','SLOW_DOWN',429); }
  if(row.consumed_at||new Date(row.expires_at).getTime()<=Date.now())return c.json({status:'expired'});
  if(row.decision==='deny')return c.json({status:'denied'});
  if(row.decision!=='approve'||!row.user_id)return c.json({status:'pending'});
  const consumed=await sql`UPDATE aux_device_requests SET consumed_at=now() WHERE id=${row.id} AND consumed_at IS NULL AND expires_at>now() RETURNING user_id`;
  if(!consumed[0])return c.json({status:'expired'});
  const users=await sql`SELECT * FROM aux_users WHERE id=${row.user_id} AND deleted_at IS NULL`;
  if(!users[0])return c.json({status:'denied'});
  const result=await issueSession(users[0],row.device?validateDevice(deviceSchema.parse(row.device)):null);
  return c.json({status:'approved',...result});
});
authRoutes.post('/device-code/cancel',async c=>{
  const body=await input(c,z.object({deviceCode:z.string().min(20).max(256)}));
  if(!await rateLimit(`device-cancel:${ip(c)}`,30,60))return error(c,'Too many requests.','RATE_LIMITED',429);
  await sql`UPDATE aux_device_requests SET consumed_at=now(),decision='deny' WHERE device_code_hash=${tokenHash(body.deviceCode)} AND consumed_at IS NULL`;
  return c.json({success:true});
});
authRoutes.post('/device-code/pending',requireUser,async c=>{
  const rows=await sql`SELECT id,device_name,created_at,expires_at FROM aux_device_requests WHERE requested_email_hash=${secretHash('device-email',c.get('user').email)} AND decision IS NULL AND consumed_at IS NULL AND expires_at>now() ORDER BY created_at DESC LIMIT 100`;
  return c.json({requests:rows.map(r=>({requestId:r.id,deviceName:r.device_name,createdAt:new Date(r.created_at).getTime(),expiresAt:new Date(r.expires_at).getTime()}))});
});
authRoutes.post('/device-code/lookup',requireUser,async c=>{
  const body=await input(c,z.object({id:z.string().uuid(),userCode})),user=c.get('user');
  if(!await rateLimit(`device-lookup:${user.id}`,20,600))return error(c,'Too many attempts.','RATE_LIMITED',429);
  const rows=await sql`SELECT id,device_name FROM aux_device_requests WHERE id=${body.id} AND user_code_hash=${secretHash('device-code',body.userCode)} AND requested_email_hash=${secretHash('device-email',user.email)} AND decision IS NULL AND consumed_at IS NULL AND expires_at>now()`;
  return rows[0]?c.json({id:rows[0].id,deviceName:rows[0].device_name,email:user.email,accountId:user.id}):error(c,'Device code is invalid or expired.','INVALID_CODE',400);
});
authRoutes.post('/device-code/decide',requireUser,async c=>{
  const body=await input(c,z.object({id:z.string().uuid(),userCode,accountId:z.string().uuid(),decision:z.enum(['approve','deny'])})),user=c.get('user');
  if(body.accountId!==user.id)return error(c,'Account changed. Look up the code again.','ACCOUNT_CHANGED',409);
  if(!await rateLimit(`device-decide:${user.id}`,20,600))return error(c,'Too many attempts.','RATE_LIMITED',429);
  const rows=await sql`UPDATE aux_device_requests SET user_id=${user.id},decision=${body.decision}
    WHERE id=${body.id} AND user_code_hash=${secretHash('device-code',body.userCode)} AND requested_email_hash=${secretHash('device-email',user.email)} AND decision IS NULL AND consumed_at IS NULL AND expires_at>now() RETURNING id`;
  return rows[0]?c.json({status:body.decision==='approve'?'approved':'denied'}):error(c,'Device code is invalid or expired.','INVALID_CODE',400);
});

// The browser's image element cannot add an Authorization header. Short-lived,
// object-scoped capabilities let it display a private avatar without public Blob ACLs.
authRoutes.post('/me/avatar',async c=>{
  const user=c.get('user');
  if(!await rateLimit(`avatar:${user.id}`,10,3600))return error(c,'Too many uploads.','RATE_LIMITED',429);
  const form=await c.req.formData(), file=form.get('file');
  if(!(file instanceof File)||file.size===0||file.size>2*1024*1024)return error(c,'Choose an image smaller than 2 MB.','INVALID_IMAGE',400);
  const bytes=Buffer.from(await file.arrayBuffer());
  const png=bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
  const jpeg=bytes[0]===255&&bytes[1]===216&&bytes[2]===255;
  const webp=bytes.subarray(0,4).toString()==='RIFF'&&bytes.subarray(8,12).toString()==='WEBP';
  const type=png?'image/png':jpeg?'image/jpeg':webp?'image/webp':null;
  if(!type)return error(c,'Choose a PNG, JPEG or WebP image.','INVALID_IMAGE',400);
  const {put,del}=await import('@vercel/blob');
  const result=await put(`avatars/${user.id}/${randomUUID()}`,bytes,{access:'private',contentType:type,addRandomSuffix:false});
  const [replaced]=await sql`UPDATE aux_users u SET avatar_path=${result.pathname},avatar_mime=${type},updated_at=now() FROM aux_users old
    WHERE u.id=${user.id} AND old.id=u.id AND u.deleted_at IS NULL RETURNING old.avatar_path AS previous`;
  // A leftover old image is harmless: account deletion clears the whole avatar prefix.
  if(replaced?.previous)await del(replaced.previous).catch(cause=>console.error(JSON.stringify({event:'aux.avatar.replace_cleanup_failed',error:String(cause)})));
  return c.json(await currentUser(user.id));
});
authRoutes.get('/avatar/:id',async c=>{
  const id=z.string().uuid().parse(c.req.param('id')),cap=c.req.query('cap');
  if(!cap||cap.length>4096)return error(c,'Avatar unavailable.','NOT_FOUND',404);
  let claims;
  try{claims=(await jwtVerify(cap,new TextEncoder().encode(pepper()),{issuer:ownIssuer,audience:'aux-avatar',algorithms:['HS256']})).payload;}catch{return error(c,'Avatar unavailable.','NOT_FOUND',404);}
  if(claims.sub!==id||typeof claims.path!=='string')return error(c,'Avatar unavailable.','NOT_FOUND',404);
  const rows=await sql`SELECT avatar_path,avatar_mime FROM aux_users WHERE id=${id} AND avatar_path=${claims.path} AND deleted_at IS NULL`;
  if(!rows[0])return error(c,'Avatar unavailable.','NOT_FOUND',404);
  const {get}=await import('@vercel/blob'),result=await get(rows[0].avatar_path,{access:'private'});
  if(!result?.stream)return error(c,'Avatar unavailable.','NOT_FOUND',404);
  return new Response(result.stream,{headers:{'Content-Type':rows[0].avatar_mime,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'; sandbox"}});
});

/** Called by the authenticated maintenance job; retain refresh reuse history for
 * the complete family lifetime, then remove only expired Aux auth artifacts. */
export async function pruneAuthState() {
  await sql`UPDATE aux_refresh_tokens SET rotation_reply=NULL,rotation_context_hash=NULL WHERE used_at<now()-interval '10 seconds' AND rotation_reply IS NOT NULL`;
  await sql`DELETE FROM aux_rate_limits WHERE expires_at<now()-interval '1 day'`;
  await sql`DELETE FROM aux_email_challenges WHERE expires_at<now()-interval '1 day'`;
  await sql`DELETE FROM aux_device_requests WHERE expires_at<now()-interval '1 day'`;
  await sql`DELETE FROM aux_refresh_tokens WHERE session_id IN (SELECT id FROM aux_sessions WHERE expires_at<now()-interval '7 days')`;
  await sql`DELETE FROM aux_sessions WHERE expires_at<now()-interval '7 days'`;
}

/** Public route; only a verified Clerk/Svix signature permits database changes. */
export const authWebhooks = new Hono();
authWebhooks.post('/',async c=>{
  let event;
  try{event=await verifyWebhook(c.req.raw,{signingSecret:required('CLERK_WEBHOOK_SIGNING_SECRET')});}
  catch{return c.json({error:'Invalid webhook signature.'},400);}
  const delivery=c.req.header('svix-id');
  if(!delivery||delivery.length>256)return c.json({error:'Missing webhook delivery ID.'},400);
  const done=await sql`SELECT id FROM aux_auth_webhooks WHERE id=${delivery}`;
  if(done[0])return c.json({received:true});
  if(event.type==='user.deleted'){
    if(event.data.id){
      await sql`WITH removed AS (UPDATE aux_users SET deleted_at=COALESCE(deleted_at,now()),updated_at=now() WHERE clerk_id=${event.data.id} RETURNING id),
        revoked AS (UPDATE aux_sessions SET revoked_at=now() WHERE user_id IN (SELECT id FROM removed))
        UPDATE shared_sessions SET revoked_at=now() WHERE user_id IN (SELECT id FROM removed)`;
    }
  }else if(event.type==='user.updated'){
    // Fetch current state instead of applying potentially reordered profile payloads.
    // A 404 means the identity was deleted after this event was queued; user.deleted handles it.
    const account=await clerk().users.getUser(event.data.id).catch(cause=>{if((cause as {status?:number}).status===404)return null;throw cause;});
    if(account?.banned||account?.locked){
      await sql`UPDATE aux_sessions SET revoked_at=now() WHERE user_id IN (SELECT id FROM aux_users WHERE clerk_id=${account.id})`;
    }else if(account){
      // Do not create a product account merely because a Clerk profile changed.
      const known=await sql`SELECT id FROM aux_users WHERE clerk_id=${account.id} AND deleted_at IS NULL`;
      if(known[0])await mapUser(account);
    }
  }else if(event.type==='session.revoked'||event.type==='session.ended'||event.type==='session.removed'){
    await sql`UPDATE aux_sessions SET revoked_at=now() WHERE clerk_session_id=${event.data.id} AND user_id IN (SELECT id FROM aux_users WHERE clerk_id=${event.data.user_id})`;
  }
  // Mark only after successful idempotent effects. Provider retries can safely
  // repeat revocation and profile updates if a previous delivery was interrupted.
  await sql`INSERT INTO aux_auth_webhooks(id,event_type) VALUES (${delivery},${event.type}) ON CONFLICT(id) DO NOTHING`;
  return c.json({received:true});
});

/** Bounded, retryable deletion of only this soft-deleted Aux user's product data.
 * Never hard-delete owner/intent metadata while a signed upload can arrive. */
export const profileRoutes = new Hono<AuthEnv>();
profileRoutes.post('/metadata', async c => {
  const user=c.get('user');
  if(!user)return error(c,'Sign in to continue.','ACCESS_TOKEN_INVALID');
  if(!await rateLimit(`profile-metadata:${user.id}`,20,60))return error(c,'Please wait before refreshing profile metadata.','RATE_LIMITED',429);
  const account=await clerk().users.getUser(user.clerkId);
  if(account.banned||account.locked){
    await sql`UPDATE aux_sessions SET revoked_at=now() WHERE user_id=${user.id}`;
    return error(c,'Account is not available.','ACCESS_TOKEN_INVALID');
  }
  await mapUser(account);
  return c.json(await currentUser(user.id));
});

// Every table holding a user's rows, children before parents. A test checks this
// against the migrated schema so a new table cannot be missed.
export const userDataTables=['aux_attachment_bindings','aux_retired_session_blobs','aux_session_snapshots','aux_drive_cookies','aux_drive_files','aux_drive_heads',
  'sync_heads','sync_objects','sync_entities','aux_sync_recovery_challenges_v2','aux_sync_recovery_v2','sync_keys','shared_sessions','aux_device_requests',
  'aux_credit_refunds','aux_credit_grants','aux_credit_periods','aux_checkout_requests','aux_usage','aux_wallets','aux_subscriptions','aux_attachments'] as const;

/** Retryable: blobs first, then rows, then the identity. Completes only when nothing remains. */
export async function purgeDeletedUserData(userId:string) {
  z.string().uuid().parse(userId);
  const rows=await sql`SELECT id,clerk_id,email FROM aux_users WHERE id=${userId} AND deleted_at IS NOT NULL`;
  if(!rows[0])throw new Error('Account must be soft-deleted before purging data');
  await sql`UPDATE aux_users SET purge_attempted_at=now() WHERE id=${userId}`;
  await sql`UPDATE shared_sessions SET revoked_at=COALESCE(revoked_at,now()),messages='[]'::jsonb,title='' WHERE user_id=${userId}`;
  const {purgeUserAttachments}=await import('./attachments');
  const attachments=await purgeUserAttachments(userId,100);
  // Uploads still in flight can complete until their token expires; keep their rows until then.
  if(attachments.remaining>0||attachments.safeToDeleteAccountAfter)return {complete:false,remaining:attachments.remaining,safeToDeleteAccountAfter:attachments.safeToDeleteAccountAfter};
  const {list,del}=await import('@vercel/blob');
  for(let cursor:string|undefined;;){
    const page=await list({prefix:`avatars/${userId}/`,cursor});
    if(page.blobs.length)await del(page.blobs.map(blob=>blob.url));
    if(!page.hasMore)break;
    cursor=page.cursor;
  }
  await sql`DELETE FROM aux_refresh_tokens WHERE session_id IN (SELECT id FROM aux_sessions WHERE user_id=${userId})`;
  await sql`DELETE FROM aux_sessions WHERE user_id=${userId}`;
  for(const table of userDataTables)await sql.query(`DELETE FROM ${table} WHERE user_id=$1`,[userId]);
  await sql`DELETE FROM aux_email_challenges WHERE email=${rows[0].email}`;
  if(!String(rows[0].clerk_id).startsWith('deleted:')){
    try{await clerk().users.deleteUser(rows[0].clerk_id);}
    catch(cause){if((cause as {status?:number}).status!==404)throw cause;}
  }
  // Keep the row as a tombstone for audit only; free the email and identity for a new account.
  await sql`UPDATE aux_users SET clerk_id='deleted:'||id::text,email='deleted+'||id::text||'@invalid',name='',profile_url=NULL,avatar_path=NULL,avatar_mime=NULL,
    onboarding_completed_at=NULL,data_purged_at=now(),updated_at=now() WHERE id=${userId} AND deleted_at IS NOT NULL`;
  return {complete:true,remaining:0,safeToDeleteAccountAfter:null};
}
