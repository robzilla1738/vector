/** Fixed development diagnostic artifacts. No native imports, signing or DP here. */
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
export const repository=fileURLToPath(new URL('../../',import.meta.url));
export const parentPreviewSha256='58a7808370579e09299a1d63eef02897931348ee81590d870e439c459d745752';
export const prefix='Aux.app/Contents/Resources/aux';
export const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
export function regular(file,limit=1024*1024*1024) {
 if(!path.isAbsolute(file)||fs.realpathSync(file)!==file)throw Error('Canonical input required');
 const fd=fs.openSync(file,fs.constants.O_RDONLY|fs.constants.O_NOFOLLOW|fs.constants.O_NONBLOCK);
 try{const s=fs.fstatSync(fd);if(!s.isFile()||s.uid!==process.getuid()||s.nlink!==1||(s.mode&0o022)||s.size>limit)throw Error('Private regular bounded input required');return fs.readFileSync(fd);}finally{fs.closeSync(fd);}
}
export function json(file){return JSON.parse(regular(file,8*1024*1024));}
export function pinnedJson(file,sha){const bytes=regular(file,8*1024*1024);if(!/^[a-f0-9]{64}$/.test(sha??'')||hash(bytes)!==sha)throw Error('Reviewed metadata hash mismatch');return JSON.parse(bytes);}
export function safeRelative(p){return typeof p==='string'&&p&&!path.isAbsolute(p)&&p.split('/').every(x=>x&&x!=='.'&&x!=='..');}
export function fixedScope() {
 const preview=path.join(repository,'docs/integration/proposed/node-native-boundary/approval-preview/dp-query-preview.json');
 const parent=pinnedJson(preview,parentPreviewSha256),policy=json(path.join(repository,'vendor/provided/dp-probe-policy.json'));
 const proposal=json(path.join(repository,'docs/integration/proposed/development-dp-signing/proposal.json'));
 if(parent.version!==2||parent.approvalId!==policy.approvalId||hash(JSON.stringify(parent.core))!==parent.approvalId||JSON.stringify(parent.core)!==JSON.stringify(policy.core)||proposal.exactExistingDisposableHome!==parent.core.home||proposal.exactScope!==parent.core.scope||hash(parent.core.home)!==parent.core.scope)throw Error('Original approved scope changed');
 if(proposal.identityInspection.teamId!=='9F2JXY8TCK'||proposal.identityInspection.publicCertificateSha1!=='47ACA5D1CFADD21CFEDC589B4DEED6E2B7A96D90'||proposal.proposedFirstAndOnlySharedGroup!==`9F2JXY8TCK.dev.aux.dp.${parent.core.scope}`)throw Error('Reviewed development identity changed');
 return {parent,policy,proposal,preview,proposalSha256:hash(regular(path.join(repository,'docs/integration/proposed/development-dp-signing/proposal.json')))};
}
export function helperReceipt(file,scope) {
 const receipt=json(file);
 if(receipt.version!==1||receipt.implementation!=='development-dp-scope-helper'||receipt.buildExitCode!==0||receipt.signatureVerified!==true||receipt.scope!==scope.policy.core.scope||receipt.approvalId!==scope.policy.approvalId||receipt.expectedTeam!==scope.proposal.identityInspection.teamId||receipt.expectedLeafSha1!==scope.proposal.identityInspection.publicCertificateSha1||receipt.expectedGroup!==scope.proposal.proposedFirstAndOnlySharedGroup||receipt.nativeLoaded!==false||receipt.dpCallsExecuted!==false)throw Error('Actual development helper build required');
 const sources=['vendor/provided/native/development-dp-scope-helper.mm','vendor/provided/native/dp-scope-policy.h','vendor/provided/dp-probe-policy.json','docs/integration/proposed/development-dp-signing/proposal.json','vendor/provided/build-development-dp-helper.mjs'];
 if(receipt.sources?.length!==sources.length)throw Error('Helper source coverage mismatch');
 for(const source of sources)if(!receipt.sources.some(p=>p.path===source&&p.sha256===hash(regular(path.join(repository,source)))))throw Error('Current development helper source mismatch');
 if(path.basename(receipt.output?.path??'')!=='aux-dp-scope-helper.node'||hash(regular(receipt.output.path))!==receipt.output.sha256)throw Error('Development helper output changed');
 return receipt;
}
export function checkDevelopmentReceiptShape(receipt,scope) {
 if(receipt.version!==1||receipt.implementation!=='exact-development-signing'||receipt.status!=='signed-and-verified'||receipt.mode!=='sign'||receipt.signed!==true||receipt.signingAttempted!==true||receipt.untargetedLeavesPreserved!==true||receipt.dpExecuted!==false||receipt.productLaunched!==false||receipt.proposalSha256!==scope.proposalSha256||receipt.expectedDevelopmentLeafSha1!==scope.proposal.identityInspection.publicCertificateSha1||receipt.expectedTeam!==scope.proposal.identityInspection.teamId||receipt.expectedGroup!==scope.proposal.proposedFirstAndOnlySharedGroup||!Array.isArray(receipt.finalProofs)||receipt.finalProofs.length!==(receipt.passwordManagerExcluded===true?9:11)||!Array.isArray(receipt.finalInventory)||receipt.finalInventory.length<(receipt.passwordManagerExcluded===true?9:11))throw Error('Exact successful development signing receipt required');
 const defs=[['daemon','apps/daemon/Aux Daemon.app','Contents/MacOS/aux-daemon'],['cli','apps/cli/Aux CLI.app','Contents/MacOS/aux-cli-sea'],['carrier','native/Aux Native Carrier.app','Contents/MacOS/aux-native-carrier']];
 for(const[role,relative]of defs){const proof=receipt.finalProofs.find(x=>x.path===prefix+'/'+relative);if(proof?.signer!=='development'||proof.leaf?.sha1?.toUpperCase()!==scope.proposal.identityInspection.publicCertificateSha1||proof.leaf?.team!==scope.proposal.identityInspection.teamId||proof.team!==scope.proposal.identityInspection.teamId||proof.entitlements?.['com.apple.developer.team-identifier']!==scope.proposal.identityInspection.teamId||JSON.stringify(proof.entitlements?.['keychain-access-groups'])!==JSON.stringify([scope.proposal.proposedFirstAndOnlySharedGroup]))throw Error('Actual development host signature/group proof required');}
 return defs;
}
export function freshOutput(output,forbidden=[]) {
 output=path.resolve(output);if(fs.existsSync(output)||fs.realpathSync(path.dirname(output))!==path.dirname(output)||forbidden.some(x=>output===x||output.startsWith(x+'/')||x.startsWith(output+'/')))throw Error('New output outside inputs and approved home required');fs.mkdirSync(output,{mode:0o700});return output;
}
