// Pure future resource constructor; never signs, loads a helper or activates it.
import fs from 'node:fs';
import crypto from 'node:crypto';
const [policyPath,rawPath,signedPath,outputPath]=process.argv.slice(2);
if(!outputPath)throw Error('Expected v10, exact raw helper, separately signed helper, fresh output.');
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const source=fs.readFileSync(policyPath),raw=fs.readFileSync(rawPath),delivered=fs.readFileSync(signedPath);
if(sha(raw)!=='b9cf27a0832388cf154434f192d59739b2ce4c18463d7b4387b0c49e2857f79f'||raw.length!==68464||sha(delivered)===sha(raw)||delivered.length<raw.length||delivered.length>32*1024*1024)throw Error('Exact raw helper and bounded separately delivered signature derivative required.');
if(sha(source)!=='0ea7e93e94de7f07006aa4389fa842acb61bc50a37d682941a8d2dcf8e837b65')throw Error('Exact prepared v10 policy bytes required.');
const policy=JSON.parse(source);
const keys=['format','role','accessGroup','authoritySelection','nativeHostLayout','taskLayout','storageLocation','pdfModule','macOSUtilitiesModule'];
if(Object.keys(policy).sort().join()!==keys.sort().join()||policy.format!=='aux.fresh.bootstrap.policy.v10'||policy.role!=='daemon'||policy.nativeHostLayout!=='embedded-daemon'||policy.taskLayout!=='aux.native.task-control-split.v1'||policy.authoritySelection!=='aux.fresh.authority.host-availability.v1')throw Error('Exact current fixed builtin v10 role required.');
policy.format='aux.fresh.bootstrap.policy.v11';
policy.linkedPty={format:'aux.pty.fixed-linked-helper.v1',binding:'aux_pty_builtin',napi:8,spawnHelper:{path:'Contents/Resources/native/node-pty/prebuilds/darwin-arm64/spawn-helper',identifier:'dev.aux.browser.pty-spawn-helper',sourceSha256:sha(raw),sha256:sha(delivered),bytes:delivered.length,architecture:'arm64'}};
fs.writeFileSync(outputPath,JSON.stringify(policy)+'\n',{flag:'wx',mode:0o644});
process.stdout.write(JSON.stringify({sourceSha256:sha(source),helperSourceSha256:sha(raw),helperDeliveredSha256:sha(delivered),policySha256:sha(fs.readFileSync(outputPath)),signedOrExecuted:false,authorityGranted:false,requiresActualNativeSignatureAndESValidation:true})+'\n');
