/** REFUSES by default. Only root may run after an explicit human approval reply. */
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
const {checkOriginal}=createRequire(import.meta.url)('./dp-probe-common.cjs');
const sha=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
function json(p){const fd=fs.openSync(p,fs.constants.O_RDONLY|fs.constants.O_NOFOLLOW|fs.constants.O_NONBLOCK);try{const s=fs.fstatSync(fd);if(!s.isFile()||s.uid!==process.getuid()||(s.mode&0o022)||s.size>4*1024*1024)throw Error('Unsafe DP approval metadata');return JSON.parse(fs.readFileSync(fd));}finally{fs.closeSync(fd);}}
export function requireApprovedPreview(previewPath,humanApprovedSha256) {
  if(!/^[a-f0-9]{64}$/.test(humanApprovedSha256??''))throw Error('Explicit human approval of the exact preview SHA256 is required; no native command launched');
  if(sha(previewPath)!==humanApprovedSha256)throw Error('Human-approved preview changed; no native command launched');
  const preview=json(previewPath),core=preview.core;
  if(preview.version!==2||preview.status!=='awaiting-human-approval-no-DP-operations-executed'||!core||createHash('sha256').update(JSON.stringify(core)).digest('hex')!==preview.approvalId)throw Error('Invalid fixed-scope approval preview');
  const s=fs.lstatSync(core.home);
  if(!s.isDirectory()||s.isSymbolicLink()||s.uid!==process.getuid()||(s.mode&0o7777)!==0o700||fs.realpathSync(core.home)!==core.home||createHash('sha256').update(core.home).digest('hex')!==core.scope)throw Error('Approved private home/scope changed');
  if(sha(preview.currentReceipt.path)!==preview.currentReceipt.sha256||preview.currentReceipt.sha256!==core.nativeReceiptSha256||sha(preview.helperReceipt.path)!==preview.helperReceipt.sha256)throw Error('Approved receipt changed');
  const staging=path.dirname(path.dirname(preview.stagedRoot));
  for(const artifact of preview.artifacts){const relative=path.relative(staging,artifact.path),stat=fs.lstatSync(artifact.path);if(relative==='..'||relative.startsWith(`..${path.sep}`)||path.isAbsolute(relative)||!stat.isFile()||stat.isSymbolicLink()||(stat.mode&0o022)||fs.realpathSync(artifact.path)!==artifact.path||sha(artifact.path)!==artifact.sha256)throw Error('Approved staged artifact changed');}
  return preview;
}
// Preserve only public bounded OSStatus metadata, never raw native errors or output.
export function sanitizeDpHostFailure(result, hostExitCode) {
  const statusArray = value => Array.isArray(value) && value.length <= 4 && value.every(n => Number.isInteger(n) && n >= -2147483648 && n <= 2147483647);
  const knownCodes = new Set(['original-native-error', 'original-native-command-threw', 'invalid-native-json', 'invalid-native-result', 'invalid-install-status', 'unexpected-existing-installation', 'installation-not-shared', 'invalid-original-public-keys', 'invalid-original-public-key-size', 'original-authority-mismatch', 'invalid-public-challenge', 'invalid-original-signature', 'original-signature-verification-failed', 'human-approval-required', 'fixed-home-scope-required', 'unapproved-probe-operation', 'scope-already-attempted-use-verify-or-cleanup', 'baseline-not-confirmed-empty', 'unowned-scope-marker', 'previous-creation-incomplete-cleanup-first', 'original-group-domain-unacceptable', 'probe-failed']);
  const failure = {ok:false, code:knownCodes.has(result?.code)?result.code:'approved-host-refused', statuses:statusArray(result?.statuses)?result.statuses:[], hostExitCode};
  if (['install-status','install-init','get-public-keys','cdp-sign'].includes(result?.lastAllowedCommand)) failure.lastAllowedCommand=result.lastAllowedCommand;
  if (['initialize','verify','cleanup'].includes(result?.operation)) failure.operation=result.operation;
  const rows=result?.exactRows;
  if (statusArray(rows?.statuses) && rows.statuses.length===4) {
    failure.exactRows={statuses:rows.statuses};
    if(Array.isArray(rows.accessGroupHashes)&&rows.accessGroupHashes.length===4&&rows.accessGroupHashes.every(h=>h===null||typeof h==='string'&&/^[a-f0-9]{64}$/.test(h)))failure.exactRows.accessGroupHashes=rows.accessGroupHashes;
    if(!failure.statuses.length)failure.statuses=rows.statuses;
  }
  return failure;
}
export function runApprovedDpProbe({previewPath,humanApprovedSha256,phase='installation',reportPath}) {
  const p=requireApprovedPreview(previewPath,humanApprovedSha256),core=p.core;
  if(!['installation','cleanup','environment'].includes(phase))throw Error('Unsupported approved phase');
  const environment={HOME:core.home,AUX_HOME:core.home,AUX_NATIVE_KEYCHAIN_SCOPE:core.scope,AUX_ENABLE_PROVIDED_NATIVE_CARRIER:'1',AUX_DP_PROBE_APPROVED:p.approvalId};
  if(phase==='environment')return{approvedScope:core.scope,environment,policy:'same approved disposable home only; source-known families only; no UI/biometric grants; no unseen family or other scope'};
  const env={...environment,PATH:'/usr/bin:/bin',TMPDIR:core.home,AUX_PROVIDED_DP_PROBE:'1',AUX_DP_PROBE_CHALLENGE:p.publicChallengeBase64,DYLD_INSERT_LIBRARIES:path.join(p.stagedRoot,'native/libaux-native-boundary.dylib')};
  function child(executable,args,input,extra={}) {
    const r=spawnSync(executable,args,{cwd:core.home,env:{...env,...extra},input,encoding:'utf8',timeout:30000,maxBuffer:32768});
    let result;try{result=JSON.parse(r.stdout);}catch{throw Error('Approved DP host refused without a structured result; no raw native output logged');}
    if(r.status!==0||result.ok===false)return sanitizeDpHostFailure(result,r.status);
    return result;
  }
  const daemon=p.hosts.find(h=>h.host==='daemon'),cli=p.hosts.find(h=>h.host==='cli');
  if(!daemon||!cli)throw Error('Approved actual SEA hosts missing');
  const results=[];
  function sea(host,operation){return child(host.launch,[],undefined,{AUX_DP_PROBE_OPERATION:operation});}
  if(phase==='cleanup')results.push({host:'daemon',result:sea(daemon,'cleanup')});
  else {
    const marker=path.join(core.home,'.aux-dp-created.json'),operation=fs.existsSync(marker)?'verify':'initialize';
    const first=sea(daemon,operation);results.push({host:'daemon',result:first});
    if(first.ok) {
      const carrier=path.join(p.stagedRoot,'native/aux-native-carrier'),binding=path.join(p.stagedRoot,'apps/daemon/Aux Daemon.app/Contents/Resources/native/provided-native.node');
      try {
        const verified=checkOriginal((command,input)=>{
          const value=child(carrier,[binding,command],input);
          if(value.ok===false)throw Error('Original carrier refused');
          return value;
        },{expectedHash:first.publicKeyHash,challenge:p.publicChallengeBase64});
        results.push({host:'carrier',result:verified});
        if(verified.ok)results.push({host:'cli',result:sea(cli,'verify')});
      }catch(error){results.push({host:'carrier',result:{ok:false,code:error.code??'carrier-authority-refused',statuses:error.statuses??[]}});}
    }
  }
  const report={version:1,phase,scope:core.scope,previewSha256:humanApprovedSha256,approvalId:p.approvalId,results,ok:results.every(e=>e.result.ok===true),secretsLogged:false,defaultGroup:'actual hashes only; no original group fallback'};
  if(reportPath)fs.writeFileSync(reportPath,`${JSON.stringify(report,null,2)}\n`,{flag:'wx',mode:0o600});
  return report;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const [previewPath,humanApprovedSha256,phase,reportPath]=process.argv.slice(2);
  const result=runApprovedDpProbe({previewPath,humanApprovedSha256,phase,reportPath});
  console.log(JSON.stringify(result,null,2));if(result.ok===false)process.exitCode=1;
}
