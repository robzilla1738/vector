// Source-only verifier/extractor. No evaluation of the supplied application.
import {readFileSync} from 'node:fs';import {createHash} from 'node:crypto';
const root=new URL('../../../../../',import.meta.url);
export function extractPinnedConsumers(source){
 const pin=JSON.parse(readFileSync(new URL('../source-pins.json',import.meta.url)));
 if(createHash('sha256').update(source).digest('hex')!==pin.daemon.sha256)throw Error('Frozen daemon source drift');
 for(const record of pin.dependencies)if(createHash('sha256').update(readFileSync(new URL(record.path,root))).digest('hex')!==record.sha256)throw Error('Dependency drift: '+record.path);
 return Object.fromEntries(pin.functions.map(f=>{const text=Buffer.from(source).subarray(f.start,f.end).toString();if(createHash('sha256').update(text).digest('hex')!==f.sha256)throw Error('Consumer function drift');return[f.name,text]}));
}
