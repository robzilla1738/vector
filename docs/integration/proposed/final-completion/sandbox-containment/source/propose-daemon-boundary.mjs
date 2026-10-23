// Proposal only. The root integrator owns any actual daemon/resource hookup.
// Uses fixed packaged resource topology; no environment/path/provider override.
export function proposeDaemonPrivateParentBoundary(source) {
  const anchors = [];
  function exact(name, before, after) {
    const count = source.split(before).length - 1;
    if (count !== 1) throw Error(`${name}: expected one supplied anchor, found ${count}`);
    source = source.replace(before, after); anchors.push({name,count});
  }
  exact('retain supplied optional sandbox implementation', 'async function wrapSandboxCommand(Cn){', 'async function wrapSessionSandboxCommand(Cn){');
  // Calls remain named wrapSandboxCommand; only its implementation is composed.
  // The old false/passthrough return is therefore inside the mandatory layer.
  const wrap = 'async function wrapSandboxCommand(options){return auxMandatoryPrivateParentDenial().wrap(await wrapSessionSandboxCommand(options))}';
  const mcpBefore = 'this._process=(0,import_cross_spawn.default)(this._serverParams.command,this._serverParams.args??[],{env:{...getDefaultEnvironment(),...this._serverParams.env},stdio:[`pipe`,`pipe`,this._serverParams.stderr??`inherit`],shell:!1,windowsHide:process$1.platform===`win32`,cwd:this._serverParams.cwd})';
  const mcpAfter = 'if(this._serverParams.stderr!==`pipe`)throw Error(`Aux exec containment requires piped MCP stderr`);let auxContainedMcp=auxMandatoryPrivateParentDenial().wrap({command:[this._serverParams.command,...this._serverParams.args??[]],cwd:this._serverParams.cwd??process.cwd(),env:{...getDefaultEnvironment(),...this._serverParams.env}});this._process=(0,import_cross_spawn.default)(auxContainedMcp.command[0],auxContainedMcp.command.slice(1),{env:auxContainedMcp.env,stdio:[`pipe`,`pipe`,`pipe`],shell:!1,windowsHide:process$1.platform===`win32`,cwd:auxContainedMcp.cwd})';
  exact('actual MCP stdio spawn receives mandatory native-parent denial', mcpBefore, mcpAfter);
  function route(name, begin, end, edit) {
    const first=source.indexOf(begin),last=source.indexOf(end,first+begin.length);
    if(first<0||last<0)throw Error(`${name}: supplied function boundary missing`);
    const original=source.slice(first,last),changed=edit(original);
    if(changed===original)throw Error(`${name}: route edit missing`);
    exact(name,original,changed);
  }
  const containedSpawn = body => {
    if(body.split('spawnCommand(').length!==2)throw Error('Expected exactly one configured launch in function');
    return body.replace('spawnCommand(', 'auxMandatoryPrivateParentDenial().spawn(');
  };
  const refuseFallback = body => {
    if(body.split('catch{return').length!==2)throw Error('Expected exactly one lookup fallback');
    return body.replace('catch{return','catch(auxContainmentError){if(auxContainmentError?.code===`AUX_EXEC_CONTAINMENT_UNAVAILABLE`)throw auxContainmentError;return');
  };
  route('models credential command uses contained pipe-only shell','async function resolveConfigValue(Cn){','function resolveEnvironmentValue(Cn){',body=>{
    const before='execAsync$1(ei,{timeout:CONFIG_VALUE_COMMAND_TIMEOUT_MS})';
    if(body.split(before).length!==2)throw Error('Configured credential shell anchor drift');
    return body.replace(before,'auxMandatoryPrivateParentDenial().execShell(ei,{timeout:CONFIG_VALUE_COMMAND_TIMEOUT_MS})').replace('catch(Cn){console.warn','catch(Cn){if(Cn?.code===`AUX_EXEC_CONTAINMENT_UNAVAILABLE`)throw Cn;console.warn');
  });
  route('MCP PATH login shell has mandatory denial','async function resolveShellPath(){','async function listAllMcpTools(',body=>refuseFallback(containedSpawn(body)));
  route('Claude command discovery login shell has mandatory denial','async function resolveClaudeCommandPath(){','function parseClaudeCommandPath(',body=>refuseFallback(containedSpawn(body)));
  route('configured Claude command has mandatory denial','async function runClaudeCommand(Cn){','async function getClaudeCommandPath(',containedSpawn);
  route('configured provider command has mandatory denial','async function runCommand(Cn){','async function resolveShellCommandPath(',containedSpawn);
  route('provider command discovery login shell has mandatory denial','async function resolveShellCommandPath(Cn){','async function readLastUsedAt(',body=>refuseFallback(containedSpawn(body)));
  route('Aux command discovery login shell has mandatory denial','async function resolveAuxCommandPath(Cn,ei=fs.existsSync){','async function getWindowsCliInstallation(',body=>refuseFallback(containedSpawn(body)));
  route('installed CLI version probe has mandatory denial','async function getInstalledCliVersion(Cn){','async function fetchLatestCliRelease(',body=>refuseFallback(containedSpawn(body)));
  exact('SDK bash tool session receives mandatory denial and fresh pipes',
    'child_process.spawn(`/bin/bash`,[`--noprofile`,`--norc`],{cwd:Cn,env:{...ei,PS1:``,PS2:``,TERM:`dumb`},stdio:[`pipe`,`pipe`,`pipe`],detached:!0})',
    'auxMandatoryPrivateParentDenial().spawn([`/bin/bash`,`--noprofile`,`--norc`],{cwd:Cn,env:{...ei,PS1:``,PS2:``,TERM:`dumb`},stdio:[`pipe`,`pipe`,`pipe`],detached:!0})');
  exact('SDK grep tool execution receives mandatory denial and explicit pipes',
    'child_process.spawn(Cn,[`-n`,`--no-heading`,`-e`,ei,`--`,ti],{...ni?{signal:ni}:{}})',
    'auxMandatoryPrivateParentDenial().spawn([Cn,`-n`,`--no-heading`,`-e`,ei,`--`,ti],{...ni?{signal:ni}:{},stdio:[`ignore`,`pipe`,`pipe`]})');
  const prelude = `\nlet auxMandatoryPrivateParentModule;function auxMandatoryPrivateParentDenial(){return auxMandatoryPrivateParentModule??=require$2(path.join(__auxDaemonResources,'native/mandatory-private-parent.cjs'))}\n${wrap}\n`;
  return {source,prelude,anchors,coverage:'private-parent-only',browserProfileContainment:false,inheritedHandleContainment:false,custodyAccepted:false};
}
