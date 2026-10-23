import {test} from 'node:test';
import assert from 'node:assert/strict';
import {checkEnvironment,migrationInventory} from '../scripts/check-environment.mjs';
import resources from '../config/deployment-resources.json';
import manifest from './schema-manifest.json';
import {createReadinessRoutes} from './readiness';
import {app} from './app';

function fixture() {
  const env:Record<string,string>={};
  for(const name of ['CLERK_WEBHOOK_SIGNING_SECRET','AUX_AUTH_SECRET','AUX_DATA_ENCRYPTION_KEY','RESEND_API_KEY','RESEND_FROM','BLOB_READ_WRITE_TOKEN','STRIPE_WEBHOOK_SECRET','STRIPE_PORTAL_CONFIGURATION_ID','STRIPE_PRICE_PRO_MONTH','STRIPE_PRICE_PRO_YEAR','STRIPE_PRICE_MAX_MONTH','STRIPE_PRICE_MAX_YEAR','CRON_SECRET'])env[name]='fixture';
  return {...env,AUX_PAYMENTS_ENABLED:'true',AUX_AUTH_SECRET:'disposable-fixture-secret-at-least-32',CRON_SECRET:'disposable-internal-secret-at-least-32',AUX_DATA_ENCRYPTION_KEY:Buffer.alloc(32,7).toString('base64'),VERCEL_ENV:'preview',DATABASE_URL:'postgresql://fixture:fixture@'+resources.development.databaseHost+'/fixture',NEXT_PUBLIC_APP_URL:resources.development.appOrigin,AUX_API_ORIGIN:resources.development.apiOrigin,AUX_ALLOWED_ORIGINS:resources.development.appOrigin,CLERK_AUTHORIZED_PARTIES:resources.development.appOrigin,CLERK_SECRET_KEY:'sk_test_fixture',NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:'pk_test_fixture',STRIPE_SECRET_KEY:'rk_test_fixture',NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:'pk_test_fixture'};
}
test('production deployment cannot accidentally reuse development resources or provider mode',()=>{
  const env=fixture();assert.equal(checkEnvironment(env,resources).profile,'development');
  assert.throws(()=>checkEnvironment({...env,VERCEL_ENV:'production'}, {...resources,production:null}),/Production resources/);
  assert.throws(()=>checkEnvironment({...env,VERCEL_TARGET_ENV:'production'},{...resources,production:null}),/Production resources/);
  const production={...resources,production:{...resources.development,appOrigin:'https://app.getaux.co',apiOrigin:'https://api.getaux.co'}};
  const configured={...env,VERCEL_ENV:'production',NEXT_PUBLIC_APP_URL:production.production.appOrigin,AUX_API_ORIGIN:production.production.apiOrigin};
  assert.throws(()=>checkEnvironment(configured,production),/separate database/);
  assert.throws(()=>checkEnvironment({...env,STRIPE_SECRET_KEY:'rk_live_fixture'},resources),/Wrong provider mode/);
  assert.throws(()=>checkEnvironment({...env,AUX_ALLOWED_ORIGINS:env.AUX_ALLOWED_ORIGINS+',https://unrelated.example'},resources),/AUX_ALLOWED_ORIGINS/);
  assert.throws(()=>checkEnvironment({...env,DATABASE_URL:'postgresql://private:secret@wrong.example/db'},resources),error=>error instanceof Error&&!error.message.includes('secret')&&!error.message.includes('wrong.example'));
});
test('readiness schema pins equal the actual immutable migration files',async()=>assert.deepEqual(await migrationInventory(),manifest));
test('internal readiness denies unauthenticated requests before database access',async()=>{
  const previous=process.env.CRON_SECRET;process.env.CRON_SECRET='fixture-only-secret';
  try{
    let reads=0;const route=createReadinessRoutes(async()=>{reads++;return [];});
    for(const authorization of [undefined,'fixture-only-secret','Bearer wrong'])assert.equal((await route.request('/readiness',{headers:authorization?{authorization}:{}})).status,401);
    assert.equal(reads,0);
    assert.equal((await app.request('/api/v1/internal/readiness')).status,401);
    assert.equal((await app.request('/api/v1/internal/maintenance')).status,401);
  }finally{if(previous===undefined)delete process.env.CRON_SECRET;else process.env.CRON_SECRET=previous;}
});
test('readiness distinguishes current, stale and unavailable databases without leaking failures',async()=>{
  const previous=process.env.CRON_SECRET;process.env.CRON_SECRET='fixture-only-secret';
  try {
    const headers={authorization:'Bearer fixture-only-secret'}, rows=Object.entries(manifest).map(([name,sha256])=>({name,sha256}));
    assert.equal((await createReadinessRoutes(async()=>rows).request('/readiness',{headers})).status,200);
    assert.equal((await createReadinessRoutes(async()=>rows.slice(1)).request('/readiness',{headers})).status,503);
    assert.equal((await createReadinessRoutes(async()=>rows.map((r,i)=>i===0?{...r,sha256:'wrong'}:r)).request('/readiness',{headers})).status,503);
    const failed=await createReadinessRoutes(async()=>{throw Error('postgres://secret-connection');}).request('/readiness',{headers});
    assert.equal(failed.status,503);assert.ok(!(await failed.text()).includes('secret'));
  }finally{if(previous===undefined)delete process.env.CRON_SECRET;else process.env.CRON_SECRET=previous;}
});

test('provider-only launch builds without Stripe; billing opt-in restores all payment requirements',()=>{
  const env:Record<string,string>=fixture();
  delete env.AUX_PAYMENTS_ENABLED;
  for(const key of Object.keys(env))if(key.includes('STRIPE'))delete env[key];
  assert.equal(checkEnvironment(env,resources).paymentsEnabled,false);
  assert.throws(()=>checkEnvironment({...env,AUX_PAYMENTS_ENABLED:'true'},resources),/Missing configuration: STRIPE_SECRET_KEY/);
  assert.equal(checkEnvironment({...env,AUX_PAYMENTS_ENABLED:'TRUE'},resources).paymentsEnabled,false);
});

// Build validation accepts whitespace-separated origins; the actual preflight must too.
test('configured CORS origins are trimmed, with unrelated origins still denied',async()=>{
  const previous=process.env.AUX_ALLOWED_ORIGINS;
  process.env.AUX_ALLOWED_ORIGINS=' https://app.getaux.co , https://dev-cloud.getaux.co ';
  try {
    for(const origin of ['https://app.getaux.co','https://dev-cloud.getaux.co']) {
      const response=await app.request('/api/v1/health',{method:'OPTIONS',headers:{Origin:origin,'Access-Control-Request-Method':'GET'}});
      assert.equal(response.headers.get('Access-Control-Allow-Origin'),origin);
    }
    const response=await app.request('/api/v1/health',{method:'OPTIONS',headers:{Origin:'https://unrelated.example','Access-Control-Request-Method':'GET'}});
    assert.equal(response.headers.get('Access-Control-Allow-Origin'),null);
  }finally{if(previous===undefined)delete process.env.AUX_ALLOWED_ORIGINS;else process.env.AUX_ALLOWED_ORIGINS=previous;}
});
