// Compose only the actual selected source/entry; never evaluate the daemon.
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {join,resolve} from 'node:path';
import {upgradeSelectedDaemon} from '../chatgpt-account-instance-a34/source/daemon-transform.mjs';
import {transformShim,pins as shimPins} from '../chatgpt-account-instance-a34/source/transform.mjs';

const here=fileURLToPath(new URL('.',import.meta.url)),root=resolve(here,'../../../../..');
const sha=value=>createHash('sha256').update(value).digest('hex');
const memoryPath=join(root,'docs/integration/proposed/browser-feature-expansion/productivity-memory-native-a41/source-transforms.json');
const memoryBytes=readFileSync(memoryPath),memory=JSON.parse(memoryBytes);
if(sha(memoryBytes)!==shimPins.memorySourceTransformsSha256)throw Error('Final memory/provider source pairing differs');
const output=join(root,'out/local-completion-source-20261025-a38');
mkdirSync(output,{mode:0o700});
const files=[];
for(const row of memory.files){
 const before=readFileSync(row.input,'utf8');
 if(sha(before)!==row.inputSha256)throw Error('Selected cumulative source changed');
 let text=before;
 for(const edit of row.anchors){
  if(text.split(edit.before).length-1!==edit.count)throw Error('Memory source anchor differs');
  text=text.replace(edit.before,()=>edit.after);
 }
 if(sha(text)!==row.outputSha256)throw Error('Memory cumulative projection differs');
 const provider=upgradeSelectedDaemon(text);
 const syntax=spawnSync(process.execPath,['--input-type=module','--check'],{input:provider.text,encoding:'utf8',maxBuffer:1024*1024});
 if(syntax.status!==0)throw Error('Paired daemon syntax failed: '+syntax.stderr);
 const path=join(output,row.outputName);
 writeFileSync(path,provider.text,{flag:'wx',mode:0o600});
 files.push({input:row.input,inputSha256:row.inputSha256,path,sha256:sha(provider.text),
  memoryAnchors:row.anchors.length,providerAnchors:provider.changes.length,syntaxPassed:true,evaluated:false});
}
const shimPath=join(root,'vendor/aside/shims/aux-chatgpt.cjs');
const shim=transformShim(readFileSync(shimPath,'utf8'));
const reviewed=join(root,'docs/integration/proposed/browser-feature-expansion/chatgpt-account-instance-a34/source/aux-chatgpt.cjs');
if(shim.text!==readFileSync(reviewed,'utf8'))throw Error('Reviewed lifetime shim differs');
const check=spawnSync(process.execPath,['--check'],{input:shim.text,encoding:'utf8'});
if(check.status!==0)throw Error('Paired shim syntax failed');
const path=join(output,'aux-chatgpt.cjs');writeFileSync(path,shim.text,{flag:'wx',mode:0o600});
files.push({input:shimPath,inputSha256:sha(readFileSync(shimPath)),path,sha256:sha(shim.text),
 lifetimeAnchors:shim.changes.length,syntaxPassed:true,evaluated:false});
const provenance=[
 'docs/integration/proposed/browser-feature-expansion/productivity-memory-native-a41/source-transforms.json',
 'docs/integration/proposed/browser-feature-expansion/chatgpt-account-instance-a34/source/daemon-transform.mjs',
 'docs/integration/proposed/browser-feature-expansion/chatgpt-account-instance-a34/source/daemon-anchors.json',
 'docs/integration/proposed/browser-feature-expansion/chatgpt-account-instance-a34/source/transform.mjs',
 'docs/integration/proposed/browser-feature-expansion/chatgpt-account-instance-a34/source/anchors.json',
 'docs/integration/proposed/browser-feature-expansion/chatgpt-account-instance-a34/source/pins.json',
 'docs/integration/proposed/browser-feature-expansion/chatgpt-account-instance-a34/source-check.json',
 'vendor/aside/patches/chatgpt.mjs','vendor/aside/shims/aux-chatgpt.cjs',
 'docs/integration/proposed/browser-feature-expansion/local-completion-package-a38/materialize.mjs'
].map(name=>({path:join(root,name),sha256:sha(readFileSync(join(root,name)))}));
const result={passed:true,output,files,provenance,uiChanged:false,productExecuted:false,providerRequests:0,signing:false};
writeFileSync(join(here,'actual-source-pair.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({passed:true,files:files.map(({path,sha256})=>({path,sha256})),uiChanged:false,productExecuted:false}));
