import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {transformShim,pins} from './source/transform.mjs';
const root=new URL('../../../../../',import.meta.url),sha=x=>createHash('sha256').update(x).digest('hex');
const input=readFileSync(new URL('vendor/aside/shims/aux-chatgpt.cjs',root),'utf8'),output=transformShim(input);
if(output.text!==readFileSync(new URL('./source/aux-chatgpt.cjs',import.meta.url),'utf8'))throw Error('Paired source differs');
for(const text of [input,output.text]){
 if(text.includes("require('node:child_process')")||text.includes("spawn('/usr/bin/lockf'"))throw Error('Subprocess lock remains');
 const syntax=spawnSync(process.execPath,['--check'],{input:text,encoding:'utf8'});if(syntax.status!==0)throw Error('Shim syntax differs');
}
const record={format:'aux.chatgpt.direct-lock.source-check.v1',...pins,countedLifetimeEdits:output.changes.length,syntaxPassed:true,subprocessCapability:false,providerRequests:0,nativeRuntimeAccepted:false,testsSha256:sha(readFileSync(new URL('vendor/aside/shims/aux-chatgpt.test.mjs',root)))};
writeFileSync(new URL('./source-check.json',import.meta.url),JSON.stringify(record,null,2)+'\n');console.log(JSON.stringify(record));
