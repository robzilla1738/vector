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
  function load({binding,platform='darwin',resolveCwd=path=>path}={}) {
    const module={exports:{}};let captures=0;
    const process={platform,_linkedBinding(name){assert.equal(name,'aux_owned_native');captures++;return binding;}};
    runInNewContext(moduleSource,{module,Buffer,process,require:name=>name==='node:fs'?{realpathSync:resolveCwd}:require(name)});
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
  console.log(JSON.stringify({schema:'aux.exec-private-parent.proposal.v1',inputSha256:createHash('sha256').update(input).digest('hex'),anchors:proposal.anchors,checks:['full proposed ESM syntax only','native zero-argument fixed builtin seam','missing/mutable/native-platform refusal','caller-selected root ignored','canonical private cwd refusal','actual transformed MCP start wraps before spawn and pipes all stdio','native capture failure prevents actual MCP spawn','inherited MCP stderr refuses before spawn'],nativeProducerExecuted:false,sandboxExecuted:false,custodyAccepted:false,browserProfileContainment:false,inheritedHandleContainment:false},null,2));
}finally{rmSync(temp,{recursive:true,force:true});}
