/** Check the actual completed app-resource stage without executing any product. */
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {assertObsoleteDaemonAddonDisposition, excludeObsoleteDaemonAddon, obsoleteDaemonAddon} from '../../../../../vendor/provided/aux-daemon-obsolete-addon.mjs';
const root='/Users/rcourson/Documents/Vibe/web';
const here=path.join(root,'docs/integration/proposed/standard-profile-isolation/daemon-addon-retirement-a1');
const output='/private/tmp/aux-daemon-addon-retirement-stage-20261024-a1';
const previous=path.join(root,'out/standard-profile-finish-stage-pair-20261024/desktop-v1/apps');
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const reportBytes=await fs.readFile(path.join(output,'manifest.json'));
const report=JSON.parse(reportBytes),old=JSON.parse(await fs.readFile(path.join(previous,'manifest.json'),'utf8'));
assert.equal(report.stateIdentityVersion,2);assert.equal(report.featureProfile,'desktop-v1');
const source=await fs.readFile('/private/tmp/aux-standard-daemon-projection-20261024-a6/index.mjs','utf8');
const entry=await fs.readFile('/private/tmp/aux-standard-daemon-projection-20261024-a6/aux-native-entry.mjs','utf8');
const routing=JSON.parse(await fs.readFile(path.join(root,'docs/integration/proposed/aux-native-owned-entry-routing/edits.json'),'utf8'));
assert(source.startsWith('/* aux-cold-entry-admission-v1 */\nthrow '));
assert(entry.startsWith("/* aux-owned-native-entry-v1 */\nprocess._linkedBinding('aux_owned_native');\n"));
for(const edit of routing.edits){assert.equal(entry.split(edit.find).length-1,0);assert.equal(entry.split(edit.replace).length-1,1);}
const linkBytes=await fs.readFile(path.join(root,'docs/integration/proposed/standard-profile-isolation/integration/daemon-link-a6-inputs.json'));
const link=JSON.parse(linkBytes);
assert.equal(link.module,'/private/tmp/aux-contained-pty-module-20261023-r2/pty.node');
assert(!linkBytes.includes(Buffer.from('provided-native.node')));
for(const component of ['daemon','cli'])for(const stateIdentityVersion of [1,2])
  assert.equal(excludeObsoleteDaemonAddon({component,path:obsoleteDaemonAddon.sourcePath,stateIdentityVersion}),component==='daemon'&&stateIdentityVersion===2);
const differences=[],removed=[];
for(const component of ['daemon','cli']){
 const actual=report.components[component],prior=old.components[component];
 assertObsoleteDaemonAddonDisposition({component,stateIdentityVersion:2,files:actual.files,removed:actual.removed});
 const remaining=new Map(prior.files.map(file=>[file.path,file]));
 for(const file of actual.files){
  const absolute=path.join(output,actual.app,file.path),previousPath=path.join(previous,prior.app,file.path);
  assert.equal(sha(await fs.readFile(absolute)),file.outputSha256);
  const before=remaining.get(file.path);assert(before);remaining.delete(file.path);
  assert.equal(sha(await fs.readFile(previousPath)),before.outputSha256);
  assert.equal((await fs.stat(absolute)).mode&0o777,(await fs.stat(previousPath)).mode&0o777);
  if(before.outputSha256!==file.outputSha256)differences.push(component+'/'+file.path);
 }
 if(component==='daemon'){
  assert.deepEqual([...remaining.keys()],[obsoleteDaemonAddon.stagedPath]);
  await assert.rejects(fs.lstat(path.join(output,actual.app,obsoleteDaemonAddon.stagedPath)),{code:'ENOENT'});
  removed.push({component,path:obsoleteDaemonAddon.stagedPath,sha256:remaining.get(obsoleteDaemonAddon.stagedPath).outputSha256});
 }else assert.equal(remaining.size,0);
}
assert.deepEqual(differences,['daemon/Contents/Resources/static/skills/builtin/chrome/SKILL.md']);
// A malformed retirement record or an attempt to reuse this rule for the CLI
// must fail, rather than silently treating an absent dependency as preserved.
assert.throws(()=>assertObsoleteDaemonAddonDisposition({component:'cli',stateIdentityVersion:2,files:[],removed:[]}),/preservation/);
assert.throws(()=>assertObsoleteDaemonAddonDisposition({component:'daemon',stateIdentityVersion:2,files:[],removed:[]}),/exclusion/);
const result={format:'aux.daemon-addon-retirement.actual.v1',passed:true,output,stageManifestSha256:sha(reportBytes),linkInputSha256:sha(linkBytes),sourceSha256:sha(source),entrySha256:sha(entry),
 sourceOwnerRoutingVerified:true,ordinaryColdRefusalPreserved:true,originalLinkModuleIsPty:true,
 linkedHostLinkManifestContainsProvidedAddon:false,removed,cliPreservedByteForByte:true,
 otherExistingResourcesUnchangedExceptBrowserSkill:true,modesPreserved:true,differences,
 legacyDiagnosticShimRetainedButCannotLoadExcludedAddon:true,packaged:false,nativeRuntimeAccepted:false,productExecuted:false};
await fs.writeFile(path.join(here,'actual-stage-a2.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({passed:true,daemonAddonExcluded:true,cliPreserved:true,productExecuted:false}));
