// Explicit inactive source adaptation, never applied by the active daemon pipeline.
import {readFileSync} from 'node:fs';import {createHash} from 'node:crypto';
const pin=JSON.parse(readFileSync(new URL('../source-pins.json',import.meta.url)));
const root=new URL('../../../../../',import.meta.url);
const hash=x=>createHash('sha256').update(x).digest('hex');
export function applyPinnedAuxCskV2({original,composed}){
 for(const dependency of pin.dependencies)if(hash(readFileSync(new URL(dependency.path,root)))!==dependency.sha256)throw Error('CSK dependency drift');
 if(hash(original)!==pin.originalSha256||hash(composed)!==pin.composedSha256)throw Error('CSK source generation drift');
 let code=composed;
 for(const edit of pin.edits){if(original.split(edit.find).length-1!==1||code.split(edit.find).length-1!==1)throw Error('CSK adaptation anchor drift');code=code.replace(edit.find,edit.replace);}
 const header='import {encryptAuxCskV2,decryptAuxCskV2,parseAuxCskV2Record} from "./aux-csk-v2-runtime.mjs";\n';
 if(code.includes(header))throw Error('CSK adaptation already present');
 return {code:header+code,sha256:hash(header+code),format:'aux.csk.consumer-adaptation.v2',activation:false};
}
