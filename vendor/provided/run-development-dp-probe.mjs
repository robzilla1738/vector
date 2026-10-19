/** Root-only scoped diagnostic. Existing human approval is retained, never fabricated. */
import fs from 'node:fs';
import path from 'node:path';
import {randomBytes} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {repository,prefix,hash,regular,json,pinnedJson,fixedScope,helperReceipt,checkDevelopmentReceiptShape,freshOutput} from './development-dp-review.mjs';
import {authenticateDevelopmentProfile} from './authenticate-development-profile.mjs';
import {sanitizeDpHostFailure} from './run-approved-dp-probe.mjs';
const {checkOriginal}=createRequire(import.meta.url)('./dp-probe-common.cjs');
async function signedInputs({signedReceiptPath,signedReceiptSha256,overlayPath,overlaySha256,cmsReceiptPath,cmsReceiptSha256,testMacIdentifier,allowAppleTrustNetwork=false}) {
 if(typeof allowAppleTrustNetwork!=='boolean'||typeof testMacIdentifier!=='string'||!testMacIdentifier)throw Error('Explicit trust mode and reviewed test Mac required');
 const scope=fixedScope();
 const {verifySignedDevelopmentReceipt}=await import('./execute-development-signing.mjs');
 const receipt=verifySignedDevelopmentReceipt({receiptPath:signedReceiptPath,receiptSha256:signedReceiptSha256});
 const defs=checkDevelopmentReceiptShape(receipt,scope),overlay=pinnedJson(overlayPath,overlaySha256);
 if(receipt.allowAppleTrustNetwork!==allowAppleTrustNetwork||overlay.kind!=='unsigned-development-dp-diagnostic-overlay'||overlay.packageRoot!==receipt.packageRoot||overlay.parentPreviewSha256!==hash(regular(scope.preview))||overlay.parentApprovalId!==scope.policy.approvalId||overlay.scope!==scope.policy.core.scope||overlay.proposalSha256!==scope.proposalSha256||overlay.files?.length!==8)throw Error('Exact original-approved scope and signed diagnostic overlay required');
 const helper=helperReceipt(overlay.helperReceiptPath,scope);if(hash(regular(overlay.helperReceiptPath))!==overlay.helperReceiptSha256)throw Error('Diagnostic helper receipt changed');
 const expected=new Map();
 for(const role of ['daemon','cli'])for(const name of ['native-dp-diagnostic.cjs','dp-probe-common.cjs','dp-probe-policy.json','aux-dp-scope-helper.node'])expected.set(`${prefix}/apps/${role}/Aux ${role==='daemon'?'Daemon':'CLI'}.app/Contents/Resources/native/${name}`,name);
 for(const copy of overlay.files){const name=expected.get(copy.path),source=name==='aux-dp-scope-helper.node'?helper.output.path:path.join(repository,'vendor/provided',name==='native-dp-diagnostic.cjs'?'development-dp-diagnostic.cjs':name??'INVALID');if(!name||copy.source!==source||copy.mode!==(name==='aux-dp-scope-helper.node'?0o755:0o644)||hash(regular(source))!==copy.sha256||hash(regular(path.join(receipt.packageRoot,copy.path)))!==copy.sha256||!receipt.finalInventory.some(e=>e.path===copy.path&&e.sha256===copy.sha256&&e.mode===copy.mode))throw Error('Signed diagnostic overlay changed');expected.delete(copy.path);}
 if(expected.size)throw Error('Incomplete diagnostic overlay');
 if(hash(regular(cmsReceiptPath))!==cmsReceiptSha256)throw Error('Reviewed CMS helper receipt mismatch');
 const now=new Date().toISOString(),cmsProofs=[];
 for(const[role,relative]of defs){const profilePath=path.join(receipt.packageRoot,prefix,relative,'Contents/embedded.provisionprofile');cmsProofs.push(authenticateDevelopmentProfile({profilePath,expectedProfileSha256:hash(regular(profilePath)),receiptPath:cmsReceiptPath,proposalPath:path.join(repository,'docs/integration/proposed/development-dp-signing/proposal.json'),role:role==='cli'?'cli-sea':role,testMacIdentifier,now,allowAppleTrustNetwork}));}
 return {scope,receipt,overlay,cmsProofs};
}
export async function createDevelopmentDpReview(request) {
 const input=await signedInputs(request),{scope,receipt}=input;
 const output=freshOutput(request.output,[receipt.packageRoot,scope.policy.core.home]);
 const review={version:1,kind:'same-approved-scope-development-dp-review',createdAt:new Date().toISOString(),parentPreviewSha256:hash(regular(scope.preview)),parentApprovalId:scope.policy.approvalId,scope:scope.policy.core.scope,home:scope.policy.core.home,proposalSha256:scope.proposalSha256,signedReceiptPath:request.signedReceiptPath,signedReceiptSha256:request.signedReceiptSha256,overlayPath:request.overlayPath,overlaySha256:request.overlaySha256,cmsReceiptPath:request.cmsReceiptPath,cmsReceiptSha256:request.cmsReceiptSha256,allowAppleTrustNetwork:request.allowAppleTrustNetwork===true,reviewedDeviceSha256:hash(request.testMacIdentifier),packageRoot:receipt.packageRoot,publicChallengeBase64:randomBytes(32).toString('base64'),cmsProofs:input.cmsProofs,authorization:{scope:'Existing human approval for unchanged disposable home/source-known selectors; subsequent explicit Xcode provisioning/signing and retry instruction',originalScopeApprovalReused:true,newHumanHashClaimed:false,oldPreviewReusableAsNewArtifacts:false},limits:scope.policy.core.forbidden,dpExecuted:false,productLaunched:false};
 const file=path.join(output,'development-dp-review.json');fs.writeFileSync(file,JSON.stringify(review,null,2)+'\n',{flag:'wx',mode:0o600});return {reviewPath:file,reviewSha256:hash(regular(file)),dpExecuted:false};
}
export async function runDevelopmentDpProbe({reviewPath,reviewSha256,testMacIdentifier,phase='installation',reportPath}) {
 if(!['installation','cleanup'].includes(phase))throw Error('Only installation verification or exact scoped cleanup allowed');
 const review=pinnedJson(reviewPath,reviewSha256),scope=fixedScope();
 if(review.version!==1||review.kind!=='same-approved-scope-development-dp-review'||review.parentPreviewSha256!==hash(regular(scope.preview))||review.parentApprovalId!==scope.policy.approvalId||review.home!==scope.policy.core.home||review.scope!==scope.policy.core.scope||review.reviewedDeviceSha256!==hash(testMacIdentifier??''))throw Error('Fixed prior-approved scope review required');
 const input=await signedInputs({...review,testMacIdentifier});
 const home=review.home,s=fs.lstatSync(home);
 if(!s.isDirectory()||s.isSymbolicLink()||s.uid!==process.getuid()||(s.mode&0o7777)!==0o700||fs.realpathSync(home)!==home||hash(home)!==review.scope)throw Error('Approved home changed');
 if(reportPath&&fs.existsSync(reportPath))throw Error('New external report file required');
 const root=path.join(input.receipt.packageRoot,prefix),env={HOME:home,AUX_HOME:home,TMPDIR:home,PATH:'/usr/bin:/bin',AUX_NATIVE_KEYCHAIN_SCOPE:review.scope,AUX_ENABLE_PROVIDED_NATIVE_CARRIER:'1',AUX_DP_PROBE_APPROVED:scope.policy.approvalId,AUX_PROVIDED_DP_PROBE:'1',AUX_DP_PROBE_CHALLENGE:review.publicChallengeBase64,DYLD_INSERT_LIBRARIES:path.join(root,'native/libaux-native-boundary.dylib')};
 function child(executable,args=[],stdin,extra={}){const r=spawnSync(executable,args,{cwd:home,env:{...env,...extra},input:stdin,encoding:'utf8',timeout:30000,maxBuffer:32768});let value;try{value=JSON.parse(r.stdout);}catch{throw Error('Development diagnostic refused without structured result; native output suppressed');}if(r.status!==0||value.ok===false){const result=sanitizeDpHostFailure(value,r.status);if(value.code==='development-default-group-mismatch')result.code=value.code;return result;}return value;}
 const daemon=path.join(root,'apps/daemon/Aux Daemon.app/Contents/MacOS/aux-daemon'),cli=path.join(root,'apps/cli/Aux CLI.app/Contents/MacOS/aux-cli'),results=[];
 const operation=phase==='cleanup'?'cleanup':fs.existsSync(path.join(home,'.aux-dp-created.json'))?'verify':'initialize';
 const first=child(daemon,[],undefined,{AUX_DP_PROBE_OPERATION:operation});results.push({host:'daemon',result:first});
 if(phase!=='cleanup'&&first.ok){const carrier=path.join(root,'native/Aux Native Carrier.app/Contents/MacOS/aux-native-carrier'),binding=path.join(root,'apps/daemon/Aux Daemon.app/Contents/Resources/native/provided-native.node');try{const verified=checkOriginal((command,input)=>{const value=child(carrier,[binding,command],input);if(value.ok===false)throw Error('Original carrier refused');return value;},{expectedHash:first.publicKeyHash,challenge:review.publicChallengeBase64});results.push({host:'carrier',result:verified});if(verified.ok)results.push({host:'cli',result:child(cli,[],undefined,{AUX_DP_PROBE_OPERATION:'verify'})});}catch{results.push({host:'carrier',result:{ok:false,code:'carrier-authority-refused',statuses:[]}});}}
 const report={version:1,implementation:'development-same-approved-scope-probe',phase,operation,scope:review.scope,parentPreviewSha256:review.parentPreviewSha256,reviewSha256,signedReceiptSha256:review.signedReceiptSha256,cmsProofs:input.cmsProofs,results,ok:results.every(x=>x.result.ok===true),secretsLogged:false,productMainStarted:false};
 if(reportPath)fs.writeFileSync(reportPath,JSON.stringify(report,null,2)+'\n',{flag:'wx',mode:0o600});return report;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){const[mode,requestPath]=process.argv.slice(2);if(!['review','run'].includes(mode)||!requestPath)throw Error('Usage: run-development-dp-probe.mjs review|run explicit-request.json');const result=await(mode==='review'?createDevelopmentDpReview:runDevelopmentDpProbe)(json(path.resolve(requestPath)));console.log(JSON.stringify(result));if(result.ok===false)process.exitCode=1;}
