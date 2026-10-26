import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve,join} from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {transformAuxSelectedBrowserResources} from './transform-resources.mjs';
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const args=process.argv.slice(2),arg=name=>{const i=args.indexOf(name);return i<0?undefined:args[i+1]};
const root=resolve(arg('--root')??'/Users/rcourson/Documents/Vibe/web'),out=arg('--out');if(!out)throw Error('Pass --out scratch directory');
const home=fileURLToPath(new URL('.',import.meta.url)),pins=JSON.parse(await readFile(join(home,'composition-inputs.json'),'utf8'));
for(const [path,expected]of Object.entries(pins.inputs))if(sha(await readFile(join(root,path)))!==expected)throw Error(`Composition input changed: ${path}`);
const load=async relative=>import(pathToFileURL(join(root,relative)));
const {upgradeCloudTransfers}=await load('docs/integration/proposed/completion-20261026/integration/transform.mjs');
const {transformAuxFinalRuntimeIdentity}=await load('vendor/provided/aux-final-runtime-identity.mjs');
const {transformAuxExperimentalSettings}=await load('vendor/provided/aux-experimental-settings-v2.mjs');
const {transformAuxEventPolling}=await load('vendor/provided/aux-event-poll-integration.mjs');
const {transformAuxOrdinaryChatStartup}=await load('vendor/provided/aux-ordinary-chat-startup.mjs');
const {transformAuxBashCloseLifetime}=await load('vendor/provided/aux-bash-close-lifetime.mjs');
const {transformAuxFixedBuiltinRouting}=await load('vendor/provided/aux-fixed-builtin-routing.mjs');
const {transformAuxPreferenceIdentity}=await load('vendor/provided/aux-password-preference-markers.mjs');
const {transformAuxEphemeralProtocolIdentity,transformAuxTagIconIdentity}=await load('vendor/provided/aux-ephemeral-protocol-identity.mjs');
const base=join(root,'out/provided-candidate-local-completion-20261025-a38/Aux.app/Contents/Resources/aux/apps'),files=[];
await mkdir(out,{recursive:true});
for(const name of ['index.mjs','aux-native-entry.mjs','background.js']){
 const input=name==='background.js'?join(base,'extension/dist/background.js'):join(base,'daemon/Aux Daemon.app/Contents/Resources/node-development',name);
 const source=await readFile(input,'utf8');let text=source;const stages=[];
 const stage=(kind,result)=>{stages.push({kind,inputSha256:sha(text),outputSha256:sha(result.text),anchors:result.anchors?.length??result.changes?.length});text=result.text;return result};
 if(name!=='background.js'){
  stage('account-bound cloud transfers',upgradeCloudTransfers(text));
  const identity=stage('Aux runtime identity',transformAuxFinalRuntimeIdentity({component:'daemon',path:name,text}));
  stage('experimental settings v2',transformAuxExperimentalSettings({component:'daemon',path:name,text}));
  stage('authenticated cloud invalidation and reconciliation',transformAuxEventPolling({text,source:identity.text}));
  stage('ordinary chat startup',transformAuxOrdinaryChatStartup({text,source:identity.text}));
  stage('background Bash physical close',transformAuxBashCloseLifetime({text,source:identity.text}));
  stage('fixed builtin routing',transformAuxFixedBuiltinRouting({path:name,text,source}));
  stage('Aux transient protocol generation 2',transformAuxEphemeralProtocolIdentity({text,source}));
  stage('Aux tag icon schema',transformAuxTagIconIdentity({text,source}));
  stage('Aux password manager preference markers',transformAuxPreferenceIdentity({text,source}));
 }
 const result=await transformAuxSelectedBrowserResources({path:name,text,source,root});text=result.text;stages.push(...result.stages);
 const target=resolve(out,name);await writeFile(target,text,{mode:0o600});const check=spawnSync(process.execPath,['--check',target],{encoding:'utf8'});if(check.status!==0)throw Error(`${name} syntax: ${check.stderr}`);
 files.push({name,input,inputSha256:sha(source),outputPath:target,outputSha256:sha(text),stages});
}
const receipt={format:'aux.final-composed-resources.v2',root,out:resolve(out),files,inputs:pins.inputs,nativeProjected:false,appExecuted:false};
await writeFile(resolve(out,'composition.json'),JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify(receipt,null,2));
