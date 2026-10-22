// Exact current-stage integration proposal. No source evaluation or state access.
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
const pins=JSON.parse(readFileSync(new URL('../source-pins.json',import.meta.url),'utf8'));
const routing=String.raw`var auxMacUtilityBinding,auxMacUtilityBindingError;
function loadAuxMacUtilityBinding(){if(auxMacUtilityBinding!==void 0)return auxMacUtilityBinding;try{return auxMacUtilityBinding=require$2(path.join(__auxDaemonResources,'native/aux-macos-utilities.cjs'))}catch(error){auxMacUtilityBindingError=error instanceof Error?error.message:String(error);return auxMacUtilityBinding=null}}
function isAuxMacUtilityBindingAvailable(){return process.platform==='darwin'&&loadAuxMacUtilityBinding()!=null}
function auxNativeCommandRoute(command){if(process.platform==='darwin'&&['generate-thumbnail','list-open-apps','app-icons','copy-file','open-with'].includes(command))return{binding:loadAuxMacUtilityBinding(),bindingPath:path.join(__auxDaemonResources,'native/aux-macos-utilities.cjs'),error:auxMacUtilityBindingError};return{binding:loadBinding(),bindingPath:loadedBindingPath,error:bindingLoadError}}
`;
export function adaptMacUtilityRouting(text,{kind='node'}={}){
 if(!['node','sea'].includes(kind)||typeof text!=='string'||createHash('sha256').update(text).digest('hex')!==pins.daemons[kind].sha256)throw Error('Exact reviewed staged daemon required');
 if(text.includes('auxNativeCommandRoute('))throw Error('Repeated utility routing');
 const changes=[
  ['function isNativeHelperBindingAvailable(){',(kind==='node'?routing:routing.replaceAll('__auxDaemonResources',"path.resolve(path.dirname(process.execPath),'../Resources')"))+'function isNativeHelperBindingAvailable(){'],
  ['function runNativeHelperCommand(Cn,ei=``){let ti=loadBinding();if(!ti)return{error:bindingLoadError??`Native helper binding is not available`};','function runNativeHelperCommand(Cn,ei=``){let {binding:ti,error:auxRouteError}=auxNativeCommandRoute(Cn);if(!ti)return{error:auxRouteError??`Native helper binding is not available`};'],
  ['function runNativeHelperCommandAsync(Cn,ei=``){return!loadBinding()||!loadedBindingPath?Promise.resolve({error:bindingLoadError??`Native helper binding is not available`}):new Promise(ti=>{','function runNativeHelperCommandAsync(Cn,ei=``){let {binding:auxRouteBinding,bindingPath:auxRoutePath,error:auxRouteError}=auxNativeCommandRoute(Cn);return!auxRouteBinding||!auxRoutePath?Promise.resolve({error:auxRouteError??`Native helper binding is not available`}):new Promise(ti=>{'],
  ['workerData:{bindingPath:loadedBindingPath,command:Cn,input:ei}','workerData:{bindingPath:auxRoutePath,command:Cn,input:ei}'],
  ['if(ni.length>0&&process.platform===`darwin`&&isNativeHelperBindingAvailable())','if(ni.length>0&&process.platform===`darwin`&&isAuxMacUtilityBindingAvailable())'],
  ['function listOpenApps(Cn){if(process.platform!==`darwin`||!isNativeHelperBindingAvailable())','function listOpenApps(Cn){if(process.platform!==`darwin`||!isAuxMacUtilityBindingAvailable())'],
  ['function copyFileToClipboard(Cn){if(process.platform!==`darwin`||!isNativeHelperBindingAvailable())','function copyFileToClipboard(Cn){if(process.platform!==`darwin`||!isAuxMacUtilityBindingAvailable())'],
  ['function openFileWithApp(Cn,ei){if(process.platform!==`darwin`||!isNativeHelperBindingAvailable())','function openFileWithApp(Cn,ei){if(process.platform!==`darwin`||!isAuxMacUtilityBindingAvailable())'],
 ];
 const anchors=[];
 for(const [find,replace] of changes){if(text.split(find).length-1!==1)throw Error('Utility routing anchor drift');text=text.replace(find,replace);anchors.push({find,replace,count:1});}
 return{text,anchors};
}
export function createMacUtilityLoader({sha256,bytes}){
 if(!/^[0-9a-f]{64}$/.test(sha256)||!Number.isSafeInteger(bytes)||bytes<1||bytes>4*1024*1024)throw Error('Reviewed utility image pin required');
 return `'use strict';\nconst fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');\nconst file=path.join(__dirname,'aux-macos-utilities.node');\nconst before=fs.lstatSync(file);\nif(!before.isFile()||before.isSymbolicLink()||(before.mode&0o022)||before.nlink!==1||before.size!==${bytes})throw Error('Unsafe Aux utility module');\nconst data=fs.readFileSync(file),after=fs.lstatSync(file);\nif(before.dev!==after.dev||before.ino!==after.ino||before.size!==after.size||before.mtimeMs!==after.mtimeMs||before.ctimeMs!==after.ctimeMs||crypto.createHash('sha256').update(data).digest('hex')!=='${sha256}')throw Error('Aux utility module differs');\nmodule.exports=require(file);\n`;
}
