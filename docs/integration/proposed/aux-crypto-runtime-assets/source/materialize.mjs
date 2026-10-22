// External inactive materialization: returns fixed app-contained source assets.
import {readFileSync} from 'node:fs';import {createHash} from 'node:crypto';
const root=new URL('../../../../../',import.meta.url),pin=JSON.parse(readFileSync(new URL('../source-pins.json',import.meta.url))),hash=x=>createHash('sha256').update(x).digest('hex');
const app='apps/daemon/Aux Daemon.app/Contents/Resources';
function source(record){const bytes=readFileSync(new URL(record.path,root));if(hash(bytes)!==record.sha256)throw Error('Crypto runtime source drift: '+record.path);return bytes.toString();}
export function materializeAuxCryptoRuntimeAssets({mode}){
 if(!['sea','node-development'].includes(mode))throw Error('Explicit supported entry mode required');
 const directory=app+(mode==='node-development'?'/node-development':'')+'/aux-crypto',files=[];
 for(const record of pin.assets){
  let text=source(record);
  if(record.prefixBefore){if(text.split(record.prefixBefore).length-1!==1)throw Error('Crypto source projection drift');text=text.slice(0,text.indexOf(record.prefixBefore));}
  for(const edit of record.edits??[]){if(text.split(edit.find).length-1!==edit.count)throw Error('Crypto import/projection count drift');text=text.split(edit.find).join(edit.replace);}
  if(hash(text)!==record.outputSha256)throw Error('Crypto source projection mismatch');
  files.push({path:directory+'/'+record.name,bytes:Buffer.from(text),mode:0o644});
 }
 return {files,manifest:{format:'aux.crypto-runtime-assets.v1',mode,activation:false,directory,files:files.map(f=>({path:f.path,bytes:f.bytes.length,mode:f.mode,sha256:hash(f.bytes)}))}};
}
