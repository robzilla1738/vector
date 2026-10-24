// Static CLI source projection only. It never executes a CLI/Worker/native addon.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
const here=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(here,'../../../../..'),sha=v=>createHash('sha256').update(v).digest('hex');
const [output]=process.argv.slice(2);if(!output||!path.isAbsolute(output)||!output.startsWith('/private/tmp/'))throw Error('Fresh absolute /private/tmp output required');
try{await fs.lstat(output);throw Error('Existing output refused')}catch(error){if(error.code!=='ENOENT')throw error}
const inputs=new Map(),pin=async(p,expected)=>{const digest=sha(await fs.readFile(p));if(expected&&digest!==expected)throw Error('Input drift: '+p);if(inputs.has(p)&&inputs.get(p)!==digest)throw Error('Input changed during freeze');inputs.set(p,digest);return digest};
for(const file of ['produce.mjs','check.mjs','source/transform.mjs','source/cli-boundary.js','source/aux-owned-cli.cjs'])await pin(path.join(here,file));
const list=path.join(root,'scripts/lib/provided-stage-inputs.mjs');await pin(list);const {providedStageInputs}=await import(pathToFileURL(list));for(const relative of providedStageInputs)await pin(path.join(root,relative));
const packagePath=path.join(root,'docs/integration/proposed/standard-profile-isolation/ui-draft-identity-a1/actual-package-a1.json');await pin(packagePath);const candidate=JSON.parse(await fs.readFile(packagePath));
if(!candidate.passed||candidate.appExecuted||candidate.productSigned||candidate.runtimeAuthorityGranted)throw Error('Existing inactive package required');await pin(candidate.receipt.path,candidate.receipt.sha256);
const receipt=JSON.parse(await fs.readFile(candidate.receipt.path));
const cliRelative='Contents/Resources/aux/apps/cli/Aux CLI.app/Contents/MacOS/aux-cli-sea',wrapperRelative=cliRelative.replace('-sea','');
const cli=path.join(candidate.app,cliRelative),wrapper=path.join(candidate.app,wrapperRelative);
for(const [absolute,relative] of [[cli,cliRelative],[wrapper,wrapperRelative]]){const leaf=receipt.files.find(r=>r.path===relative);if(!leaf||leaf.type!=='file')throw Error('Actual package CLI leaf missing');await pin(absolute,leaf.sha256)}
const wrapperSource=path.join(root,'vendor/provided/native/cli-launcher.mm');await pin(wrapperSource);
const projectorInputs=path.join(root,'docs/integration/proposed/aux-final-local-entry-package/inputs.json');await pin(projectorInputs);const data=JSON.parse(await fs.readFile(projectorInputs));
const canonicalRoot=candidate.app.split('/out/')[0];
const original=path.join(canonicalRoot,'out/provided-source-snapshot-1.26.1016.1852/cli/Contents/MacOS/aside');
const {findMachOSeaSection,readSeaBlob}=await import(pathToFileURL(path.join(root,'vendor/aside/lib/sea.mjs')));
const {adaptCliCode,CLI_BINARY_SHA256,CLI_CODE_SHA256}=await import(pathToFileURL(path.join(root,'vendor/provided/cli-adapter.mjs')));
await pin(original,CLI_BINARY_SHA256);
const extract=bytes=>{const section=findMachOSeaSection(bytes);return readSeaBlob(bytes.subarray(section.offset,section.offset+section.size)).code};
const originalSource=extract(await fs.readFile(original));if(sha(originalSource)!==CLI_CODE_SHA256)throw Error('Original CLI source mismatch');
const source=extract(await fs.readFile(cli));const adapted=adaptCliCode(originalSource,{enableCloud:true,profile:'development'},'aux-v1',2,'desktop-v1');if(adapted.code!==source)throw Error('Actual complete supplied CLI adapter differs from latest package');
const priorSettlement=path.join(root,'docs/integration/proposed/standard-profile-isolation/cli-worker-settlement-a1/source/replacement.js.txt');await pin(priorSettlement);const worker=await fs.readFile(priorSettlement,'utf8');if(source.split(worker).length!==2)throw Error('Actual latest Worker-exit settlement missing');
const pdfRoot=path.join(candidate.app,'Contents/Resources/aux/apps/daemon/Aux Daemon.app/Contents/Resources/native');
for(const name of ['aux-pdf.cjs','aux-pdf-pins.cjs','aux-pdf.node']){const absolute=path.join(pdfRoot,name),relative=path.relative(candidate.app,absolute),leaf=receipt.files.find(r=>r.path===relative);if(!leaf||leaf.type!=='file')throw Error('Existing PDF operand missing');await pin(absolute,leaf.sha256)}
// Pin the concrete existing native seams; root still owns actual CLI admission.
for(const relative of ['docs/integration/proposed/aux-native-environment-preload/source/AuxNativeEnvironmentPreload.h','docs/integration/proposed/aux-native-environment-preload/source/AuxNativeEnvironmentPreload.cc','docs/integration/proposed/profile-isolation-local-finish/runtime-cache-async-relink-a3/source/AuxDevelopmentWorkerHost.cc','docs/integration/proposed/standard-profile-isolation/daemon-settlement/source/AuxNativeNodeRunner.cc','docs/integration/proposed/standard-profile-isolation/ui-native-capture-transport-a1/actual-daemon-link-a3.json','docs/integration/proposed/standard-profile-isolation/cli-identity-a1/actual-static-a1.json'])await pin(path.join(root,relative));
const {projectOwnedCliEntry}=await import(pathToFileURL(path.join(here,'source/transform.mjs')));const result=projectOwnedCliEntry(source);
let replay=source;for(const a of result.anchors){if(replay.split(a.find).length-1!==a.count)throw Error('Independent CLI replay drift');replay=replay.split(a.find).join(a.replace)}if(replay!==result.text||sha(replay)!==result.outputSha256)throw Error('Unreported CLI edit');
if(result.text.split(worker).length!==2)throw Error('Worker JSON/body/settlement changed');
const commandBody=text=>text.slice(text.indexOf('function buildProgram('),text.indexOf('var repl_guide_default ='));
if(!commandBody(source)||commandBody(source)!==commandBody(result.text))throw Error('Command registration changed');
await fs.mkdir(output,{mode:0o700});await fs.mkdir(path.join(output,'node-development'),{mode:0o700});await fs.mkdir(path.join(output,'native'),{mode:0o700});
const ordinary=path.join(output,'node-development/index.mjs'),entry=path.join(output,'node-development/aux-native-cli-entry.mjs'),loader=path.join(output,'native/aux-owned-cli.cjs');
await fs.writeFile(ordinary,source,{flag:'wx',mode:0o600});await fs.writeFile(entry,replay,{flag:'wx',mode:0o600});await fs.copyFile(path.join(here,'source/aux-owned-cli.cjs'),loader);
for(const target of [ordinary,entry,loader]){const run=spawnSync(process.execPath,['--check',target],{encoding:'utf8'});if(run.status!==0)throw Error('Syntax failed: '+run.stderr)}
for(const [p,digest] of inputs)if(sha(await fs.readFile(p))!==digest)throw Error('Operand changed during production: '+p);
const plan={format:'aux.cli-native-owner.plan.v1',input:cli,inputBinarySha256:sha(await fs.readFile(cli)),inputSourceSha256:sha(source),ordinary:{path:ordinary,sha256:sha(source),coldRefusalPreserved:true},
 entry:{path:entry,sha256:sha(replay),anchors:result.anchors},loader:{path:loader,sha256:sha(await fs.readFile(loader))},wrapper:{binary:wrapper,binarySha256:sha(await fs.readFile(wrapper)),source:wrapperSource,sourceSha256:sha(await fs.readFile(wrapperSource)),unchanged:true},
 pdfRoot,inputs:[...inputs].map(([path,sha256])=>({path,sha256})),runtimeAuthorityGranted:false,cliNativeProducerPending:true};
