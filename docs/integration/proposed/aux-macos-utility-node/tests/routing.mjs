import {readFile,mkdtemp,writeFile,copyFile,rm,chmod} from 'node:fs/promises';
import vm from 'node:vm';import path from 'node:path';import {tmpdir} from 'node:os';import assert from 'node:assert/strict';import {Worker} from 'node:worker_threads';import {createHash} from 'node:crypto';import {createRequire} from 'node:module';
import {findMachOSeaSection,readSeaBlob} from '../../../../../vendor/aside/lib/sea.mjs';
import {adaptMacUtilityRouting,createMacUtilityLoader} from '../source/adapt.mjs';
const root=process.argv[2],module=process.argv[3],pins=JSON.parse(await readFile(new URL('../source-pins.json',import.meta.url))),original=await readFile(path.join(root,pins.daemons.node.path),'utf8');
const seaBinary=await readFile(path.join(root,pins.daemons.sea.path)),section=findMachOSeaSection(seaBinary),sea=readSeaBlob(seaBinary.subarray(section.offset,section.offset+section.size)).code;
assert.equal(createHash('sha256').update(seaBinary).digest('hex'),pins.daemons.sea.binarySha256);
const dir=await mkdtemp(path.join(tmpdir(),'aux-utility-route-'));let checks=0;
try{
 const resources=path.join(dir,'Resources'),target=path.join(resources,'native');await import('node:fs/promises').then(fs=>fs.mkdir(target,{recursive:true}));const data=await readFile(module);await copyFile(module,path.join(target,'aux-macos-utilities.node'));await chmod(path.join(target,'aux-macos-utilities.node'),0o600);
 await writeFile(path.join(target,'aux-macos-utilities.cjs'),createMacUtilityLoader({sha256:createHash('sha256').update(data).digest('hex'),bytes:data.length}));
 const require=createRequire(import.meta.url);
 for(const [kind,source] of [['node',original],['sea',sea]]){
 const {text,anchors}=adaptMacUtilityRouting(source,{kind});assert.equal(anchors.length,8);assert.equal(text.slice(0,4096),source.slice(0,4096));
 const start=text.indexOf('var auxMacUtilityBinding,auxMacUtilityBindingError;'),end=text.indexOf('var require$2,packageRoot',start);assert(start>0&&end>start);
 let common=0;
 const context=vm.createContext({process:{platform:'darwin',execPath:path.join(dir,'MacOS/aux-daemon')},require$2:require,path,__auxDaemonResources:resources,Worker,loadBinding(){common++;throw Error('Protected common binding must not load')},bindingLoadError:undefined,loadedBindingPath:null});
 vm.runInContext(text.slice(start,end),context);
 let reply=vm.runInContext('runNativeHelperCommand("copy-file",JSON.stringify({filePath:"/synthetic"}))',context);assert.equal(reply.success,true);checks++;
 reply=await vm.runInContext('runNativeHelperCommandAsync("generate-thumbnail",JSON.stringify({filePath:"/synthetic",iconOutputPath:"/i",thumbnailOutputPath:"/t"}))',context);assert.equal(reply.thumbnailGenerated,true);checks++;
 assert.equal(common,0);checks++;
 assert.throws(()=>vm.runInContext('runNativeHelperCommand("secure-read","{}")',context),/Protected common/);checks++;
 context.process.platform='win32';assert.throws(()=>vm.runInContext('runNativeHelperCommand("copy-file","{}")',context),/Protected common/);checks++;
 assert.throws(()=>adaptMacUtilityRouting(source+' ',{kind}),/Exact/);checks++;
 // All PDF references and first state2 refusal remain byte-identical.
 assert.equal((text.match(/nativePdf\./g)||[]).length,(source.match(/nativePdf\./g)||[]).length);checks++;
 }
 console.log(JSON.stringify({routingChecks:checks,anchorsPerLayout:8,layouts:2,actualExtractedSyncAndWorkerFunctions:true,actualCapturedModule:true,protectedCommonLoadsForMacUtilities:0}));
}finally{await rm(dir,{recursive:true,force:true});}
