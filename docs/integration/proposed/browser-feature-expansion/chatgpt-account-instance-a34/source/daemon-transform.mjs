// Upgrade only the reviewed cumulative A17 leaves, before or after memory A41.
// No product evaluation, native authority, credential access or output writes.
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const sha=value=>createHash('sha256').update(value).digest('hex');
const proof=JSON.parse(readFileSync(new URL('../source-check.json',import.meta.url)));
const raw=readFileSync(new URL('./daemon-anchors.json',import.meta.url));
if(sha(raw)!==proof.daemonAnchorsSha256)throw Error('Account-instance daemon anchors differ');
const anchors=JSON.parse(raw);
export function upgradeSelectedDaemon(input){
 const inputSha256=sha(input),entry=proof.files.find(row=>row.inputSha256===inputSha256||row.memoryInputSha256===inputSha256);
 if(!entry)throw Error('Unreviewed selected daemon source; refuse partial or repeated provider upgrade');
 const expected=entry.inputSha256===inputSha256?entry.providerOnlySha256:entry.combinedOutputSha256;
 let text=input;
 for(const edit of anchors){if(edit.count!==1||text.split(edit.before).length!==2)throw Error('Account-instance daemon anchor differs: '+edit.name);text=text.replace(edit.before,()=>edit.after);}
 const outputSha256=sha(text);if(outputSha256!==expected)throw Error('Account-instance daemon projection differs');
 return {text,changes:anchors,inputSha256,outputSha256};
}
