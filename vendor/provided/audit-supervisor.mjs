/** Static supplied SEA inspection only; never imports or executes daemon code. */
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { findMachOSeaSection, readSeaBlob } from '../aside/lib/sea.mjs';
const binary = readFileSync(process.argv[2]);
const sha256 = (data) => createHash('sha256').update(data).digest('hex');
if (sha256(binary) !== '60d3c50a649a528927137c427d284e695a98162476d28065bb9634e937fed286') throw new Error('Unexpected daemon binary');
const section = findMachOSeaSection(binary);
const { code } = readSeaBlob(binary.subarray(section.offset, section.offset + section.size));
if (sha256(code) !== '5e35dfa1eb76d4614246f954b652fd505e271a0b3f1ac3168132fb8bc03814f5') throw new Error('Unexpected daemon code');
const needles = {
  cloudBinding: 'bindProfile:publicProcedure.meta({method:`POST`,path:`/accounts/profile-binding`}).input(object({profileId:string$3().min(1).meta({param:{in:`body`}}),userId:string$3().min(1).meta({param:{in:`body`}})',
  health: 'return{service:`aside-daemon`,version:DAEMON_VERSION,pid:process.pid,host:HOST,port:PORT,ready:Cn.isReady?.()??!0,status:ei>0?`running`:`idle`,startedAt:daemonStartedAt.toISOString(),runningSessionCount:ei,semaphore:ti}',
  healthRoute: 'ei.get(`/health`,Cn=>Cn.json(ti()))',
  shutdown: 'ei.post(`/shutdown`,ei=>(Cn.requestShutdown?.(),ei.json({status:`shutting_down`})))',
  clientKinds: 'clientKindSchema=_enum([`chromium`,`agent-manager-extension`,`password-manager-extension`,`password-importer`,`internal-web`,`cli`])',
  challenge: 'Cn.get(`/auth/daemon/challenge`,Cn=>Cn.json(createDaemonAuthChallenge(clientKindSchema.parse(Cn.req.query(`clientKind`)))))',
  session: 'Cn.post(`/auth/daemon/session`,async Cn=>{let ei=await consumeVerifiedDaemonAuthChallenge(sessionRequestSchema.parse(await Cn.req.json()));return ei?Cn.json({access_token:await issueDaemonToken(ei.clientKind),expiresInSeconds:TOKEN_TTL_SECONDS,token_type:DAEMON_AUTH_TOKEN_TYPE})',
  sessionInput: 'sessionRequestSchema=object({challengeId:string$3(),signedChallenge:string$3()})',
  tokenLifetime: 'TOKEN_TTL_SECONDS=86400,CHALLENGE_TTL_MS=3e4',
  rawChallenge: 'let ei=randomUUID(),ti=randomBytes(32);return challenges.set(ei,{challenge:ti,clientKind:Cn,expiresAt:Date.now()+CHALLENGE_TTL_MS}),{challenge:ti.toString(`base64`),challengeId:ei}',
  oneUse: 'let ei=challenges.get(Cn.challengeId);if(challenges.delete(Cn.challengeId),!ei)return null;',
  signature: 'verifyInstallationSignature(ti.scheme,Buffer$1.concat([DAEMON_AUTH_SIGNATURE_PREFIX,ei.challenge]),Buffer$1.from(Cn.signedChallenge,`base64`),ti.sig)',
  memoryModel: 'LOCAL_MEMORY_MODEL_DIR=IS_COMPILED?void 0:process.env.ASIDE_MEMORY_MODEL_DIR',
  memoryCache: 'LOCAL_MEMORY_CATALOG_CACHE=path.join(ASIDE_HOME_PATH,`memory-catalog.json`),LOCAL_MEMORY_MODEL_CACHE=path.join(ASIDE_HOME_PATH,`models`),LOCAL_MEMORY_RUNTIME_CACHE=path.join(ASIDE_HOME_PATH,`memory-runtimes`)',
};
const anchors = Object.entries(needles).map(([name, find]) => {
  const offset = code.indexOf(find);
  if (offset < 0 || code.indexOf(find, offset + 1) >= 0) throw new Error(`Missing/nonunique contract: ${name}`);
  return { name, byteOffset: Buffer.byteLength(code.slice(0, offset)), find, count: 1 };
});
process.stdout.write(`${JSON.stringify({ version: '1.26.1016.1852', binarySha256: sha256(binary), codeSha256: sha256(code), anchors }, null, 2)}\n`);
