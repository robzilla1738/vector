import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve,join,basename} from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
const sha=text=>createHash('sha256').update(text).digest('hex');
const home=fileURLToPath(new URL('.',import.meta.url));
export async function transformAuxSelectedBrowserResources({path,text,source,root=resolve(home,'../../../../../..')}) {
 const pins=JSON.parse(await readFile(join(home,'composition-inputs.json'),'utf8'));
 const name=basename(path),expected=name==='index.mjs'?pins.indexSha256:name==='aux-native-entry.mjs'?pins.entrySha256:name==='background.js'?pins.backgroundSha256:undefined;
 if(!expected||typeof text!=='string'||typeof source!=='string'||sha(source)!==expected)throw Error('Pinned original paired daemon/Agent source is required separately from accumulated text');
 const prefix='docs/integration/proposed/completion-20261026/',stages=[],anchors=[];
 const read=async relative=>{const value=await readFile(join(root,relative),'utf8');if(sha(value)!==pins.inputs[relative])throw Error(`Resource generator changed: ${relative}`);return value};
 function apply(kind,plan){const before=sha(text);for(let anchor of plan.anchors){
  if(name==='index.mjs'&&anchor.before==="/* aux-owned-native-entry-v1 */\nprocess._linkedBinding('aux_owned_native');"){
   const marker='// The immutable native observation cannot grant task execution from JS.';
   anchor={before:marker,after:anchor.after.slice(anchor.before.length)+'\n'+marker,count:1};
  }
  if(text.split(anchor.before).length-1!==anchor.count)throw Error(`${name} ${kind} anchor drift: ${anchor.before.slice(0,100)}`);
  text=text.replace(anchor.before,()=>anchor.after);anchors.push({...anchor,scope:kind});
 }stages.push({kind,inputSha256:before,outputSha256:sha(text),anchors:plan.anchors.length})}
 const originalInputSha256=sha(text);
 if(name==='background.js'){
  const automation=JSON.parse(await read(prefix+'desktop/browser-automation/resource-anchors.json'));
  apply('browser automation',automation.files.find(file=>file.name==='background'));
  const files=JSON.parse(await read(prefix+'desktop/browser-files/resource-anchors.json'));
  apply('browser files',files.files.find(file=>basename(file.inputPath)==='background.js'));
 }else{
  if(!text.includes("function loadPdfBinding(){return process._linkedBinding('aux_pdf_builtin')}"))throw Error('Existing root fixed builtin transform must precede selected browser resources');
  for(const relative of ['runtime/selected-builtin-owner/entry.anchors.json','runtime/selected-file-reader/entry.anchors.json'])apply(relative,JSON.parse(await read(prefix+relative)));
  await read('vendor/provided/aux-fixed-computer-use.mjs');await read(prefix+'integration/computer-use/source-pins.json');
  const {transformAuxFixedComputerUse}=await import(pathToFileURL(join(root,'vendor/provided/aux-fixed-computer-use.mjs')));
  const before=sha(text),cu=transformAuxFixedComputerUse({text,source});text=cu.text;anchors.push(...cu.anchors);
  stages.push({kind:'corrected Computer Use',inputSha256:before,outputSha256:sha(text),anchors:cu.anchors.length});
  const automation=JSON.parse(await read(prefix+'desktop/browser-automation/resource-anchors.json'));apply('browser automation',automation.files.find(file=>file.name==='entry'));
  const files=JSON.parse(await read(prefix+'desktop/browser-files/resource-anchors.json'));apply('browser files',files.files.find(file=>basename(file.inputPath)==='aux-native-entry.mjs'));
 }
 return {text,anchors,stages,inputSha256:originalInputSha256,outputSha256:sha(text),sourceSha256:sha(source)};
}
