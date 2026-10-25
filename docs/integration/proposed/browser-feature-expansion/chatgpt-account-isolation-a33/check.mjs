// Execute only two actual account registry methods with synthetic in-memory state.
// No daemon evaluation, credentials, provider requests or filesystem mutation.
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url),{localAccount}=require('../../../../../vendor/aside/shims/aux-chatgpt.cjs');
const sourcePath='/Users/rcourson/Documents/Vibe/web/docs/integration/proposed/browser-feature-expansion/fresh-startup-milestone-a42/http-request-adapter-source/aux-native-entry.mjs';
const source=readFileSync(sourcePath,'utf8'),sha=x=>createHash('sha256').update(x).digest('hex');
const between=(start,end)=>{const first=source.indexOf(start),last=source.indexOf(end,first+start.length);assert.ok(first>=0&&last>first);assert.equal(source.split(start).length,2);return source.slice(first,last);};
const pieces={add:between('addAccount(Cn){','updateAccount(Cn,ei){'),remove:between('removeAccount(Cn,ei=','resolveAnalyticsId(Cn){'),artifacts:between('async function removeAccountLocalArtifacts','function supportsInstallationBackedLocalKeys')};
const context=vm.createContext({structuredClone,localAccount});
vm.runInContext(`
let sequence=0;
const randomUUID=()=> 'synthetic-incarnation-'+(++sequence), Date={now:()=>1234};
const normalizeAccountRegistryState=structuredClone,clone$1=structuredClone,accountRegistrySchema={parse:x=>x};
const assertUniqueAccountUserId=()=>{},revokeExternalOwner=()=>{},notifyAccountAuthChange=()=>{};
const backupAccountRegistryBeforeCriticalMutation=()=>{throw Error('No session backup permitted in fixture')};
const createDefaultAccountRegistry=()=>({accounts:[{id:0,createdAt:1234,incarnationId:randomUUID()}]});
const registry={data:{accounts:[{id:0,createdAt:1234,incarnationId:'synthetic-base'},{id:1,createdAt:1234,incarnationId:'synthetic-original'}],currentAccountId:1,sessions:{},localBootstraps:{},profileBindings:{},profileAccountBindings:{}},${pieces.add},${pieces.remove}};
registry.storage={withLock:fn=>{const result=fn(registry.data);if(result.next)registry.data=result.next;return result.result;}};
const original=registry.data.accounts[1],sidecar=new Map([[localAccount(original.id),{access:'synthetic-token-only'}]]);
registry.removeAccount(1);const replacement=registry.addAccount({name:'Synthetic replacement',mode:'local',provider:'anonymous'});
globalThis.result={oldId:original.id,newId:replacement.id,oldIncarnation:original.incarnationId,newIncarnation:replacement.incarnationId,oldKey:localAccount(original.id),newKey:localAccount(replacement.id),inherited:sidecar.get(localAccount(replacement.id))?.access==='synthetic-token-only'};
`,context);
const result=structuredClone(context.result);
assert.equal(result.oldId,result.newId);assert.notEqual(result.oldIncarnation,result.newIncarnation);assert.equal(result.oldKey,result.newKey);assert.equal(result.inherited,true);
assert.equal(pieces.remove.includes('auxChatGPT'),false);assert.equal(pieces.artifacts.includes('auxChatGPT'),false);
assert.equal(pieces.artifacts.includes('getAccountRoot(ti)'),true);assert.equal(pieces.artifacts.includes('getAccountTaskRoot(ti)'),true);
const record={format:'aux.chatgpt.account-isolation.audit.v1',source:{path:sourcePath,sha256:sha(source)},pieces:Object.fromEntries(Object.entries(pieces).map(([key,value])=>[key,{sha256:sha(value),bytes:Buffer.byteLength(value)}])),result,actualDaemonEvaluated:false,realCredentialsRead:false,providerRequests:0,implementedFix:false};
writeFileSync(new URL('./source-check.json',import.meta.url),JSON.stringify(record,null,2)+'\n');console.log(JSON.stringify(record));
