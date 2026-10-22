import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import resources from '../config/deployment-resources.json';
import manifest from '../src/schema-manifest.json';
import {checkEnvironment} from './check-environment.mjs';

// Only the existing Aux development hostname may receive this private header.
assert.notEqual(process.env.VERCEL_ENV,'production');
assert.equal(checkEnvironment(process.env,resources).profile,'development');
const origin='https://dev-cloud.getaux.co';
const request=(path:string,headers:Record<string,string>={})=>fetch(origin+path,{headers,redirect:'error',signal:AbortSignal.timeout(20_000)});
const health=await request('/api/v1/health');assert.equal(health.status,200);
assert.equal((await health.json()).service,'aux-cloud');
const denied=await request('/api/v1/internal/readiness');assert.equal(denied.status,401);
const ready=await request('/api/v1/internal/readiness',{Authorization:'Bearer '+process.env.CRON_SECRET});assert.equal(ready.status,200);
assert.deepEqual(await ready.json(),{service:'aux-cloud',status:'ready',database:'reachable',schema:'current',mismatches:0});
const evidence={checkedAt:new Date().toISOString(),origin,checks:['public liveness returns200','protected readiness denies unauthenticated access401','authenticated readiness reaches actual database and verifies every required migration hash'],requiredMigrations:Object.keys(manifest).length,schemaManifestSha256:createHash('sha256').update(JSON.stringify(manifest)).digest('hex'),writesPerformed:false,paidProviderCalls:0};
await writeFile(new URL('../evidence/deployed-readiness.json',import.meta.url),JSON.stringify(evidence,null,2)+'\n');
console.log(JSON.stringify(evidence));
