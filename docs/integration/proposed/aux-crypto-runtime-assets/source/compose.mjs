// No active SEA/staging caller imports this source preparer.
import {readFileSync} from 'node:fs';import {createHash} from 'node:crypto';
import {AUX_COLD_ENTRY_REFUSAL} from '../../../../../vendor/provided/aux-cold-entry-admission.mjs';
const root=new URL('../../../../../',import.meta.url),pin=JSON.parse(readFileSync(new URL('../source-pins.json',import.meta.url))),hash=x=>createHash('sha256').update(x).digest('hex');
function verified(record){const bytes=readFileSync(new URL(record.path,root));if(hash(bytes)!==record.sha256)throw Error('Crypto composition dependency drift: '+record.path);return bytes.toString();}
export function composeDeferredAuxCryptoEntry({mode,original,entry}){
 if(!['sea','node-development'].includes(mode)||hash(original)!==pin.originalSha256||hash(entry)!==pin.entries[mode].baselineSha256)throw Error('Exact guarded source generation required');
 if(!entry.startsWith(AUX_COLD_ENTRY_REFUSAL)||entry.split(AUX_COLD_ENTRY_REFUSAL).length-1!==1)throw Error('Actual state2 refusal must remain first');
 for(const record of pin.dependencies)verified(record);
 let code=entry;
 for(const record of pin.editTables){const table=JSON.parse(verified(record));for(const edit of table.edits){const count=edit.count??1;if(code.split(edit.find).length-1!==count)throw Error('Exact paired crypto function edit drift');code=code.split(edit.find).join(edit.replace);}}
 // Synchronous function names remain synchronous. Top-level awaited preload
 // happens only after the real guard, before ANY original initialization body.
 const preload=pin.entries[mode].preload;
 code=AUX_COLD_ENTRY_REFUSAL+preload+code.slice(AUX_COLD_ENTRY_REFUSAL.length);
 if(hash(code)!==pin.entries[mode].outputSha256)throw Error('Crypto deferred entry projection drift');
 return {code,sha256:hash(code),mode,activation:false,format:'aux.crypto-deferred-entry.v1'};
}
