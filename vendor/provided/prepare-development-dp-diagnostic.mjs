/** Diagnostic overlay only: no signing, native loads, DP, or approved-home access. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {repository,prefix,hash,regular,json,fixedScope,helperReceipt,freshOutput} from './development-dp-review.mjs';
export function prepareDevelopmentDpDiagnostic({packageRoot,helperReceiptPath,output}) {
 packageRoot=path.resolve(packageRoot);if(fs.realpathSync(packageRoot)!==packageRoot)throw Error('Canonical copied package required');
 const scope=fixedScope(),report=json(path.join(packageRoot,'package.json'));
 if(report.implementation!=='supplied'||report.signed!==false||report.developmentDpLayout!==true||!report.sourceRoots?.length)throw Error('Unsigned explicit development layout required before diagnostic overlay');
 for(const source of report.sourceRoots){const p=fs.realpathSync(source);if(p===packageRoot||p.startsWith(packageRoot+'/')||packageRoot.startsWith(p+'/'))throw Error('Package/source overlap');}
 const helper=helperReceipt(path.resolve(helperReceiptPath),scope),root=path.join(packageRoot,prefix);
 if(json(path.join(root,'bundle.json')).nativeCarrierLayout!=='profile-bundle')throw Error('Compiled fixed carrier layout marker required');
 const copies=[];
 const files=[['development-dp-diagnostic.cjs','native-dp-diagnostic.cjs'],['dp-probe-common.cjs','dp-probe-common.cjs'],['dp-probe-policy.json','dp-probe-policy.json']];
 for(const role of ['daemon','cli'])for(const[sourceName,targetName]of [...files,[null,'aux-dp-scope-helper.node']]){
  const source=sourceName?path.join(repository,'vendor/provided',sourceName):helper.output.path,relative=`${prefix}/apps/${role}/Aux ${role==='daemon'?'Daemon':'CLI'}.app/Contents/Resources/native/${targetName}`,target=path.join(packageRoot,relative),bytes=regular(source);
  if(fs.realpathSync(path.dirname(target))!==path.dirname(target)||fs.existsSync(target))throw Error('Fresh canonical diagnostic target required; do not alter an existing signed/approved stage');
  copies.push({path:relative,source,sha256:hash(bytes),mode:sourceName?0o644:0o755,bytes});
 }
 output=freshOutput(output,[packageRoot,scope.policy.core.home]);
 // Every target is checked before mutation; an incomplete overlay is never signed.
 for(const copy of copies){fs.writeFileSync(path.join(packageRoot,copy.path),copy.bytes,{flag:'wx',mode:copy.mode});fs.chmodSync(path.join(packageRoot,copy.path),copy.mode);if(hash(regular(path.join(packageRoot,copy.path)))!==copy.sha256)throw Error('Diagnostic copy mismatch');}
 const overlay={version:1,kind:'unsigned-development-dp-diagnostic-overlay',packageRoot,parentPreviewSha256:scope.parent?hash(regular(scope.preview)):null,parentApprovalId:scope.policy.approvalId,scope:scope.policy.core.scope,proposalSha256:scope.proposalSha256,helperReceiptPath:path.resolve(helperReceiptPath),helperReceiptSha256:hash(regular(path.resolve(helperReceiptPath))),files:copies.map(({bytes,...copy})=>copy),signingPerformed:false,nativeExecuted:false,dpExecuted:false,approvedHomeRead:false,requires:'Regenerate exact development signing plan after overlay; actual final signed receipt required before probe'};
 fs.writeFileSync(path.join(output,'overlay.json'),JSON.stringify(overlay,null,2)+'\n',{flag:'wx',mode:0o600});return {output,overlaySha256:hash(regular(path.join(output,'overlay.json'))),copiedLeaves:copies.length,dpExecuted:false};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){if(process.argv.length!==3)throw Error('Usage: prepare-development-dp-diagnostic.mjs explicit-request.json');console.log(JSON.stringify(prepareDevelopmentDpDiagnostic(json(path.resolve(process.argv[2])))));}
