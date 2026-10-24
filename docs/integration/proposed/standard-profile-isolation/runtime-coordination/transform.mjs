import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
export function transformRuntimeCoordination(input){
  const changes=JSON.parse(fs.readFileSync(path.join(root,'anchors.json'),'utf8'));
  let text=input;
  for(const change of changes){
    if(text.split(change.find).length-1!==change.count)throw Error('Runtime coordination source anchor differs');
    text=text.replace(change.find,change.replace);
  }
  if(!text.includes('import{AsyncLocalStorage}from"node:async_hooks";'))throw Error('Pinned native AsyncLocalStorage import differs');
  const helper=fs.readFileSync(path.join(root,'source/runtime-coordination.js'),'utf8');
  if(text.includes('function auxRuntimeContext('))throw Error('Runtime coordination is already projected');
  const suffix=text.slice(-200);
  if(text.split(suffix).length!==2)throw Error('Runtime coordination suffix is ambiguous');
  const append={find:suffix,replace:suffix+'\n'+helper,count:1};text=text.replace(append.find,append.replace);
  return {text,changes:[...changes,append]};
}
