/** Actual static app staging; no product execution or cloud requests. */
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {stageProvidedApps} from '../../../../../scripts/lib/provided-apps.mjs';
const root=process.cwd(),snapshot=path.join(root,'out/provided-source-snapshot-1.26.1016.1852');
const here=path.join(root,'docs/integration/proposed/standard-profile-isolation/memory-runtime-v2-a1');
const previous='/private/tmp/aux-daemon-addon-retirement-stage-20261024-a1';
const output='/private/tmp/aux-memory-v2-app-stage-20261024-a2';
const report=await stageProvidedApps({sourceRoots:{daemon:path.join(snapshot,'daemon'),cli:path.join(snapshot,'cli')},outputRoot:output,
 cloudOptions:{enableCloud:true,profile:'development'},identityProfile:'aux-v1',stateIdentityVersion:2,featureProfile:'desktop-v1'});
const old=JSON.parse(await fs.readFile(path.join(previous,'manifest.json'),'utf8'));
const hash=b=>createHash('sha256').update(b).digest('hex'),removed=[];
for(const component of ['daemon','cli']){
 const prior=new Map(old.components[component].files.map(f=>[f.path,f]));
 for(const file of report.components[component].files){
  const before=prior.get(file.path);assert(before,file.path);prior.delete(file.path);
  const actual=path.join(output,report.components[component].app,file.path);
  const original=path.join(previous,old.components[component].app,file.path);
  assert.equal(hash(await fs.readFile(actual)),file.outputSha256,file.path);
  assert.equal(file.outputSha256,before.outputSha256,file.path);
  assert.equal((await fs.stat(actual)).mode&0o777,(await fs.stat(original)).mode&0o777,file.path);
 }
 if(component==='daemon')assert.deepEqual([...prior.keys()].sort(),['memory-bootstrap.cjs','memory-seed.cjs','memory-pins.json'].map(n=>'Contents/Resources/native/'+n).sort());else assert.equal(prior.size,0);
 for(const [name,file] of prior){await assert.rejects(fs.lstat(path.join(output,report.components[component].app,name)),{code:'ENOENT'});removed.push({component,path:name,sha256:file.outputSha256})}
}
const result={format:'aux.memory-v2.app-stage.actual.v1',passed:true,output,manifestSha256:hash(await fs.readFile(path.join(output,'manifest.json'))),removed,
 allRetainedBytesAndModesUnchanged:true,cliPreserved:true,productExecuted:false,uiChanged:false,packaged:false};
await fs.writeFile(path.join(here,'actual-app-stage-a2.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({passed:true,exactOmittedSeedHelpers:removed.length,retainedResourcesUnchanged:true}));
