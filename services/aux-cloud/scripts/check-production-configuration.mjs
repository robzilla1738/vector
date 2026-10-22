import { execFileSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { requiredEnvironmentKeys } from './check-environment.mjs';

const project='prj_WLAGrKLQ42G5unZOI5FUkk5gBwxB',team='team_aFPyA9tVAkB2WegquB3aADsL';
const expectedPublic={NEXT_PUBLIC_APP_URL:'https://app.getaux.co',AUX_API_ORIGIN:'https://api.getaux.co',AUX_SHARE_ORIGIN:'https://share.getaux.co',RESEND_FROM:'Aux <hello@notify.getaux.co>',AUX_ALLOWED_ORIGINS:'https://app.getaux.co',CLERK_AUTHORIZED_PARTIES:'https://app.getaux.co'};
const secrets=['CLERK_SECRET_KEY','CLERK_WEBHOOK_SIGNING_SECRET','RESEND_API_KEY','AUX_AUTH_SECRET','AUX_DATA_ENCRYPTION_KEY','CRON_SECRET','STRIPE_SECRET_KEY','STRIPE_WEBHOOK_SECRET'];

// Inspect metadata and an allowlist of public settings only. Never serialize
// provider-returned secret/encrypted values or the complete CLI response.
export function inspectProductionConfiguration(rows,resourceProfileConfigured) {
  if(!Array.isArray(rows)||rows.some(row=>!row||typeof row.key!=='string'||!Array.isArray(row.target)))throw Error('Invalid environment metadata shape.');
  const production=rows.filter(row=>row.target.includes('production'));
  if(new Set(production.map(row=>row.key)).size!==production.length)throw Error('Ambiguous production environment metadata.');
  const byKey=new Map(production.map(row=>[row.key,row]));
  const missing=requiredEnvironmentKeys.filter(key=>!byKey.has(key));
  const scopeMismatches=[...secrets,'DATABASE_URL','BLOB_READ_WRITE_TOKEN'].filter(key=>byKey.has(key)&&(byKey.get(key).target.length!==1||byKey.get(key).target[0]!=='production'));
  const typeMismatches=secrets.filter(key=>byKey.has(key)&&byKey.get(key).type!=='sensitive');
  for(const key of ['DATABASE_URL','BLOB_READ_WRITE_TOKEN'])if(byKey.has(key)&&!['sensitive','encrypted'].includes(byKey.get(key).type))typeMismatches.push(key);
  const publicValuesUnverified=Object.keys(expectedPublic).filter(key=>byKey.get(key)?.type==='encrypted');
  const publicValueMismatches=Object.entries(expectedPublic).filter(([key,value])=>byKey.has(key)&&byKey.get(key).type!=='encrypted'&&(byKey.get(key).type!=='plain'||byKey.get(key).value!==value)).map(([key])=>key);
  let clerkHost=null;
  const publishable=byKey.get('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY');
  if(publishable){
    if(publishable.type==='plain'&&typeof publishable.value==='string'&&publishable.value.startsWith('pk_live_')){
      const decoded=Buffer.from(publishable.value.slice(8),'base64').toString('utf8');
      if(decoded==='clerk.getaux.co$')clerkHost='clerk.getaux.co';
    }
    if(publishable.type==='encrypted')publicValuesUnverified.push('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY');
    else if(!clerkHost)publicValueMismatches.push('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY');
  }
  return {projectId:project,teamId:team,environment:'production',requiredVariables:requiredEnvironmentKeys.length,missing,scopeMismatches,typeMismatches,publicValueMismatches,publicValuesUnverified,clerkHost,resourceProfileConfigured,configurationComplete:!!resourceProfileConfigured&&![missing,scopeMismatches,typeMismatches,publicValueMismatches,publicValuesUnverified].some(list=>list.length),secretValuesInspected:false,providerSecretPairingVerified:false,productionReadinessVerified:false,activationPerformed:false};
}

function vercel(args) {
  const env={...process.env};
  for(const key of ['VERCEL_TOKEN','VERCEL_ORG_ID','VERCEL_PROJECT_ID'])delete env[key];
  // Errors intentionally omit stdout/stderr/command to prevent accidental
  // disclosure if a future CLI prints credentials on failure.
  try{return JSON.parse(execFileSync('vercel',[...args,'--global-config','/Users/rcourson/.config/vercel-personal','--scope','robzilla1738s-projects'],{env,encoding:'utf8',stdio:['ignore','pipe','pipe'],timeout:30000,maxBuffer:2*1024*1024}));}
  catch{throw Error('Personal Vercel metadata inspection failed.');}
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  try{
    if(process.argv.slice(2).some(arg=>arg!=='--record'))throw Error('Only --record is supported.');
    const identity=vercel(['whoami','--format','json']);
    if(identity.username!=='robzilla1738'||identity.team?.id!==team||identity.team?.slug!=='robzilla1738s-projects')throw Error('Personal Vercel identity mismatch.');
    const data=vercel(['env','ls','production','--project',project,'--format','json']);
    const rows=Array.isArray(data)?data:(data.envs??data.environmentVariables??data.variables);
    const resources=JSON.parse(await readFile(new URL('../config/deployment-resources.json',import.meta.url),'utf8'));
    const result=inspectProductionConfiguration(rows,!!resources.production);
    let publicSigningKeysAvailable=false;
    if(result.clerkHost){
      try{
        const response=await fetch('https://clerk.getaux.co/.well-known/jwks.json',{signal:AbortSignal.timeout(15000),redirect:'error'});
        const body=response.ok?await response.json():null;
        publicSigningKeysAvailable=Array.isArray(body?.keys)&&body.keys.length>0&&body.keys.every(key=>key.kty==='RSA'&&key.alg==='RS256'&&typeof key.kid==='string'&&!!key.kid);
      }catch{/* Report unavailable without provider response or key bytes. */}
    }
    const report={version:1,recordedAt:new Date().toISOString(),...result,publicSigningKeysAvailable};
    if(process.argv.includes('--record'))await writeFile(new URL('../evidence/production-configuration.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
    console.log(JSON.stringify(report,null,2));
    if(!result.configurationComplete||!publicSigningKeysAvailable)process.exitCode=2;
  }catch{console.error('Production metadata inspection failed; no provider response or credential values are logged.');process.exitCode=1;}
}
