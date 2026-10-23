/** Count/hash-pinned daemon source successor; no staging or entry evaluation. */
import {readFileSync} from 'node:fs';import {createHash} from 'node:crypto';
import {AUX_COLD_ENTRY_REFUSAL} from '../../../../../vendor/provided/aux-cold-entry-admission.mjs';
const hash=x=>createHash('sha256').update(x).digest('hex');
export function adaptAuxSyncRecoveryDaemon(code,{kind}={}){
 const pin=JSON.parse(readFileSync(new URL('../source-pins.json',import.meta.url)));
 if(!['sea','node'].includes(kind)||hash(code)!==pin.variants[kind].inputSha256||!code.startsWith(AUX_COLD_ENTRY_REFUSAL))throw Error('Exact CAS-paired quarantined Aux entry required');
 for(const edit of pin.edits){if(code.split(edit.find).length-1!==edit.count)throw Error('Recovery source anchor drift: '+edit.name);code=code.replace(edit.find,edit.replace);}
 const preload=pin.preloads[kind];if(code.split(preload.find).length-1!==1)throw Error('Recovery preload anchor drift');code=code.replace(preload.find,preload.replace);
 if(!code.startsWith(AUX_COLD_ENTRY_REFUSAL)||hash(code)!==pin.variants[kind].outputSha256)throw Error('Recovery source projection mismatch');
 return{code,sha256:hash(code),activation:false};
}
