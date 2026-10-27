import {writeFile,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import manifest from '../src/schema-manifest.json';

const project='prj_WLAGrKLQ42G5unZOI5FUkk5gBwxB',team='team_aFPyA9tVAkB2WegquB3aADsL';
export const schemaManifestSha256=createHash('sha256').update(JSON.stringify(manifest)).digest('hex');
type Review={format:'aux.readiness-target.v1';projectId:string;teamId:string;environment:'development'|'production';origin:string;deploymentId:string;assignmentVerifiedAt:string};
function refuse(code:string):never {throw Error(code);}
export function readinessTarget(value:unknown):Review {
  if(!value||typeof value!=='object')refuse('INVALID_TARGET_REVIEW');
  const row=value as Review;
  if(row.format!=='aux.readiness-target.v1'||row.projectId!==project||row.teamId!==team||!['development','production'].includes(row.environment)||!/^dpl_[A-Za-z0-9]+$/.test(row.deploymentId)||!Number.isFinite(Date.parse(row.assignmentVerifiedAt)))refuse('INVALID_TARGET_REVIEW');
  let url:URL;try{url=new URL(row.origin);}catch{refuse('INVALID_TARGET_ORIGIN');}
  if(url!.origin!==row.origin||url!.protocol!=='https:'||url!.username||url!.password)refuse('INVALID_TARGET_ORIGIN');
  const unique=/^aux-cloud-[a-z0-9]+-robzilla1738s-projects\.vercel\.app$/.test(url!.hostname);
  const alias=row.origin===(row.environment==='production'?'https://api.getaux.co':'https://dev-cloud.getaux.co');
  if(!unique&&!alias)refuse('INVALID_TARGET_ORIGIN');
  // The hostname alone does not establish its current Vercel assignment.
  // The operator records exact deployment/environment evidence before this check.
  return {format:row.format,projectId:project,teamId:team,environment:row.environment,origin:row.origin,deploymentId:row.deploymentId,assignmentVerifiedAt:row.assignmentVerifiedAt};
}
async function boundedJson(response:Response) {
  const reader=response.body?.getReader();if(!reader)refuse('INVALID_READINESS_RESPONSE');
  const chunks:Uint8Array[]=[];let bytes=0;
  try{for(;;){const next=await reader!.read();if(next.done)break;bytes+=next.value.length;if(bytes>16_384){await reader!.cancel();refuse('OVERSIZED_READINESS_RESPONSE');}chunks.push(next.value);}}
  finally{reader!.releaseLock();}
  try{return JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{refuse('INVALID_READINESS_RESPONSE');}
}
export async function checkDeployedReadiness(review:unknown,secret:string|undefined,secretEnvironment:string|undefined,transport:typeof fetch=fetch) {
  const target=readinessTarget(review);
  if(secretEnvironment!==target.environment||!secret||secret.length<32||/[\r\n]/.test(secret))refuse('PRIVATE_HEADER_SCOPE_REQUIRED');
  const request=async(path:string,authenticated=false)=>{
    try{return await transport(target.origin+path,{headers:authenticated?{Authorization:'Bearer '+secret}:{},redirect:'error',signal:AbortSignal.timeout(20_000)});}
    catch{refuse('READINESS_TRANSPORT_FAILED');}
  };
  const health=await request('/api/v1/health');
  if(health.status!==200)refuse('LIVENESS_FAILED');
  if((await boundedJson(health)).service!=='aux-cloud')refuse('WRONG_SERVICE');
  const denied=await request('/api/v1/internal/readiness');
  if(denied.status!==401){await denied.body?.cancel();refuse('READINESS_AUTH_DENIAL_FAILED');}
  await denied.body?.cancel();
  const response=await request('/api/v1/internal/readiness',true);
  if(response.status!==200){await response.body?.cancel();refuse('AUTHENTICATED_READINESS_FAILED');}
  const ready=await boundedJson(response);
  if(ready.service!=='aux-cloud'||ready.status!=='ready'||ready.database!=='reachable'||ready.schema!=='current'||ready.mismatches!==0||ready.requiredMigrations!==Object.keys(manifest).length||ready.schemaManifestSha256!==schemaManifestSha256)refuse('READINESS_SCHEMA_MISMATCH');
  if(ready.paymentsEnabled!==false||ready.hostedAiEnabled!==false)refuse('LAUNCH_MODE_MISMATCH');
  return {format:'aux.deployed-readiness.v2',checkedAt:new Date().toISOString(),target,requiredMigrations:Object.keys(manifest).length,schemaManifestSha256,
    checks:['public liveness 200','unauthenticated readiness 401','authenticated database/schema readiness 200','expected schema manifest','payments and hosted AI disabled'],
    writesPerformed:false,paidProviderCalls:0,sourceContractsAccepted:false,providerSecretPairingVerified:false,maintenanceInvoked:false};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  try{
    const args=process.argv.slice(2);
    if(args.length!==4||args[0]!=='--target-review'||args[2]!=='--output')refuse('USAGE_TARGET_REVIEW_AND_NEW_OUTPUT_REQUIRED');
    const review=JSON.parse(await readFile(args[1],'utf8'));
    const result=await checkDeployedReadiness(review,process.env.AUX_READINESS_SECRET,process.env.AUX_READINESS_SECRET_ENVIRONMENT);
    await writeFile(args[3],JSON.stringify(result,null,2)+'\n',{flag:'wx',mode:0o600});
    console.log(JSON.stringify(result));
  }catch(error){
    const code=error instanceof Error&&/^[A-Z_]+$/.test(error.message)?error.message:'READINESS_CHECK_FAILED';
    console.error(code);process.exitCode=1;
  }
}
