// Remove only the successfully verified synthetic target; never a source resource.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile,writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {join,resolve} from 'node:path';
import {parseEnv} from 'node:util';
const service=fileURLToPath(new URL('../../../../services/aux-cloud/',import.meta.url));
const require=createRequire(join(service,'package.json'));
const {neon}=require('@neondatabase/serverless');
const {get,del,head,BlobNotFoundError}=require('@vercel/blob');
const root=resolve(process.argv[2]||'');
try {
 const success=JSON.parse(await readFile(join(root,'0002.json')));
 assert.equal(success.success,true);assert.equal(success.sourceFixturesRemoved,true);
 assert.equal(success.targetBranch,'br-dark-bread-b8v0xmd8');
 assert.equal(success.targetDatabase,'aux_recovery_12_20261023');
 assert.equal(success.targetObjectPaths.length,2);
 const expected=new Map();
 for(const name of ['000004.json','000006.json']) {
  const proof=JSON.parse(await readFile(join(root,'restore-progress',name)));
  assert.equal(proof.phase,'object-verified');expected.set(proof.pathname,proof.sha256);
 }
 assert.deepEqual([...expected.keys()].sort(),[...success.targetObjectPaths].sort());
 const development=parseEnv(await readFile(join(service,'.env.local'),'utf8'));
 const token=development.BLOB_READ_WRITE_TOKEN;
 assert.equal(token.split('_')[3],'6KOQaUOaHm1IvxeQ');
 // Verify all targets before deleting either one.
 for(const [path,digest]of expected) {
  assert(/^(aux|avatars)\/[0-9a-f-]{36}\/[0-9a-f-]{36}(\/content)?$/.test(path));
  const response=await get(path,{token,access:'private',useCache:false});
  assert(response&&response.statusCode===200);
  assert.equal(new URL(response.blob.url).hostname,'6koqauoahm1ivxeq.private.blob.vercel-storage.com');
  const bytes=Buffer.from(await new Response(response.stream).arrayBuffer());
  assert.equal(createHash('sha256').update(bytes).digest('hex'),digest);
 }
 for(const path of expected.keys()) {
  await del(path,{token});await assert.rejects(()=>head(path,{token}),BlobNotFoundError);
 }
 const bootstrap=parseEnv(await readFile(join(service,'.env.production-bootstrap.local'),'utf8'));
 const url=new URL(bootstrap.DATABASE_URL_UNPOOLED);
 assert.equal(url.hostname,'ep-red-snow-b8ctxcyx.c-14.us-east-1.aws.neon.tech');
 url.hostname='ep-small-band-b87iop7i.c-14.us-east-1.aws.neon.tech';url.pathname='/neondb';
 await neon(url.toString()).query('DROP DATABASE "aux_recovery_12_20261023"');
 await writeFile(join(root,'cleanup.json'),JSON.stringify({targetObjectsDeleted:2,targetDatabaseRemoved:true,branchRemovalStillRequired:true,sourceDataChanged:false})+'\n',{flag:'wx',mode:0o600});
 console.log('Two verified synthetic target objects and isolated database removed; branch cleanup remains.');
} catch {
 console.error('Synthetic target cleanup stopped; inspect retained private progress before any retry.');process.exitCode=1;
}
