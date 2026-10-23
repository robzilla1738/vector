/** Inactive source successor. Input must already be the reviewed Aux CSK-v2 composition. */
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const table=JSON.parse(readFileSync(new URL('../source-pins.json',import.meta.url)));
const sha=x=>createHash('sha256').update(x).digest('hex');
export function adaptAtomicCskSource(code,{expectedInputSha256,expectedOutputSha256}={}){
 if(!/^[a-f0-9]{64}$/.test(expectedInputSha256??'')||sha(code)!==expectedInputSha256)throw Error('Unreviewed atomic CSK input');
 const projection=Object.values(table.reviewedVariants).find(v=>v.inputSha256===expectedInputSha256);
 if(!projection)throw Error('Atomic CSK source variant has no reviewed projection');
 let output=code;
 for(const e of table.edits){if(output.split(e.find).length-1!==e.count)throw Error('Atomic CSK source drift: '+e.name);output=output.split(e.find).join(e.replace);}
 if(sha(output)!==projection.outputSha256 || (expectedOutputSha256 && sha(output)!==expectedOutputSha256))throw Error('Atomic CSK output projection mismatch');
 return {code:output,inputSha256:sha(code),sha256:sha(output),edits:table.edits.map(({name,count})=>({name,count}))};
}
