import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';

// Errors name configuration fields only; never include their values.
export function checkEnvironment(env, resources) {
  const target=env.VERCEL_TARGET_ENV||env.VERCEL_ENV||'development';
  const production=target==='production'||env.VERCEL_ENV==='production';
  const profile=resources[production?'production':'development'];
  if(!profile) throw Error('Production resources have not been configured; use the development Preview target.');
  const required=['DATABASE_URL','CLERK_SECRET_KEY','NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY','CLERK_WEBHOOK_SIGNING_SECRET','AUX_AUTH_SECRET','AUX_DATA_ENCRYPTION_KEY','NEXT_PUBLIC_APP_URL','AUX_API_ORIGIN','AUX_ALLOWED_ORIGINS','CLERK_AUTHORIZED_PARTIES','RESEND_API_KEY','RESEND_FROM','BLOB_READ_WRITE_TOKEN','STRIPE_SECRET_KEY','STRIPE_WEBHOOK_SECRET','STRIPE_PORTAL_CONFIGURATION_ID','NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY','STRIPE_PRICE_PRO_MONTH','STRIPE_PRICE_PRO_YEAR','STRIPE_PRICE_MAX_MONTH','STRIPE_PRICE_MAX_YEAR','CRON_SECRET'];
  for(const name of required) if(!env[name]?.trim()) throw Error('Missing configuration: '+name);
  for(const name of ['AUX_AUTH_SECRET','CRON_SECRET'])if(env[name].length<32)throw Error('Invalid configuration: '+name);
  if(!/^[A-Za-z0-9+/]{43}=$/.test(env.AUX_DATA_ENCRYPTION_KEY)||Buffer.from(env.AUX_DATA_ENCRYPTION_KEY,'base64').length!==32)throw Error('Invalid configuration: AUX_DATA_ENCRYPTION_KEY');
  const origin=(name,expected)=>{try{const u=new URL(env[name]);if(u.origin!==expected||u.href!==expected+'/')throw Error();}catch{throw Error('Invalid configuration: '+name);}};
  origin('NEXT_PUBLIC_APP_URL',profile.appOrigin);origin('AUX_API_ORIGIN',profile.apiOrigin);
  try {const u=new URL(env.DATABASE_URL);if(!['postgres:','postgresql:'].includes(u.protocol)||u.hostname!==profile.databaseHost)throw Error();}catch{throw Error('DATABASE_URL does not match the configured deployment resource.');}
  if(production&&profile.databaseHost===resources.development.databaseHost) throw Error('Production must use a separate database.');
  for(const name of ['AUX_ALLOWED_ORIGINS','CLERK_AUTHORIZED_PARTIES']) {
    const values=env[name].split(',').map(v=>v.trim());
    if(!values.includes(profile.appOrigin)||values.some(value=>{try{const u=new URL(value);return u.origin!==value||!(value===profile.appOrigin||(!production&&u.hostname==='localhost'&&u.protocol==='http:'));}catch{return true;}}))throw Error('Invalid configuration: '+name);
  }
  for(const [name,prefix] of [['CLERK_SECRET_KEY',production?'sk_live_':'sk_test_'],['NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',production?'pk_live_':'pk_test_'],['STRIPE_SECRET_KEY',production?'rk_live_':'rk_test_'],['NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',production?'pk_live_':'pk_test_']])if(!env[name].startsWith(prefix))throw Error('Wrong provider mode: '+name);
  return {profile:production?'production':'development',target};
}

export async function migrationInventory() {
  const root=new URL('../migrations/',import.meta.url), files=(await readdir(root)).filter(n=>n.endsWith('.sql')).sort();
  return Object.fromEntries(await Promise.all(files.map(async name=>[name,createHash('sha256').update(await readFile(new URL(name,root))).digest('hex')])));
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href) {
  try {
    const resources=JSON.parse(await readFile(new URL('../config/deployment-resources.json',import.meta.url),'utf8'));
    const checked=checkEnvironment(process.env,resources);
    const expected=JSON.parse(await readFile(new URL('../src/schema-manifest.json',import.meta.url),'utf8'));
    if(JSON.stringify(await migrationInventory())!==JSON.stringify(expected))throw Error('Migration manifest is stale; regenerate it after reviewing migration changes.');
    console.log(JSON.stringify({event:'aux_build_environment_verified',...checked}));
  } catch(error) {console.error(error.message);process.exitCode=1;}
}
