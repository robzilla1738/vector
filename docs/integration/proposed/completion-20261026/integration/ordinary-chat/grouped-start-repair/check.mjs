import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync(process.argv[2],'utf8');
assert(!source.includes('auxSupervisedTasksAvailable'));
const take=(start,end)=>source.slice(source.indexOf(start),source.indexOf(end,source.indexOf(start)));
const declaration=source.slice(source.indexOf('createReadFileTool=({'),source.indexOf('}));function resolveWindowsPowerShell',source.indexOf('createReadFileTool=({')));
const context=vm.createContext({assert});
vm.runInContext(`
let binding={},held=0,closed=0,executions=0;function setMode(value,attributes={}){binding={};Object.defineProperty(binding,'supervisedTasksEnabled',{value,writable:false,configurable:false,...attributes})}
const process={_linkedBinding(){return binding}},READ_FILE_TOOL_DESCRIPTION='read',readFileToolParameters={},auxSelectedReadFileTools=new WeakSet;
const auxSelectedReadScopeContext={run(scope,operation){return operation()}};
function auxCaptureReadFileScope(){held++;return {scope:{awaited(operation){return operation()}},close:async()=>{closed++}}}
function resolveFileToolPath(){return 'synthetic'};async function auxSelectedReadFileStat(){executions++;return null}
`,context);
vm.runInContext(take('function auxUsesBoundBrowserActions','function auxStopOwnedBrowserRequests')+take('function auxRequireSupervisedTasks','let auxMemoryV2SeedPending')+take('function auxRegisterSelectedReadFileTool','function auxReadFilePdfBinding')+'let '+declaration+';',context);
await vm.runInContext(`(async()=>{
setMode(false);const fixed=createReadFileTool({context:{}});assert.equal(fixed.name,'read_file');assert.equal(held,0);await fixed.execute('tool',{path:'synthetic'});assert.equal(held,1);assert.equal(closed,1);assert.equal(executions,1);
setMode(true);const supervised=createReadFileTool({context:{}});await supervised.execute('tool',{path:'synthetic'});assert.equal(held,1);assert.equal(executions,2);
for(const bad of [undefined,'true',0]){setMode(bad);assert.throws(()=>createReadFileTool({context:{}}),/disabled/)}
setMode(true,{writable:true});assert.throws(()=>createReadFileTool({context:{}}),/disabled/);
binding={};Object.defineProperty(binding,'supervisedTasksEnabled',{get(){throw Error('getter invoked')}});assert.throws(()=>createReadFileTool({context:{}}),/disabled/);
assert.equal(executions,2);
})()`,context);
console.log('PASS: actual read-file construction and execution; fixed scope/closure, supervised routing, malformed/mutable/accessor native mode refused');
