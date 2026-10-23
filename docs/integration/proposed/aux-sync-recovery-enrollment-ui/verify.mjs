import {readFileSync} from 'node:fs';import {createHash} from 'node:crypto';import {SourceTextModule} from 'node:vm';
import {materializeSyncRecoveryDesktop}from'./source/materialize-desktop.mjs';
import {adaptAuxRecoveryEnrollmentUI,adaptAuxRecoveryEnrollmentDaemon,materializeAuxRecoveryEnrollmentUI}from'./source/adapt.mjs';
const hash=value=>createHash('sha256').update(value).digest('hex'),pin=JSON.parse(readFileSync(new URL('./source-pins.json',import.meta.url))),uiRoot=process.argv[2];
if(!uiRoot||!process.argv[3]||!process.argv[4]||!process.argv[5])throw Error('Provide accepted UI root, recovery-paired SEA/Node inputs and exact prebranding hook source');
for(const input of pin.acceptedUIInputs)if(hash(readFileSync(uiRoot+'/'+input.path))!==input.sha256)throw Error('Accepted visual dependency changed');
for(const input of pin.proposalInputs)if(hash(readFileSync(new URL(input.path,import.meta.url)))!==input.sha256)throw Error('Proposal dependency drift: '+input.path);
for(const input of pin.visualSourceInputs)if(hash(readFileSync('/Users/rcourson/Documents/Vibe/web/out/provided-source-snapshot-1.26.1016.1852/'+input.path))!==input.sha256)throw Error('Frozen component drift');
const account=readFileSync(uiRoot+'/'+pin.ui.path,'utf8'),result=adaptAuxRecoveryEnrollmentUI({component:'agent',path:pin.ui.path,text:account});new SourceTextModule(result.text);
const pre=adaptAuxRecoveryEnrollmentUI({component:'agent',path:pin.ui.path,text:readFileSync(process.argv[5],'utf8'),mode:'stage-prebranding'});if(pre.text.replaceAll('Aside','Aux')!==result.text)throw Error('Stage/prebranding result differs from accepted UI result');
for(const file of process.argv.slice(3,5)){const input=readFileSync(file,'utf8'),output=adaptAuxRecoveryEnrollmentDaemon(input,{expectedInputSha256:hash(input)});new SourceTextModule(output.code);}
const assets=materializeAuxRecoveryEnrollmentUI();for(const asset of assets.files){new SourceTextModule(asset.bytes.toString());if(asset.bytes.toString().toLowerCase().includes('aside'))throw Error('Original product token in new asset');}
// All new presentation class strings are copied from supplied recovery views.
const frozen='/Users/rcourson/Documents/Vibe/web/out/provided-source-snapshot-1.26.1016.1852/agent/assets/';const sources=['password-LjdLcSRV.js','password-import-menu-BuTmw0rs.js','components-BlZz2O2v.js'].map(name=>readFileSync(frozen+name,'utf8')).join('\n');
const component=assets.files.find(x=>x.path.endsWith('/aux-sync-recovery-enrollment.js')).bytes.toString(),classes=[...component.matchAll(/className:'([^']+)'/g)].map(x=>x[1]);for(const name of classes)if(!sources.includes('className:"'+name+'"'))throw Error('Unreused recovery presentation class: '+name);
if(component.includes('passwordManager.')||component.includes('password-LjdLcSRV')||component.includes('password-import-menu'))throw Error('Excluded product module reachable');
console.log(JSON.stringify({accountInputSha256:hash(account),accountOutputSha256:hash(result.text),uiEdits:pin.ui.edits.length,daemonEdits:pin.daemon.edits.length,reusedClassStrings:classes.length,newAssets:assets.files.map(({path,bytes})=>({path,bytes:bytes.length,sha256:hash(bytes)})),cssFilesChanged:0,entryOrUIEvaluated:false,activation:false}));

const runtime=await materializeSyncRecoveryDesktop();const parsed=new SourceTextModule(runtime.bytes.toString());if(parsed.dependencySpecifiers.some(x=>!x.startsWith('node:'))||runtime.bytes.toString().toLowerCase().includes('aside'))throw Error('Unreviewed runtime import/identity');console.log(JSON.stringify({runtimeSha256:runtime.sha256,runtimeBytes:runtime.bytes.length,inputCount:pin.bundle.dependencies.length,evaluated:false}));
