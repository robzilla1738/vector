/** Qualified native-entry source projection only; never changes default staging. */
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {AUX_COLD_ENTRY_REFUSAL} from '../../../../../vendor/provided/aux-cold-entry-admission.mjs';
const pins=JSON.parse(readFileSync(new URL('../edits.json',import.meta.url),'utf8'));
export function projectOwnedNativeEntry(source){
 if(createHash('sha256').update(source).digest('hex')!==pins.inputSha256||!source.startsWith(AUX_COLD_ENTRY_REFUSAL)||source.split(AUX_COLD_ENTRY_REFUSAL).length!==2)throw Error('Exact quarantined input required');
 for(const edit of pins.edits){if(source.split(edit.find).length-1!==edit.count)throw Error('Owned native route anchor drift');source=source.replace(edit.find,edit.replace);}
 // A distinct fixed resource for the real native executable only. The current
 // default/fallback entry retains its unconditional refusal unchanged.
 // Resolving the binding creates the actual guarded native owner before any
 // dynamic imports; plain Node cannot register this binding via argv or env.
 return source.replace(AUX_COLD_ENTRY_REFUSAL,`/* aux-owned-native-entry-v1 */\nprocess._linkedBinding('aux_owned_native');\n`);
}
