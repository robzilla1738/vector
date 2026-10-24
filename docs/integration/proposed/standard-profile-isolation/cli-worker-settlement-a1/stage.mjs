/** Complete original app-resource stage, verify the CLI-only finite delta. */
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {stageProvidedApps} from '../../../../../scripts/lib/provided-apps.mjs';
import {findMachOSeaSection,readSeaBlob} from '../../../../../vendor/aside/lib/sea.mjs';
const root=process.cwd(),here=path.join(root,'docs/integration/proposed/standard-profile-isolation/cli-worker-settlement-a1');
const snapshot=path.join(root,'out/provided-source-snapshot-1.26.1016.1852');
const previous='/private/tmp/aux-daemon-addon-retirement-stage-20261024-a1';
const output='/private/tmp/aux-cli-worker-settlement-stage-20261024-a1';
const report=await stageProvidedApps({sourceRoots:{daemon:path.join(snapshot,'daemon'),cli:path.join(snapshot,'cli')},
 outputRoot:output,cloudOptions:{enableCloud:true,profile:'development'},identityProfile:'aux-v1',stateIdentityVersion:2,featureProfile:'desktop-v1'});
const old=JSON.parse(await fs.readFile(path.join(previous,'manifest.json'),'utf8'));
const sha=value=>createHash('sha256').update(value).digest('hex');
const prior=old.components.cli,actual=report.components.cli,remaining=new Map(prior.files.map(file=>[file.path,file])),changed=[];
for(const file of actual.files){
 const before=remaining.get(file.path);assert(before);remaining.delete(file.path);
 const current=path.join(output,actual.app,file.path),original=path.join(previous,prior.app,file.path);
 assert.equal(sha(await fs.readFile(current)),file.outputSha256);
 assert.equal((await fs.stat(current)).mode&0o777,(await fs.stat(original)).mode&0o777);
 if(file.outputSha256!==before.outputSha256)changed.push(file.path);
}
assert.equal(remaining.size,0);assert.deepEqual(changed,['Contents/MacOS/aux-cli']);
const binary=await fs.readFile(path.join(output,actual.app,'Contents/MacOS/aux-cli'));
const section=findMachOSeaSection(binary),code=readSeaBlob(binary.subarray(section.offset,section.offset+section.size)).code;
const proof=JSON.parse(await fs.readFile(path.join(here,'actual-source-a1.json'),'utf8'));
assert.equal(sha(code),proof.sourceSha256);
assert(code.startsWith('#!/usr/bin/env node\n/* aux-cold-entry-admission-v1 */\nthrow '));
const result={format:'aux.cli-worker-stage.actual.v1',passed:true,output,manifestSha256:sha(await fs.readFile(path.join(output,'manifest.json'))),
 cliSourceSha256:sha(code),cliBinarySha256:sha(binary),changedCliLeaves:changed,otherCliResourcesAndModesUnchanged:true,
 defaultColdRefusalPreserved:true,nativeApiChanged:false,appLaunched:false,cliExecuted:false,nativeCommandRun:false,packaged:false};
await fs.writeFile(path.join(here,'actual-stage-a1.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({passed:true,changedCliLeaves:1,cliExecuted:false}));
