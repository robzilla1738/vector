// Static source composition only. Never evaluates the generated daemon or contacts providers.
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {findMachOSeaSection,readSeaBlob} from '../../../../../vendor/aside/lib/sea.mjs';
import {adaptProviderLaunchCode} from '../../../../../vendor/provided/provider-launch-stage.mjs';
import {transformShim, pins} from './source/transform.mjs';
const root=new URL('../../../../../',import.meta.url),sha=x=>createHash('sha256').update(x).digest('hex');
const supplied='/Users/rcourson/Documents/Vibe/web/out/provided-source-snapshot-1.26.1016.1852/daemon/Contents/MacOS/aside-daemon';
const binary=readFileSync(supplied); if(sha(binary)!=='60d3c50a649a528927137c427d284e695a98162476d28065bb9634e937fed286')throw Error('Supplied daemon differs');
const section=findMachOSeaSection(binary),blob=readSeaBlob(binary.subarray(section.offset,section.offset+section.size));
const compositions=[];
for(const version of [1,2]){
 const output=adaptProviderLaunchCode(blob.code,{},'aux-v1',version);
 const syntax=spawnSync(process.execPath,['--input-type=module','--check'],{input:output.code,encoding:'utf8',maxBuffer:1024*1024});
 if(syntax.status!==0)throw Error('Composed daemon syntax differs: '+syntax.stderr);
 const first=output.applied.findIndex(row=>row.name==='credential read is local-only'),official=output.applied.slice(first);
 if(first<0||official.some(row=>row.count!==1))throw Error('Official ChatGPT replacement counts differ');
 compositions.push({stateIdentityVersion:version,identityProfile:'aux-v1',outputSha256:output.sha256,bytes:Buffer.byteLength(output.code),totalAnchors:output.applied.length,officialCount:official.length,official,syntaxPassed:true,evaluated:false});
}
const shim=readFileSync(new URL('vendor/aside/shims/aux-chatgpt.cjs',root),'utf8'),runtime=transformShim(shim);
if(runtime.text!==readFileSync(new URL('./source/aux-chatgpt.cjs',import.meta.url),'utf8'))throw Error('Reviewed paired shim differs');
for(const text of [shim,runtime.text]){const syntax=spawnSync(process.execPath,['--check'],{input:text,encoding:'utf8'});if(syntax.status!==0)throw Error('Shim syntax differs');}
const sourcePins=['vendor/aside/shims/aux-chatgpt.cjs','vendor/aside/patches/chatgpt.mjs','vendor/aside/shims/aux-chatgpt.test.mjs'].map(path=>({path,sha256:sha(readFileSync(new URL(path,root)))}));
const result={format:'aux.chatgpt.provider-lifecycle.source-check.v1',supplied:{path:supplied,sha256:sha(binary),rawCodeSha256:sha(blob.code),bytes:Buffer.byteLength(blob.code)},compositions,runtime:{...pins,countedEdits:runtime.changes.length,syntaxPassed:true,evaluated:false},sourcePins,providerRequests:0,productExecution:false,runtimeAccepted:false};
writeFileSync(new URL('./source-check.json',import.meta.url),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({compositions:compositions.map(({official,...row})=>row),runtime:result.runtime,providerRequests:0}));
