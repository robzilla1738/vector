import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
export const pins=JSON.parse(readFileSync(new URL('./pins.json',import.meta.url)));
const sha=value=>createHash('sha256').update(value).digest('hex');
const raw=readFileSync(new URL('./anchors.json',import.meta.url));
if(sha(raw)!==pins.anchorsSha256)throw Error('Account-instance shim lifetime anchors differ');
export function transformShim(input){
 if(sha(input)!==pins.inputSha256)throw Error('Account-instance source differs');
 let text=input;const changes=JSON.parse(raw);
 for(const edit of changes){if(edit.count!==1||text.split(edit.find).length!==2)throw Error('Account-instance lifetime anchor differs');text=text.replace(edit.find,edit.replace);}
 if(sha(text)!==pins.outputSha256)throw Error('Account-instance paired shim differs');
 return {text,changes};
}
