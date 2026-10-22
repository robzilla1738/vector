// Executes only extracted PDF loader functions, never either daemon entrypoint.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createReadStream,constants,readFileSync,realpathSync} from 'node:fs';
import {lstat,open,readdir,readFile,writeFile,mkdtemp,rm} from 'node:fs/promises';
import {createRequire} from 'node:module';
import path from 'node:path';
import {tmpdir} from 'node:os';
import vm from 'node:vm';
import {findMachOSeaSection,readSeaBlob} from '../../../../vendor/aside/lib/sea.mjs';

const [appInput,previousUIInput,stageUIInput,uiReportInput]=process.argv.slice(2);
assert(appInput&&previousUIInput&&stageUIInput&&uiReportInput,'Supply exact app, previous Agent, staged Agent and existing UI report paths');
const app=path.resolve(appInput), previousUI=path.resolve(previousUIInput), stageUI=path.resolve(stageUIInput);
const aux=path.join(app,'Contents/Resources/aux');
const daemon=path.join(aux,'apps/daemon/Aux Daemon.app/Contents');
const seaFile=path.join(daemon,'MacOS/aux-daemon');
const devFile=path.join(daemon,'Resources/node-development/index.mjs');
const resources=path.join(daemon,'Resources'),native=path.join(resources,'native');
const loader=path.join(native,'aux-pdf.cjs'),pinFile=path.join(native,'aux-pdf-pins.cjs'),moduleFile=path.join(native,'aux-pdf.node');
const expected=JSON.parse(readFileSync(new URL('./reviewed-pins.json',import.meta.url),'utf8'));
assert.match(expected.framework??'',/^[a-f0-9]{64}$/,'Native build pins must be finalized before execution');
assert.match(expected.nativeBuildReceiptSha256??'',/^[a-f0-9]{64}$/,'Native receipt must be finalized');
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
async function hashFile(file){const h=createHash('sha256');for await(const bytes of createReadStream(file))h.update(bytes);return h.digest('hex');}
async function regular(file){const s=await lstat(file);assert(s.isFile()&&!s.isSymbolicLink(),`Nonregular static input: ${file}`);return s;}
async function seaCode(file){
 const stat=await regular(file),fd=await open(file,constants.O_RDONLY|constants.O_NOFOLLOW);
 try{
  const header=Buffer.alloc(32);assert.equal((await fd.read(header,0,32,0)).bytesRead,32);
  const commandBytes=header.readUInt32LE(20);assert(commandBytes>0&&commandBytes<16*1024*1024);
  const commands=Buffer.alloc(32+commandBytes);assert.equal((await fd.read(commands,0,commands.length,0)).bytesRead,commands.length);
  const section=findMachOSeaSection(commands);assert(section.offset>=commands.length&&section.size>0&&section.size<256*1024*1024&&section.offset+section.size<=stat.size);
  const blob=Buffer.alloc(section.size);assert.equal((await fd.read(blob,0,blob.length,section.offset)).bytesRead,blob.length);
  return {code:readSeaBlob(blob).code,section};
 }finally{await fd.close();}
}
function pdfRoute(code,label){
 const found=code.match(/function loadPdfBinding\(\)\{[^}]+\}/g);assert.equal(found?.length,1,`${label}: expected one PDF loader`);
 assert(!found[0].includes('loadBinding(')&&found[0].includes('native/aux-pdf.cjs'),`${label}: credential binding route forbidden`);
 return found[0];
}
async function tree(root,relative=''){
 const result=[];for(const entry of(await readdir(path.join(root,relative),{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name,'en'))){
  const name=path.posix.join(relative,entry.name);assert(!entry.isSymbolicLink(),`Symlink in static Agent: ${name}`);
  if(entry.isDirectory())result.push(...await tree(root,name));else{assert(entry.isFile());const file=path.join(root,name);result.push({path:name,bytes:(await lstat(file)).size,sha256:await hashFile(file)});}
 }return result;
}
function encodePDF(objects){let body='%PDF-1.7\n',offsets=[0];for(let i=0;i<objects.length;i++){offsets.push(Buffer.byteLength(body));body+=`${i+1} 0 obj\n${objects[i]}\nendobj\n`;}const xref=Buffer.byteLength(body);return body+`xref\n0 ${objects.length+1}\n0000000000 65535 f \n`+offsets.slice(1).map(n=>`${String(n).padStart(10,'0')} 00000 n \n`).join('')+`trailer\n<< /Size ${objects.length+1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;}

const receiptPath=path.resolve(path.dirname(uiReportInput),'aux-carrier-native-build.json');
const nativeReceiptBytes=await readFile(receiptPath),nativeReceipt=JSON.parse(nativeReceiptBytes);
assert.equal(sha(nativeReceiptBytes),expected.nativeBuildReceiptSha256);
assert.equal(nativeReceipt.buildExitCode,0);assert.equal(nativeReceipt.compositionSha256,expected.compositionSha256);
const builtFramework=nativeReceipt.files.find(item=>item.path==='Aux.app/Contents/Frameworks/Aux Framework.framework/Versions/155.0.8059.85/Aux Framework');
assert.equal(builtFramework?.sha256,expected.framework);
const packageReceipt=JSON.parse(await readFile(path.join(path.dirname(app),'package.json'),'utf8'));
assert.equal(packageReceipt.signed,false);assert.equal(packageReceipt.productionReady,false);assert.equal(packageReceipt.stateIdentityVersion,2);
assert.equal(await hashFile(process.execPath),expected.node,'Use actual pinned packaged Node');
for(const [file,digest]of[[loader,expected.loader],[pinFile,expected.pins],[moduleFile,expected.module]]){await regular(file);assert.equal(await hashFile(file),digest);}
assert.equal((await lstat(moduleFile)).size,expected.moduleBytes);
const framework=path.join(app,'Contents/Frameworks/Aux Framework.framework/Versions/155.0.8059.85/Aux Framework');
assert.equal(await hashFile(framework),expected.framework);
const sea=await seaCode(seaFile),development=await readFile(devFile,'utf8');
for(const [label,code]of[['sea',sea.code],['node-development',development]]){
 assert(code.startsWith('/* aux-cold-entry-admission-v1 */\nthrow Object.assign(new Error("Aux state identity generation 2 is quarantined; migration admission is not implemented.")'),`${label}: missing first quarantine refusal`);
}
const seaRoute=pdfRoute(sea.code,'sea'),devRoute=pdfRoute(development,'node-development');
assert.equal(seaRoute,'function loadPdfBinding(){return require$2(path.resolve(path.dirname(process.execPath),`../Resources/native/aux-pdf.cjs`))}');
assert.equal(devRoute,'function loadPdfBinding(){return require$2(path.join(__auxDaemonResources,`native/aux-pdf.cjs`))}');
const previousFiles=await tree(previousUI),stagedFiles=await tree(stageUI),packagedFiles=await tree(path.join(aux,'apps/extension/dist'));
assert.equal(previousFiles.length,1215);assert.deepEqual(stagedFiles,previousFiles);assert.deepEqual(packagedFiles,previousFiles);
assert.equal(packagedFiles.filter(file=>file.path.endsWith('.css')).length,5);
const existingUI=JSON.parse(await readFile(uiReportInput,'utf8'));
assert.equal(existingUI.comparedFiles,1215);assert.equal(existingUI.allBytesEqual,true);assert.equal(existingUI.stylesheets,5);

const require=createRequire(import.meta.url),loadedNative=[];
const originalDlopen=process.dlopen;
process.dlopen=function(module,file,...args){assert.equal(realpathSync(file),realpathSync(moduleFile),'Only packaged Aux PDF native code may load');loadedNative.push(path.relative(app,file));return originalDlopen.call(this,module,file,...args);};
const onlyPDF=file=>{assert.equal(path.resolve(file),loader);return require(file);};
const context={path,require$2:onlyPDF,__auxDaemonResources:resources,process:{execPath:seaFile},loadBinding(){throw Error('Original/credential binding forbidden');}};
const disposable=await mkdtemp(path.join(tmpdir(),'aux-packaged-pdf-document-'));
let extracted;
try{
 const fromSea=vm.runInNewContext(seaRoute+';loadPdfBinding()',context,{timeout:10000});
 const fromDevelopment=vm.runInNewContext(devRoute+';loadPdfBinding()',context,{timeout:10000});
 assert.equal(fromSea,fromDevelopment);
 assert.deepEqual(Object.keys(fromSea).sort(),['extractText','fillFormFields','getFormFields','merge','renderPages','rotate','split'].sort());
 const stream='BT /F1 12 Tf 20 250 Td (Aux Packaged PDF) Tj ET\n';
 const bytes=encodePDF(['<< /Type /Catalog /Pages 2 0 R >>','<< /Type /Pages /Kids [3 0 R] /Count 1 >>','<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 300] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',`<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}endstream`,'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>']);
 const document=path.join(disposable,'synthetic.pdf');await writeFile(document,bytes,{mode:0o600});
 extracted=fromSea.extractText({filePath:document});assert.equal(extracted.then,undefined);assert.equal(extracted.pageCount,1);assert.equal(extracted.pages.length,1);assert.match(extracted.pages[0].text,/Aux Packaged PDF/);
 assert.equal(loadedNative.length,1);
 assert(!Object.keys(require.cache).some(file=>/\/(?:provided-native|aux-native-guard)\.node$|\/aux-native\.cjs$/.test(file)));
}finally{process.dlopen=originalDlopen;await rm(disposable,{recursive:true,force:true});}
assert((await regular(path.join(native,'provided-native.node'))).size>0,'Common run addon presence is an explicit remaining gap');
const evidence={version:1,app,scope:'isolated actual packaged PDF loader functions, not full daemon/app startup',package:{signed:false,productionReady:false,stateIdentityVersion:2,firstColdRefusalVerified:true,appLaunched:false},inputs:{nativeBuildReceipt:{sha256:sha(nativeReceiptBytes),compositionSha256:expected.compositionSha256},framework:{sha256:expected.framework,bytes:(await lstat(framework)).size},packagedNode:{sha256:expected.node},loader:{sha256:expected.loader},pins:{sha256:expected.pins},module:{sha256:expected.module,bytes:expected.moduleBytes},sea:{binarySHA256:await hashFile(seaFile),codeSHA256:sha(sea.code),section:sea.section,route:seaRoute},nodeDevelopment:{sha256:sha(development),route:devRoute},uiReport:{sha256:sha(await readFile(uiReportInput))}},ui:{baseline:previousUI,stage:stageUI,packaged:path.join(aux,'apps/extension/dist'),comparedFiles:1215,stylesheets:5,allBytesEqual:true,inventorySHA256:sha(JSON.stringify(packagedFiles))},runtime:{actualPackagedNode:true,actualPackagedLoader:true,actualOwnModuleLoaded:true,nativeModulesLoaded:loadedNative,loaderRoutesReturnSameObject:true,syntheticTextExtracted:'Aux Packaged PDF',originalOrCredentialBindingLoaded:false,ownerDocumentsAccessed:false,OSOrCloudOrSigningOperations:false},remaining:{unsigned:true,unlaunched:true,state2StartupRefused:true,originalCommonRunAddonRetired:false,wholeAppIntegrationAccepted:false}};
console.log(JSON.stringify(evidence,null,2));
