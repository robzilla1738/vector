import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const sha=value=>createHash('sha256').update(value).digest('hex');
export function transformAuxRefreshAndSkill(input){
 const manifest=JSON.parse(readFileSync(new URL('../manifest.json',import.meta.url),'utf8'));
 for(const row of manifest.files){const file=new URL('../'+row.path,import.meta.url);if(sha(readFileSync(file))!==row.sha256)throw Error('Refresh source input changed: '+row.path)}
 const changes=JSON.parse(readFileSync(new URL('./changes.json',import.meta.url),'utf8'));let text=input;
 for(const edit of changes){if(edit.count!==1||!edit.find||text.split(edit.find).length!==2)throw Error('Refresh exact anchor conflict');text=text.split(edit.find).join(edit.replace)}
 return {text,changes};
}
