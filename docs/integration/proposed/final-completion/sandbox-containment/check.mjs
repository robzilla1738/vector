import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdtempSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {runInNewContext} from 'node:vm';
import {execFileSync} from 'node:child_process';
import {proposeDaemonPrivateParentBoundary} from './source/propose-daemon-boundary.mjs';
const require=createRequire(import.meta.url);
const [entryPath]=process.argv.slice(2);if(!entryPath)throw Error('Provide a statically generated supplied Aux daemon entry');
const input=readFileSync(entryPath,'utf8'),proposal=proposeDaemonPrivateParentBoundary(input);
const temp=mkdtempSync(join(tmpdir(),'aux-contained-source-'));
try {
  // Syntax only, no daemon, native binding, command, helper or sandbox execution.
  const target=join(temp,'entry.mjs');writeFileSync(target,proposal.prelude+proposal.source);execFileSync(process.execPath,['--check',target],{stdio:'pipe'});
  const moduleSource=readFileSync(new URL('./source/mandatory-private-parent.cjs',import.meta.url),'utf8');
  function load({binding,platform='darwin',resolveCwd=path=>path,childProcess=require('node:child_process')}={}) {
    const module={exports:{}};let captures=0;
    const process={platform,cwd:()=>'/fixture/workspace',env:{PATH:'/usr/bin:/bin'},_linkedBinding(name){assert.equal(name,'aux_owned_native');captures++;return binding;}};
    runInNewContext(moduleSource,{module,Buffer,process,require:name=>name==='node:fs'?{realpathSync:resolveCwd}:name==='node:child_process'?childProcess:require(name)});
    return {api:module.exports,captures:()=>captures};
  }
  const binding={};let args;
  Object.defineProperty(binding,'captureExecPrivateParent',{value:function(...a){args=a;return{format:'aux.native.exec-private-parent.v1',privateParent:'/fixture/private-state'};},writable:false,configurable:false});
  const fixture=load({binding}),envelope={command:['/bin/echo','fixture'],cwd:'/fixture/workspace',env:{PATH:'/usr/bin:/bin'},sandboxed:false,privateParent:'/caller/override'};
  const bounded=fixture.api.wrap(envelope);
  assert.equal(args.length,0);assert.equal(fixture.captures(),1);assert.equal(bounded.command[0],'/usr/bin/sandbox-exec');assert.equal(bounded.command.includes('-DAUX_NATIVE_PRIVATE_PARENT=/fixture/private-state'),true);
  assert.equal(bounded.command.includes('-DAUX_NATIVE_PRIVATE_PARENT=/caller/override'),false);assert.equal(bounded.command.at(-1),'fixture');assert.equal(bounded.sandboxed,false);assert.equal(bounded.auxPrivateParentDenied,true);assert.equal(envelope.command[0],'/bin/echo');
  assert.throws(()=>load({binding:{}}).api.wrap(envelope),/producer is unavailable/);
  assert.throws(()=>load({platform:'linux',binding}).api.wrap(envelope),/unavailable/);
  assert.throws(()=>load({binding:{captureExecPrivateParent(){return{};}}}).api.wrap(envelope),/producer is unavailable/);
  assert.throws(()=>fixture.api.wrap({...envelope,cwd:'/fixture/private-state/session'}),/inside private state/);
  assert.throws(()=>load({binding,resolveCwd:()=>'/fixture/private-state/hidden'}).api.wrap(envelope),/inside private state/);
  const methodStart=proposal.source.indexOf('async start(){if(this._process)throw Error(`StdioClientTransport already started!');
  const methodEnd=proposal.source.indexOf('get stderr(){',methodStart);assert.ok(methodStart>=0&&methodEnd>methodStart);
  let spawnArgs,refused=false;
  const events={on(){return this;}};const child={...events,stdin:events,stdout:events};
  const transport=runInNewContext(`({${proposal.source.slice(methodStart,methodEnd)}})`,{auxMandatoryPrivateParentDenial:()=>({wrap:options=>{if(refused)throw Error('native boundary unavailable');return{...options,command:['/usr/bin/sandbox-exec','fixture-policy','--',...options.command]};}}),getDefaultEnvironment:()=>({}),import_cross_spawn:{default:(...args)=>{spawnArgs=args;return child;}},process$1:{platform:'darwin'},process:{cwd:()=>'/fixture/workspace'}});
  transport._serverParams={command:'fixture-mcp',args:['one'],stderr:'pipe'};
  const starting=transport.start();assert.equal(spawnArgs[0],'/usr/bin/sandbox-exec');assert.deepEqual(Array.from(spawnArgs[2].stdio),['pipe','pipe','pipe']);void starting;
  transport._process=undefined;spawnArgs=undefined;transport._serverParams.stderr='inherit';await assert.rejects(transport.start(),/piped MCP stderr/);assert.equal(spawnArgs,undefined);transport._serverParams.stderr='pipe';refused=true;await assert.rejects(transport.start(),/unavailable/);assert.equal(spawnArgs,undefined);
  // Actual route bodies use synthetic factories only: no OS process starts.
  let routeSpawn, routeExec;
  const routeBoundary=load({binding,childProcess:{
    spawn:(...args)=>{routeSpawn=args;return {stdout:'synthetic stdout',stderr:'synthetic stderr'};},
    execFile:(...args)=>{routeExec=args;args.at(-1)(null,' fixture-secret-value \n','');},
  }}).api;
  routeBoundary.spawn(['/fixture/tool','argument'],{stdio:['ignore','pipe','pipe']});
  assert.equal(routeSpawn[0],'/usr/bin/sandbox-exec');assert.equal(routeSpawn[1].at(-1),'argument');
  assert.equal(routeSpawn[2].shell,false);assert.deepEqual(Array.from(routeSpawn[2].stdio),['ignore','pipe','pipe']);
  assert.throws(()=>routeBoundary.spawn(['/fixture/tool'],{stdio:['ignore',4,'pipe']}),/fresh pipe/);
  assert.throws(()=>routeBoundary.spawn(['/fixture/tool'],{stdio:['ignore','pipe','pipe'],shell:true}),/shell override/);
  await routeBoundary.execShell('fixture-command',{timeout:321});
  assert.equal(routeExec[0],'/usr/bin/sandbox-exec');assert.deepEqual(Array.from(routeExec[1]).slice(-3),['/bin/sh','-c','fixture-command']);
  assert.equal(routeExec[2].timeout,321);assert.equal(routeExec[2].shell,false);assert.equal(routeExec[2].stdio,undefined);
  let routeRefused=false, streamOutput='';
  const refusal=Object.assign(Error('native boundary unavailable'),{code:'AUX_EXEC_CONTAINMENT_UNAVAILABLE'});
  const routes={Error,auxMandatoryPrivateParentDenial:()=>routeRefused?{spawn(){throw refusal;},execShell(){throw refusal;}}:routeBoundary,
    process:{env:{SHELL:'/bin/zsh'}},AbortController,AbortSignal,setTimeout,clearTimeout,
    CONFIG_VALUE_COMMAND_TIMEOUT_MS:100,PATH_LOOKUP_TIMEOUT_MS:100,COMMAND_TIMEOUT_MS:100,STATUS_COMMAND_TIMEOUT_MS:100,AUX_CLI_VERSION_TIMEOUT_MS:100,
    PATH_START:'__AUX_MCP_PATH_START__',PATH_END:'__AUX_MCP_PATH_END__',
    resolveEnvironmentValue:value=>`environment:${value}`,getRedactedCommandError:()=>'<redacted>',console:{warn(){}},
    waitForExitCode:async()=>0,readProcessStream:async()=>streamOutput,getClaudeCommandPath:async()=>'/fixture/claude',
  };
  function body(begin,end){const start=proposal.source.indexOf(begin);assert.ok(start>=0);const finish=proposal.source.indexOf(end,start+begin.length);assert.ok(finish>start);return proposal.source.slice(start,finish);}
  const configured=runInNewContext(`(()=>{${body('async function resolveConfigValue(Cn){','function resolveEnvironmentValue(Cn){')}return resolveConfigValue})()`,routes);
  assert.equal(await configured('! fixture-command'),'fixture-secret-value');
  assert.equal(await configured('KEY'),'environment:KEY');
  routeRefused=true;await assert.rejects(configured('! fixture-command'),error=>error.code==='AUX_EXEC_CONTAINMENT_UNAVAILABLE');routeRefused=false;
  const lookup=runInNewContext(`(()=>{${body('async function resolveShellPath(){','var PATH_START,')}return resolveShellPath})()`,routes);
  // No offset-correction dependency: missing output legitimately returns undefined.
  streamOutput='missing marker';assert.equal(await lookup(),undefined);assert.equal(routeSpawn[0],'/usr/bin/sandbox-exec');
  assert.equal(routeSpawn[1].at(-3),'/bin/zsh');assert.equal(routeSpawn[1].at(-2),'-lic');
  routeRefused=true;await assert.rejects(lookup(),error=>error.code==='AUX_EXEC_CONTAINMENT_UNAVAILABLE');routeRefused=false;
  for(const [begin,end,name] of [
    ['async function runCommand(Cn){','async function resolveShellCommandPath(','runCommand'],
    ['async function runClaudeCommand(Cn){','async function getClaudeCommandPath(','runClaudeCommand'],
    ['async function getInstalledCliVersion(Cn){','async function fetchLatestCliRelease(','getInstalledCliVersion'],
  ]) {
    const fn=runInNewContext(`(()=>{${body(begin,end)}return ${name}})()`,routes);
    await fn(name==='runCommand'?['/fixture/provider']:name==='runClaudeCommand'?['auth','status']:'/fixture/aux');
    assert.equal(routeSpawn[0],'/usr/bin/sandbox-exec');assert.equal(routeSpawn[2].shell,false);
    routeRefused=true;
    if(name==='getInstalledCliVersion')await assert.rejects(fn('/fixture/aux'),error=>error.code==='AUX_EXEC_CONTAINMENT_UNAVAILABLE');
    else assert.equal((await fn([])).error.code,'AUX_EXEC_CONTAINMENT_UNAVAILABLE');
    routeRefused=false;
  }
  // Preserve SDK spawn arguments using the actual patched expression rather than
  // evaluating the surrounding SDK constructor and its private-field machinery.
  const sdkBash='auxMandatoryPrivateParentDenial().spawn([`/bin/bash`,`--noprofile`,`--norc`],{cwd:Cn,env:{...ei,PS1:``,PS2:``,TERM:`dumb`},stdio:[`pipe`,`pipe`,`pipe`],detached:!0})';
  assert.equal(proposal.source.split(sdkBash).length,2);
  runInNewContext(sdkBash,{auxMandatoryPrivateParentDenial:()=>routeBoundary,Cn:'/fixture/workspace',ei:{PATH:'/usr/bin:/bin'}});
  assert.equal(routeSpawn[2].detached,true);assert.deepEqual(Array.from(routeSpawn[2].stdio),['pipe','pipe','pipe']);
  const sdkGrep='auxMandatoryPrivateParentDenial().spawn([Cn,`-n`,`--no-heading`,`-e`,ei,`--`,ti],{...ni?{signal:ni}:{},stdio:[`ignore`,`pipe`,`pipe`]})';
  assert.equal(proposal.source.split(sdkGrep).length,2);
  runInNewContext(sdkGrep,{auxMandatoryPrivateParentDenial:()=>routeBoundary,Cn:'/fixture/rg',ei:'text',ti:'/fixture/workspace',ni:undefined});
  assert.equal(routeSpawn[0],'/usr/bin/sandbox-exec');assert.equal(routeSpawn[1].includes('/fixture/rg'),true);
  console.log(JSON.stringify({schema:'aux.exec-private-parent.proposal.v1',inputSha256:createHash('sha256').update(input).digest('hex'),anchors:proposal.anchors,checks:['full proposed ESM syntax only','native zero-argument fixed builtin seam','missing/mutable/native-platform refusal','caller-selected root ignored','canonical private cwd refusal','actual transformed MCP start wraps before spawn and pipes all stdio','native capture failure prevents actual MCP spawn','inherited MCP stderr refuses before spawn','actual models !exec routes through fixed contained shell without stdout logging','actual login PATH and provider/Claude/version route fixtures preserve results and native refusal','SDK bash and grep expressions retain arguments under mandatory denial','configured spawn rejects inherited stdio and shell overrides'],nativeProducerExecuted:false,sandboxExecuted:false,custodyAccepted:false,browserProfileContainment:false,inheritedHandleContainment:false},null,2));
}finally{rmSync(temp,{recursive:true,force:true});}