await fs.writeFile(path.join(output,'source-plan.json'),JSON.stringify(plan,null,2)+'\n',{flag:'wx',mode:0o600});
const evidence={format:'aux.cli-native-owner.projection.actual.v1',passed:true,output,sourcePlanSha256:sha(await fs.readFile(path.join(output,'source-plan.json'))),sourceSha256:sha(source),entrySha256:sha(replay),loaderSha256:plan.loader.sha256,
 exactSourceAnchors:result.anchors.length,independentFullSuppliedCliMatches:true,independentAnchorReplayMatches:true,wholeSourceSyntaxPassed:true,commandsAndWorkerJsonUnchanged:true,ordinarySeaAndNativeWrapperUnchanged:true,ordinaryColdRefusalPreserved:true,
 usesExistingLinkedOwner:true,nativeCliBootstrapIntegrated:false,nativeApiChanged:false,cliExecuted:false,realWorkersRun:false,nativeCommandsRun:false,providerRequests:0,nativeBuildRun:false,packaged:false,runtimeAuthorityGranted:false,runtimeAcceptance:false};
await fs.writeFile(path.join(output,'projection-evidence.json'),JSON.stringify(evidence,null,2)+'\n',{flag:'wx',mode:0o600});console.log(JSON.stringify(evidence));
