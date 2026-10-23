/** Exact accepted account UI + counted daemon status/context pairing; no staging. */
import {readFileSync} from 'node:fs';import {createHash} from 'node:crypto';
const root=new URL('../../../../../',import.meta.url),hash=x=>createHash('sha256').update(x).digest('hex');
const table=()=>JSON.parse(readFileSync(new URL('../source-pins.json',import.meta.url)));
function apply(text,edits){for(const edit of edits){if(text.split(edit.find).length-1!==edit.count)throw Error('Recovery enrollment anchor drift: '+edit.name);text=text.replace(edit.find,edit.replace);}return text;}
export function adaptAuxRecoveryEnrollmentUI({component,path,text,mode='accepted'}){
 const p=table();if(component!=='agent'||path!==p.ui.path)return{text,anchors:[]};
 if(!['accepted','stage-prebranding'].includes(mode))throw Error('Unreviewed UI composition phase');
 const projection=mode==='accepted'?p.ui:p.ui.stagePreBranding;
 if(hash(text)!==projection.inputSha256)throw Error('Exact accepted account UI required');
 const output=apply(text,projection.edits);if(hash(output)!==projection.outputSha256)throw Error('Recovery enrollment UI projection mismatch');
 return{text:output,anchors:projection.edits.map(edit=>({kind:'integration',...edit}))};
}
export function adaptAuxRecoveryEnrollmentDaemon(code,{expectedInputSha256}={}){
 const p=table();if(hash(code)!==expectedInputSha256||!Object.values(p.daemon.variants).some(v=>v.inputSha256===expectedInputSha256))throw Error('Exact current recovery-paired daemon required');
 const expected=Object.values(p.daemon.variants).find(v=>v.inputSha256===expectedInputSha256),output=apply(code,p.daemon.edits);
 if(hash(output)!==expected.outputSha256)throw Error('Recovery enrollment daemon projection mismatch');return{code:output,sha256:hash(output),activation:false};
}
export function materializeAuxRecoveryEnrollmentUI(){
 const p=table(),files=p.assets.map(record=>{const bytes=readFileSync(new URL(record.source,root));if(hash(bytes)!==record.sha256)throw Error('Recovery enrollment asset drift');return{path:record.path,bytes,mode:0o644};});
 return{files,activation:false};
}
