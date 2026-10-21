/** Copy-only cache refresh for the explicitly signed Vault exclusion daemon.
 * Never signs, launches product code, provisions, or accesses Keychain data.
 * Historical receipt validation code remains unchanged. */
import fs from 'node:fs';
import path from 'node:path';
import { createHash, X509Certificate } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { developmentSnapshot } from './execute-development-signing.mjs';
import { reviewedUiResourceInventory } from './reuse-development-authority.mjs';
import { fixedScope, pinnedJson, regular, freshOutput, prefix } from './development-dp-review.mjs';
import { inspectSigningCode } from '../../scripts/lib/provided-signing-policy.mjs';
import { adaptDaemonBinary } from './daemon-adapter.mjs';
import { findMachOSeaSection, readSeaBlob } from '../aside/lib/sea.mjs';
import { disabledSeed } from './vault-product-exclusion.mjs';
const hash = value => createHash('sha256').update(value).digest('hex');
const stable = value => JSON.stringify(value, (_, v) => v && !Array.isArray(v) && typeof v === 'object' ? Object.fromEntries(Object.entries(v).sort()) : v);
const same = (a,b,message) => { if (stable(a)!==stable(b)) throw Error(message); };
const daemonRelative = 'apps/daemon/Aux Daemon.app';
const daemonPath = prefix+'/'+daemonRelative;
const executable = 'Contents/MacOS/aux-daemon';
const seed = 'Contents/Resources/static/skills/builtin/password-manager/SKILL.md';
const receiptPin = '751bcfbb4a6ff5279d4517e4775b3b45b4484e1f3bb1c687ac005d6549b82ceb';
const sourcePin = 'd5133e910653114e22484906ac524dacf449d6fc69f20837c610207f9ba6f465';
const signedBinaryPin = '24f8117933a3642c7a22f736b89a5c8adefa7f2ab371f9d63c88755ac2981b7f';
const sort = list => [...list].sort((a,b)=>a.path.localeCompare(b.path,'en'));
const snapshot = root => developmentSnapshot(root).map(row=>({...row,path:prefix+'/'+row.path}));
function canonical(dir) { if (!path.isAbsolute(dir)||fs.realpathSync(dir)!==dir||!fs.statSync(dir).isDirectory()) throw Error('Canonical directory required'); return dir; }
function codesign(args) { const r=spawnSync('/usr/bin/codesign',args,{encoding:'utf8',timeout:120000,maxBuffer:1048576});if(r.error||r.signal||r.status!==0)throw Error('Static codesign inspection failed');return r; }
function verifyAll(root, targets) { if(targets.length!==8||new Set(targets.map(t=>t.path)).size!==8)throw Error('Eight unique proofs required');for(const t of targets){if(!t.path.startsWith(prefix+'/'))throw Error('Unsafe helper target');codesign(['--verify','--strict','--all-architectures',path.join(root,t.path.slice(prefix.length+1))]);} }
function codeHash(bytes) { const s=findMachOSeaSection(bytes);return hash(readSeaBlob(bytes.subarray(s.offset,s.offset+s.size)).code); }
export function refreshVaultExclusionCache({ cachePath, cacheSha256, signedReceiptPath, signedReceiptSha256, packageRoot, packageReportSha256, originalDaemonPath, resourceReview=[], output }) {
  if(signedReceiptSha256!==receiptPin)throw Error('Only exact approved signed daemon receipt admitted');
  const scope=fixedScope(), cache=pinnedJson(cachePath,cacheSha256), receipt=pinnedJson(signedReceiptPath,signedReceiptSha256);
  if(cache.kind!=='exact-signed-aux-resource-cache'||cache.version!==1||cache.scope!==scope.policy.core.scope||cache.proposalSha256!==scope.proposalSha256||cache.authorityOperation!=='verify'||!cache.authorityProofInherited||cache.appleSigningPerformed!==false||cache.keychainOperationsPerformed!==false||cache.passwordManagerExcluded!==true)throw Error('Exact historical authority cache required');
  const oldRoot=canonical(path.join(path.dirname(cachePath),'resources'));
  same(sort(snapshot(oldRoot)),sort(cache.signedResources),'Original cache inventory changed');verifyAll(oldRoot,cache.parentFinalProofs);
  if(receipt.status!=='signed-and-static-verified-no-runtime'||receipt.privateKeySigningPerformed!==true||receipt.provisioningPerformed!==false||receipt.keychainDataOperationsPerformed!==false||receipt.productRuntimeExecuted!==false||!receipt.allOtherLeavesPreserved||!receipt.nestedSignatureVerification)throw Error('Approved signing outcome required');
  const signedApp=canonical(receipt.app), signedLeaves=developmentSnapshot(signedApp);
  const recorded=receipt.finalInventory.map(({path,sha256,mode,type})=>{if(type!=='file')throw Error('Only reviewed regular daemon leaves admitted');return{path,sha256,mode};});
  same(sort(signedLeaves),sort(recorded),'Signed daemon receipt inventory mismatch');
  pinnedJson(path.join(path.dirname(signedReceiptPath),'profile-authentication.json'),receipt.profileAuthenticationSha256);
  const signedCode=regular(path.join(signedApp,executable));
  if(hash(signedCode)!==signedBinaryPin||codeHash(signedCode)!==sourcePin||hash(regular(path.join(signedApp,seed)))!==hash(disabledSeed))throw Error('Exact approved daemon code and seed required');
  const oldDaemon=cache.signedResources.filter(v=>v.path.startsWith(daemonPath+'/')).map(v=>({...v,path:v.path.slice(daemonPath.length+1)}));
  const allowed=new Set([executable,seed,'Contents/_CodeSignature/CodeResources']);
  same(sort(oldDaemon.filter(v=>!allowed.has(v.path))),sort(signedLeaves.filter(v=>!allowed.has(v.path))),'Other daemon leaves or nested helpers changed');
  const oldProof=cache.parentFinalProofs.find(v=>v.path===daemonPath);
  if(!oldProof||oldProof.signer!=='development')throw Error('Original daemon development proof missing');
  const observed=inspectSigningCode(path.join(signedApp,executable));
  same(observed.entitlements,oldProof.entitlements,'Daemon capability change');same(observed.entitlements,receipt.entitlements,'Signed receipt capability mismatch');same(observed.flags,oldProof.flags,'Daemon signing flags changed');
  const team=codesign(['-dvvv',path.join(signedApp,executable)]).stderr.match(/^TeamIdentifier=(.+)$/m)?.[1];if(team!==oldProof.team)throw Error('Daemon team changed');
  const profileSha256=hash(regular(path.join(signedApp,'Contents/embedded.provisionprofile')));if(profileSha256!==oldProof.profileSha256)throw Error('Daemon provisioning changed');
  packageRoot=canonical(packageRoot);const report=pinnedJson(path.join(packageRoot,'package.json'),packageReportSha256);
  if(report.implementation!=='supplied'||report.signed!==false||report.developmentDpLayout!==true||report.boundaryReceiptSha256!==cache.boundaryReceiptSha256||report.finalApp!==cache.finalApp)throw Error('Matching fresh unsigned package required');
  const freshRoot=canonical(path.join(packageRoot,prefix)), fresh=snapshot(freshRoot);
  const adapted=adaptDaemonBinary(regular(originalDaemonPath));
  if(adapted.codeSha256!==sourcePin||hash(regular(path.join(freshRoot,daemonRelative,executable)))!==hash(adapted.binary)||hash(regular(path.join(freshRoot,daemonRelative,seed)))!==hash(disabledSeed))throw Error('Fresh package is not exact production adapter output');
  let expected=reviewedUiResourceInventory(cache.unsignedResources,resourceReview);
  for(const relative of [executable,seed]){const key=daemonPath+'/'+relative,before=expected.find(v=>v.path===key),after=fresh.find(v=>v.path===key);if(!before||!after||before.link||after.link||before.mode!==after.mode)throw Error('Unexpected daemon baseline topology');expected=expected.map(v=>v.path===key?after:v);}
  const expectedMap=new Map(expected.map(v=>[v.path,v])); const freshMap=new Map(fresh.map(v=>[v.path,v]));
  const differences=[...new Set([...expectedMap.keys(),...freshMap.keys()])].filter(k=>stable(expectedMap.get(k))!==stable(freshMap.get(k)));
  if(differences.length)throw Error('Unsigned package has unreviewed resource changes: '+JSON.stringify(differences));
  const repository=path.resolve(new URL('../../',import.meta.url).pathname);
  output=path.resolve(output);if(!output.startsWith(path.join(repository,'out')+'/'))throw Error('Project-owned fresh cache output required');
  freshOutput(output,[packageRoot,path.dirname(cachePath),signedApp,scope.policy.core.home]);
  const certificatePrefix=path.join(output,'daemon-certificate-');codesign(['-d','--extract-certificates='+certificatePrefix,path.join(signedApp,executable)]);
  const cert=new X509Certificate(regular(certificatePrefix+'0')),leaf={sha1:cert.fingerprint.replaceAll(':','').toUpperCase(),team:[...cert.subject.matchAll(/^OU=(.+)$/gm)].map(m=>m[1])[0]??null};
  same(leaf,oldProof.leaf,'Daemon signer certificate changed');if(leaf.sha1!==receipt.identitySha1)throw Error('Approved signing identity mismatch');
  const proof={...oldProof,sha256:signedBinaryPin,flags:observed.flags,entitlements:observed.entitlements,team,leaf,profileSha256};
  const target=path.join(output,'resources');fs.cpSync(oldRoot,target,{recursive:true,errorOnExist:true,force:false,verbatimSymlinks:true,mode:fs.constants.COPYFILE_FICLONE});
  for(const row of resourceReview)fs.copyFileSync(path.join(freshRoot,row.path.slice(prefix.length+1)),path.join(target,row.path.slice(prefix.length+1)));
  fs.rmSync(path.join(target,daemonRelative),{recursive:true});fs.cpSync(signedApp,path.join(target,daemonRelative),{recursive:true,errorOnExist:true,force:false,verbatimSymlinks:true,mode:fs.constants.COPYFILE_FICLONE});
  const proofs=cache.parentFinalProofs.map(v=>v.path===daemonPath?proof:v);
  let signedExpected=reviewedUiResourceInventory(cache.signedResources,resourceReview).filter(v=>!v.path.startsWith(daemonPath+'/'));
  signedExpected.push(...signedLeaves.map(v=>({...v,path:daemonPath+'/'+v.path})));
  const final=snapshot(target);same(sort(final),sort(signedExpected),'Refreshed resource inventory differs');verifyAll(target,proofs);
  const result={...cache,unsignedResources:fresh,signedResources:final,parentFinalProofs:proofs,resourceSigningLineage:{kind:'seven-inherited-helpers-plus-one-reviewed-signed-daemon',originalCachePath:cachePath,originalCacheSha256:cacheSha256,originalParentFinalProofs:cache.parentFinalProofs,newDaemonSigningReceiptPath:signedReceiptPath,newDaemonSigningReceiptSha256:signedReceiptSha256,newDaemonProof:proof,sevenHelperProofsInheritedUnchanged:true,parentFinalProofsMeaning:'Compatibility field contains current retained proofs; daemon proof supersedes original parent, not claimed signed by historical receipt',freshPackageReportPath:path.join(packageRoot,'package.json'),freshPackageReportSha256:packageReportSha256,resourceReview,refreshAppleSigningPerformed:false,earlierDaemonAppleSigningPerformed:true,installationAuthorityInherited:true,daemonRuntimeAuthorityRevalidated:false},appleSigningPerformed:false,keychainOperationsPerformed:false,productLaunched:false};
  const cacheOutput=path.join(output,'cache.json');fs.writeFileSync(cacheOutput,JSON.stringify(result,null,2)+'\n',{flag:'wx',mode:0o600});
  return{cachePath:cacheOutput,cacheSha256:hash(regular(cacheOutput)),sevenOtherHelperProofsPreserved:true,newDaemonProof:proof,appleSigningPerformed:false,keychainOperationsPerformed:false};
}
