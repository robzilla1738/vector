/** Files/signatures only. Never imports native addons or executes staged hosts. */
import fs from 'node:fs';
import path from 'node:path';
import { homedir } from 'node:os';
import { createHash, randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const {bindings:rolePins}=createRequire(import.meta.url)('./native-role-pins.cjs');
import { adaptCliBinary } from './cli-adapter.mjs';
import { adaptDaemonBinary } from './daemon-adapter.mjs';
import { nativePackagingManifest } from './native-packaging-manifest.mjs';
import { checkedSubprocess as command, suppliedSeaSigningPolicy } from './prove-sea-load-only.mjs';
const repository=fileURLToPath(new URL('../../',import.meta.url));
const sha=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
function regular(p){const s=fs.lstatSync(p);if(!s.isFile()||s.isSymbolicLink()||(s.mode&0o022))throw Error('Unsafe approval artifact');return p;}
export function prepareDpApproval({resourceRoot,nativeOutput,helperReceipt,previewPath}) {
  const policy=JSON.parse(fs.readFileSync('vendor/provided/dp-probe-policy.json'));
  const id=createHash('sha256').update(JSON.stringify(policy.core)).digest('hex');
  if(id!==policy.approvalId)throw Error('Policy drift');
  const home=policy.core.home,s=fs.lstatSync(home);
  if(!s.isDirectory()||s.uid!==process.getuid()||(s.mode&0o7777)!==0o700||fs.realpathSync(home)!==home||fs.readdirSync(home).length)throw Error('Approval home must still be canonical private and empty');
  nativeOutput=fs.realpathSync(nativeOutput);resourceRoot=fs.realpathSync(resourceRoot);
  const receiptPath=regular(path.join(nativeOutput,'native-build-receipt.json')),receipt=JSON.parse(fs.readFileSync(receiptPath));
  if(sha(receiptPath)!==policy.core.nativeReceiptSha256||receipt.buildExitCode!==0||receipt.mapFixturePassed!==true)throw Error('Current compiled receipt required');
  for(const pin of nativePackagingManifest(nativeOutput).sources)if(!receipt.sources.some(e=>e.path===pin.path&&e.sha256===pin.sha256))throw Error('Current native source pin mismatch');
  function artifact(name){const p=regular(path.join(nativeOutput,name));if(!receipt.outputs.some(e=>path.resolve(e.path)===p&&e.sha256===sha(p)))throw Error('Native output pin mismatch');return p;}
  const helper=JSON.parse(fs.readFileSync(regular(helperReceipt)));
  if(helper.buildExitCode!==0||helper.scope!==policy.core.scope||helper.approvalId!==id)throw Error('Fixed-scope helper receipt required');
  for(const pin of helper.sources)if(sha(path.resolve(repository,pin.path))!==pin.sha256)throw Error('DP helper source drift');
  if(sha(regular(helper.output.path))!==helper.output.sha256)throw Error('DP helper binary drift');
  const binding=regular(path.join(resourceRoot,'apps/daemon/Aux Daemon.app/Contents/Resources/native/provided-native.node'));
  if(sha(binding)!==policy.core.originalBindingSha256)throw Error('Original binding drift');
  const outer=path.join(repository,'out/provided-dp-approval');fs.mkdirSync(outer,{recursive:true});
  const staged=fs.realpathSync(fs.mkdtempSync(path.join(outer,'staged-')));fs.chmodSync(staged,0o700);
  const root=path.join(staged,'Resources/aux'),artifacts=[],hosts=[];
  function copy(source,target){fs.mkdirSync(path.dirname(target),{recursive:true,mode:0o700});fs.copyFileSync(regular(source),target,fs.constants.COPYFILE_EXCL);if(sha(source)!==sha(target))throw Error('Staged approval bytes changed');}
  for(const name of ['libaux-native-boundary.dylib','aux-native-carrier'])copy(artifact(name),path.join(root,'native',name));
  const specs=[{name:'daemon',app:'Aux Daemon.app',source:path.join(homedir(),'Library/Application Support/Aside/AsideDaemon/mac-arm64/1.26.1016.1852/Aside Daemon.app/Contents/MacOS/aside-daemon'),executable:'aux-daemon',adapt:adaptDaemonBinary},{name:'cli',app:'Aux CLI.app',source:path.join(homedir(),'.aside/cli/Aside CLI.app/Contents/MacOS/aside'),executable:'aux-cli-sea',adapt:adaptCliBinary}];
  for(const spec of specs){
    const app=path.join(root,'apps',spec.name,spec.app),executable=path.join(app,'Contents/MacOS',spec.executable),native=path.join(app,'Contents/Resources/native');
    const original=fs.readFileSync(regular(spec.source)),adapted=spec.adapt(original),signing=suppliedSeaSigningPolicy(spec.source);
    fs.mkdirSync(path.dirname(executable),{recursive:true,mode:0o700});fs.mkdirSync(native,{recursive:true,mode:0o700});fs.writeFileSync(executable,adapted.binary,{flag:'wx',mode:0o755});
    for(const name of ['aux-native.cjs','native-role-pins.cjs','native-load-diagnostic.cjs','native-load-only-probe.cjs','native-dp-diagnostic.cjs','dp-probe-common.cjs','dp-probe-policy.json'])copy(path.join(repository,'vendor/provided',name),path.join(native,name));
    copy(artifact('aux-native-guard.node'),path.join(native,'aux-native-guard.node'));const roleBinding=regular(path.join(resourceRoot,rolePins[spec.name].suffix.slice(1),'provided-native.node'));if(sha(roleBinding)!==rolePins[spec.name].sha256)throw Error('Original role binding drift');copy(roleBinding,path.join(native,'provided-native.node'));copy(helper.output.path,path.join(native,'aux-dp-scope-helper.node'));
    const entitlements=path.join(staged,`${spec.name}-entitlements.plist`);fs.writeFileSync(entitlements,command('/usr/bin/plutil',['-convert','xml1','-o','-','-'],{input:JSON.stringify(signing.values)}).stdout,{flag:'wx',mode:0o600});
    command('/usr/bin/codesign',['--force','--sign','-','--timestamp=none','--options','runtime','--entitlements',entitlements,executable]);command('/usr/bin/codesign',['--verify','--strict','--all-architectures',executable]);
    let launch=executable;if(spec.name==='cli'){launch=path.join(path.dirname(executable),'aux-cli');copy(artifact('aux-cli-launcher'),launch);}
    hosts.push({host:spec.name,bindingSha256:sha(roleBinding),executable,launch,originalBinarySha256:createHash('sha256').update(original).digest('hex'),adaptedCodeSha256:adapted.codeSha256,signedBinarySha256:sha(executable),signing});
  }
  function inventory(directory){for(const name of fs.readdirSync(directory).sort()){const p=path.join(directory,name),s=fs.lstatSync(p);if(s.isDirectory())inventory(p);else artifacts.push({path:regular(p),sha256:sha(p)});}}inventory(staged);
  const old=JSON.parse(fs.readFileSync(previewPath));
  const preview={...old,version:2,status:'awaiting-human-approval-no-DP-operations-executed',core:policy.core,approvalId:id,currentReceipt:{path:receiptPath,sha256:sha(receiptPath)},helperReceipt:{path:path.resolve(helperReceipt),sha256:sha(helperReceipt)},stagedRoot:root,hosts,artifacts,publicChallengeBase64:randomBytes(32).toString('base64'),cleanup:{...old.cleanup,status:'compiled-exact-four-selector-helper-not-executed',continuation:'source-known exact keys derived from this home registries and explicit local MCP fixture IDs; original secure-clear, never enumeration'},remainingGates:['explicit human approval before any DP/crypto command','actual ad hoc host default/shared entitlement authority is unknown until approved probe'],executedOperations:['private empty home metadata validation','static source/binary hashing','focused helper compilation only','disposable actual SEA adaptation and ad hoc signing; no host execution/no DP calls']};
  fs.writeFileSync(previewPath,`${JSON.stringify(preview,null,2)}\n`,{mode:0o600});
  return{previewPath,previewSha256:sha(previewPath),home,scope:policy.core.scope,approvalId:id,stagedRoot:root,dpCallsExecuted:false};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){const[resourceRoot,nativeOutput,helperReceipt,previewPath]=process.argv.slice(2);if(!previewPath)throw Error('Usage: prepare-dp-approval.mjs <resources> <native-output> <helper-receipt> <preview>');console.log(JSON.stringify(prepareDpApproval({resourceRoot,nativeOutput,helperReceipt,previewPath}),null,2));}
