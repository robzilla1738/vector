// Source-only successor; no new native authority, accepted-route or UI change.
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const pins=JSON.parse(readFileSync(new URL('../edits.json',import.meta.url),'utf8'));
export function projectOwnedExecLifetime(source){
 if(createHash('sha256').update(source).digest('hex')!==pins.inputSha256)throw Error('Exact owned PTY projection required');
 for(const edit of pins.edits){if(source.split(edit.find).length-1!==edit.count)throw Error('Exec lifetime anchor drift: '+edit.name);source=source.replace(edit.find,edit.replace)}
 return source;
}
