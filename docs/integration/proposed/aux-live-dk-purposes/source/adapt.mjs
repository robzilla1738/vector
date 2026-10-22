// Source preparation only; no active pipeline imports this adapter.
import {readFileSync} from 'node:fs';import {createHash} from 'node:crypto';
const pin=JSON.parse(readFileSync(new URL('../source-pins.json',import.meta.url))),root=new URL('../../../../../',import.meta.url),hash=x=>createHash('sha256').update(x).digest('hex');
export function adaptAuxLiveDkPurposes({original,composed}){
 if(hash(original)!==pin.originalSha256||!pin.acceptedComposedSha256.includes(hash(composed)))throw Error('Live DK purpose generation drift');
 for(const dependency of pin.dependencies)if(hash(readFileSync(new URL(dependency.path,root)))!==dependency.sha256)throw Error('Live DK dependency drift');
 let code=composed;
 for(const edit of pin.edits){if(original.split(edit.find).length-1!==1||code.split(edit.find).length-1!==1)throw Error('Live DK exact function anchor drift');code=code.replace(edit.find,edit.replace);}
 const header='import {encryptAuxSkillCache,decryptAuxSkillCache,parseAuxSkillCacheBlob,deriveAuxDaemonTokenKey,deriveAuxEvidenceKey} from "./aux-live-dk-runtime.mjs";\n';
 return {code:header+code,sha256:hash(header+code),activation:false,format:'aux.live-dk.consumer-adaptation.v2'};
}
