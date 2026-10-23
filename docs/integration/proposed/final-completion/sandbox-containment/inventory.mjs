import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const [input]=process.argv.slice(2);if(!input)throw Error('Provide static supplied daemon entry');
const source=readFileSync(input,'utf8');
const landmarks=[
 ['optional sandbox bypass','async function wrapSandboxCommand(Cn){'],
 ['shared non-PTY launch','async function spawnSandboxed(Cn){'],
 ['shared terminal PTY/non-PTY dispatch','async function spawnExecProcess(Cn,ei){'],
 ['PTY binding invocation','function spawnPtyProcess(Cn){'],
 ['runtime-use lease and permission envelope','async function prepareSessionSpawn(Cn,ei){'],
 ['runtime replacement/use counter','async function acquireAgentRuntimeUse(Cn,ei={}){'],
 ['MCP server constructor dispatch','async function createTransport$1(Cn,ei,ti){'],
 ['MCP SDK actual process start','StdioClientTransport=class{'],
 ['shell PATH discovery before MCP transport','async function resolveShellPath(){'],
 ['Claude CLI command and shell discovery','async function runClaudeCommand(Cn){'],
 ['other CLI command wrapper','async function runCommand(Cn){'],
 ['CLI installer external shell','Could not download Aux CLI installer.'],
 ['ripgrep wraps before execFile','let Cn=await wrapSandboxCommand({...ui,command:[`rg`,...ci]'],
 ['optional Seatbelt deniedPaths rules','function buildSeatbeltPolicy(Cn){'],
 ['fixed native shim loader','function loadBinding(){'],
 ['credential command interpolation shell','async function resolveConfigValue(Cn){'],
 ['QuickJS guest bridge','QuickJSBridge=class Cn{'],
 ['REPL rejects external modules','External modules are not available in the REPL.'],
];
const entries=landmarks.map(([name,anchor])=>{let positions=[],at=0;for(;;){let next=source.indexOf(anchor,at);if(next<0)break;positions.push(next);at=next+anchor.length;}return{name,anchor,count:positions.length,offsets:positions};});
const primitives=[['shared spawnCommand',/\bspawnCommand\(/g],['direct spawn',/\bspawn\(/g],['direct spawnSync',/\bspawnSync\(/g],['direct execFile',/\bexecFile\(/g],['direct execFileSync',/\bexecFileSync\(/g],['async execFile alias',/\bexecFileAsync\$1\(/g],['async shell exec aliases',/\bexecAsync(?:\$\d+)?\(/g],['node-pty actual spawn',/loadNodePty\(\)\.spawn\(/g],['MCP cross-spawn',/import_cross_spawn\.default\)\(/g]];
console.log(JSON.stringify({schema:'aux.supplied.exec-launch-inventory.v1',input,bytes:Buffer.byteLength(source),sha256:createHash('sha256').update(source).digest('hex'),landmarks:entries,primitiveOccurrences:primitives.map(([name,re])=>({name,count:[...source.matchAll(re)].length,offsets:[...source.matchAll(re)].map(m=>m.index)})),scope:'Static substring occurrence inventory; not AST/data-flow proof or a claim that every primitive occurrence is an active user-controlled route.',ownerStateRead:false,execution:false},null,2));
