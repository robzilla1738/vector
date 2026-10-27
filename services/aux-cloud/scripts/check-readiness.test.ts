import assert from 'node:assert/strict';
import {test} from 'node:test';
import {checkDeployedReadiness,readinessTarget,schemaManifestSha256} from './check-readiness.mjs';
import {createReadinessRoutes} from '../src/readiness';
import manifest from '../src/schema-manifest.json';

const secret='fixture-only-internal-header-at-least-32';
const review={format:'aux.readiness-target.v1',projectId:'prj_WLAGrKLQ42G5unZOI5FUkk5gBwxB',teamId:'team_aFPyA9tVAkB2WegquB3aADsL',environment:'production',origin:'https://api.getaux.co',deploymentId:'dpl_fixtureOnly',assignmentVerifiedAt:'2026-10-26T00:00:00Z'};
const ready={service:'aux-cloud',status:'ready',database:'reachable',schema:'current',mismatches:0,requiredMigrations:Object.keys(manifest).length,schemaManifestSha256,paymentsEnabled:false,hostedAiEnabled:false};

test('scoped probe accepts actual readiness handler and never calls maintenance or exposes the header',async()=>{
  const keys=['AUX_READINESS_SECRET','CRON_SECRET'] as const;
  const previous=Object.fromEntries(keys.map(key=>[key,process.env[key]]));
  process.env.AUX_READINESS_SECRET=secret;process.env.CRON_SECRET='a-different-cron-secret';
  try{
    const route=createReadinessRoutes(async()=>Object.entries(manifest).map(([name,sha256])=>({name,sha256})));
    const calls:{url:string;privateHeader:boolean}[]=[];
    const transport:typeof fetch=async(input,init)=>{
      const url=String(input),headers=new Headers(init?.headers);calls.push({url,privateHeader:headers.has('authorization')});
      assert.equal(init?.redirect,'error');assert.ok(init?.signal);
      if(url.endsWith('/health'))return Response.json({service:'aux-cloud',status:'ok'});
      assert.ok(url.endsWith('/internal/readiness'));
      return route.request('/readiness',{headers});
    };
    const result=await checkDeployedReadiness(review,secret,'production',transport);
    assert.equal(calls.length,3);assert.deepEqual(calls.map(call=>call.privateHeader),[false,false,true]);
    assert.equal(result.writesPerformed,false);assert.equal(result.sourceContractsAccepted,false);
    assert.equal(JSON.stringify(result).includes(secret),false);
    assert.equal(result.target.deploymentId,review.deploymentId);
  }finally{for(const key of keys){if(previous[key]===undefined)delete process.env[key];else process.env[key]=previous[key];}}
});

test('missing or mismatched target evidence refuses before any private request',async()=>{
  let calls=0;const transport:typeof fetch=async()=>{calls++;throw Error('should not run');};
  for(const bad of [null,{...review,teamId:'other'},{...review,origin:'https://unrelated.example'},{...review,origin:'https://api.getaux.co@unrelated.example'},{...review,origin:'https://dev-cloud.getaux.co'},{...review,origin:'https://api.getaux.co/path'},{...review,deploymentId:''}])
    await assert.rejects(checkDeployedReadiness(bad,secret,'production',transport),/INVALID_TARGET/);
  await assert.rejects(checkDeployedReadiness(review,secret,'development',transport),/PRIVATE_HEADER_SCOPE_REQUIRED/);
  await assert.rejects(checkDeployedReadiness(review,undefined,'production',transport),/PRIVATE_HEADER_SCOPE_REQUIRED/);
  assert.equal(calls,0);
  assert.equal(readinessTarget({...review,environment:'development',origin:'https://dev-cloud.getaux.co'}).environment,'development');
  assert.equal(readinessTarget({...review,origin:'https://aux-cloud-fixture-robzilla1738s-projects.vercel.app'}).environment,'production');
});

test('old schemas, enabled spend, transport failures and unbounded responses never pass',async()=>{
  for(const [body,error] of [[{...ready,schemaManifestSha256:'old'},'READINESS_SCHEMA_MISMATCH'],[{...ready,requiredMigrations:0},'READINESS_SCHEMA_MISMATCH'],[{...ready,hostedAiEnabled:true},'LAUNCH_MODE_MISMATCH'],[{...ready,paymentsEnabled:true},'LAUNCH_MODE_MISMATCH'],[{...ready,mismatches:1},'READINESS_SCHEMA_MISMATCH']] as const){
    let call=0;const transport:typeof fetch=async()=>++call===1?Response.json({service:'aux-cloud'}):call===2?new Response(null,{status:401}):Response.json(body);
    await assert.rejects(checkDeployedReadiness(review,secret,'production',transport),new RegExp(error));
  }
  await assert.rejects(checkDeployedReadiness(review,secret,'production',async()=>{throw Error('provider-private-'+secret);}),/^Error: READINESS_TRANSPORT_FAILED$/);
  await assert.rejects(checkDeployedReadiness(review,secret,'production',async()=>new Response('x'.repeat(16_385))),/OVERSIZED_READINESS_RESPONSE/);
});
