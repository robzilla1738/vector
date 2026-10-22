// Source and external bundling check only; never evaluates the recovery asset.
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {materializeSyncRecoveryDesktop} from './source/materialize-desktop.mjs';
const root=new URL('../../../../',import.meta.url),hash=x=>createHash('sha256').update(x).digest('hex');
const pin=JSON.parse(readFileSync(new URL('./source-pins.json',import.meta.url)));
for(const p of [...pin.files,...pin.contracts,...(pin.localBackendIntegration?.files??[])])if(hash(readFileSync(new URL(p.path,root)))!==p.sha256)throw Error('Recovery source drift: '+p.path);
const proposal=JSON.parse(readFileSync(new URL('./sync-guard-proposal.json',import.meta.url)));
let code=readFileSync(new URL(proposal.path,root),'utf8');
const guardsAlreadyApplied=hash(code)===proposal.outputSha256;
if(!guardsAlreadyApplied){
 if(hash(code)!==proposal.inputSha256)throw Error('Shared Sync guard input drift');
 for(const edit of proposal.edits){if(code.split(edit.find).length-1!==edit.count)throw Error('Shared Sync guard count drift');code=code.replace(edit.find,edit.replace);}
}
if(hash(code)!==proposal.outputSha256)throw Error('Shared Sync guard output drift');
const asset=await materializeSyncRecoveryDesktop();
if(asset.activation!==false||asset.name!=='aux-sync-recovery.mjs')throw Error('Unexpected asset contract');
// ESM remains inactive: link-free syntax check is done externally with node --check.
console.log(JSON.stringify({sourceFiles:pin.files.length,contractPins:pin.contracts.length,sharedEdits:proposal.edits.length,assetSha256:asset.sha256,bytes:asset.bytes.length,activation:false}));
