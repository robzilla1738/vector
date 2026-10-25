// Static cumulative source replay and isolated actual-registry proof only.
import {readFileSync,writeFileSync,mkdtempSync,rmSync,realpathSync} from 'node:fs';
import {createHash,randomUUID} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createRequire} from 'node:module';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {transformShim,pins} from './source/transform.mjs';
import {findMachOSeaSection,readSeaBlob} from '../../../../../vendor/aside/lib/sea.mjs';
import {adaptProviderLaunchCode} from '../../../../../vendor/provided/provider-launch-stage.mjs';
const root=new URL('../../../../../',import.meta.url),sha=value=>createHash('sha256').update(value).digest('hex');
const syntax=text=>{const result=spawnSync(process.execPath,['--input-type=module','--check'],{input:text,encoding:'utf8',maxBuffer:1024*1024});if(result.status!==0)throw Error('Projected syntax differs: '+result.stderr);};
const anchors=JSON.parse(readFileSync(new URL('./source/daemon-anchors.json',import.meta.url))),memoryPath='/Users/rcourson/Documents/Vibe/web/docs/integration/proposed/browser-feature-expansion/productivity-memory-native-a41/source-transforms.json',memoryBytes=readFileSync(memoryPath),memory=JSON.parse(memoryBytes),rows=[];
assert.equal(sha(memoryBytes),pins.memorySourceTransformsSha256);
const apply=(input,edits)=>{let text=input;for(const edit of edits){assert.equal(text.split(edit.before).length-1,edit.count,edit.name??'memory anchor');text=text.replace(edit.before,()=>edit.after);}return text;};
for(const entry of memory.files){
 const input=readFileSync(entry.input,'utf8');assert.equal(sha(input),entry.inputSha256);
 const memoryOnly=apply(input,entry.anchors);assert.equal(sha(memoryOnly),entry.outputSha256);
 const upgraded=apply(input,anchors),combined=apply(memoryOnly,anchors),reverse=apply(upgraded,entry.anchors);assert.equal(combined,reverse,'Independent memory/provider composition must commute');syntax(upgraded);syntax(combined);
 assert.equal(combined.includes('localAccount(this.accountId)'),false);assert.equal(combined.includes('localAccount(this.credentials.accountId)'),false);
 assert.equal(combined.split('auxChatGPTLifetime().release(ti)').length-1,input.split('auxChatGPTLifetime().release(ti)').length-1);
 rows.push({input:entry.input,inputSha256:sha(input),outputName:entry.outputName,providerOnlySha256:sha(upgraded),memoryInputSha256:sha(memoryOnly),combinedOutputSha256:sha(combined),providerAnchors:anchors.length,memoryAnchors:entry.anchors.length,syntaxPassed:true,commutes:true});
}
const binary=readFileSync('/Users/rcourson/Documents/Vibe/web/out/provided-source-snapshot-1.26.1016.1852/daemon/Contents/MacOS/aside-daemon');assert.equal(sha(binary),'60d3c50a649a528927137c427d284e695a98162476d28065bb9634e937fed286');const section=findMachOSeaSection(binary),blob=readSeaBlob(binary.subarray(section.offset,section.offset+section.size)),fresh=[];
for(const version of [1,2]){const output=adaptProviderLaunchCode(blob.code,{},'aux-v1',version);syntax(output.code);fresh.push({stateIdentityVersion:version,sha256:output.sha256,anchors:output.applied.length,syntaxPassed:true});}
const shimInput=readFileSync(new URL('vendor/aside/shims/aux-chatgpt.cjs',root),'utf8'),shim=transformShim(shimInput);assert.equal(shim.text,readFileSync(new URL('./source/aux-chatgpt.cjs',import.meta.url),'utf8'));syntax(shimInput);syntax(shim.text);
// Execute only actual registry methods against synthetic state. No daemon load.
const source=readFileSync(memory.files.find(row=>row.outputName==='aux-native-entry.mjs').input,'utf8');
const between=(start,end)=>{const a=source.indexOf(start),b=source.indexOf(end,a+start.length);assert.ok(a>=0&&b>a);assert.equal(source.split(start).length,2);return source.slice(a,b);};
const add=between('addAccount(Cn){','updateAccount(Cn,ei){'),remove=between('removeAccount(Cn,ei=','resolveAnalyticsId(Cn){');
const context=vm.createContext({structuredClone,randomUUID});
vm.runInContext(`const normalizeAccountRegistryState=structuredClone,clone$1=structuredClone,accountRegistrySchema={parse:x=>x},assertUniqueAccountUserId=()=>{},revokeExternalOwner=()=>{},notifyAccountAuthChange=()=>{},backupAccountRegistryBeforeCriticalMutation=()=>{throw Error('No credential backup permitted')},createDefaultAccountRegistry=()=>{throw Error('The base account must remain')};const registry={data:{accounts:[{id:0,incarnationId:randomUUID(),createdAt:1},{id:1,incarnationId:randomUUID(),createdAt:1}],currentAccountId:1,sessions:{},localBootstraps:{},profileBindings:{},profileAccountBindings:{}},${add},${remove}};registry.storage={withLock:fn=>{const result=fn(registry.data);if(result.next)registry.data=result.next;return result.result;}};globalThis.current=()=>registry.data.accounts.find(a=>a.id===1);globalThis.replace=()=>{registry.removeAccount(1);return registry.addAccount({name:'Synthetic replacement',mode:'local',provider:'anonymous'});};`,context);
const require=createRequire(import.meta.url),{localAccount,LocalChatGPTStore}=require('../../../../../vendor/aside/shims/aux-chatgpt.cjs'),directory=mkdtempSync(join(realpathSync(tmpdir()),'aux-instance-source-proof-'));let proof;
try{const store=new LocalChatGPTStore(join(directory,'local-only')),original=context.current(),scope=localAccount(original,context.current),oldPath=store.path(scope);store.write(scope,{version:1,issuer:'https://auth.openai.com',hostId:store.hostId(),clientId:'oaiapp_synthetic',subject:'synthetic-subject',access:'synthetic-token-only'});const replacement=context.replace(),next=localAccount(replacement,context.current);assert.equal(original.id,replacement.id);assert.notEqual(original.incarnationId,replacement.incarnationId);assert.throws(()=>store.read(scope),/incarnation changed/);assert.equal(store.read(next),undefined);assert.notEqual(store.path(next),oldPath);proof={idReused:true,incarnationChanged:true,staleOwnerRefused:true,replacementCredentialsAbsent:true,oldRecordPreserved:readFileSync(oldPath,'utf8').includes('synthetic-token-only')};}finally{rmSync(directory,{recursive:true,force:true});}
const result={format:'aux.chatgpt.account-instance.source-check.v1',daemonAnchorsSha256:sha(readFileSync(new URL('./source/daemon-anchors.json',import.meta.url))),memoryDependency:{path:memoryPath,sha256:sha(memoryBytes)},files:rows,fresh,shim:{...pins,countedEdits:shim.changes.length,syntaxPassed:true},actualRegistryProof:{...proof,addSha256:sha(add),removeSha256:sha(remove)},providerRequests:0,productExecuted:false,realCredentialsRead:false,runtimeAccepted:false};writeFileSync(new URL('./source-check.json',import.meta.url),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
