import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readdir,readFile,lstat} from 'node:fs/promises';
import path from 'node:path';
const root='/Users/rcourson/Documents/Vibe/web';
const baseline=path.join(root,'out/provided-reuse-aux-cli-registration/ui/agent');
const stage=path.join(root,'out/provided-reuse-aux-carrier-pdf-lifetime/ui/agent');
const sha=data=>createHash('sha256').update(data).digest('hex');
async function tree(root,relative='') {
 const files=[];
 for(const entry of(await readdir(path.join(root,relative),{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name,'en'))){
  const name=path.posix.join(relative,entry.name);assert(!entry.isSymbolicLink());
  if(entry.isDirectory()) files.push(...await tree(root,name));
  else {assert(entry.isFile());const file=path.join(root,name);files.push({path:name,bytes:(await lstat(file)).size,sha256:sha(await readFile(file))});}
 }
 return files;
}
const previous=await tree(baseline),current=await tree(stage);
assert.equal(previous.length,1215);assert.deepEqual(current,previous);
assert.equal(current.filter(item=>item.path.endsWith('.css')).length,5);
console.log(JSON.stringify({version:1,baseline,stage,comparedFiles:1215,stylesheets:5,allBytesEqual:true,inventorySHA256:sha(JSON.stringify(current)),actualRenderedComparison:false},null,2));
