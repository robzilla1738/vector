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
  const prelude = `\nlet auxMandatoryPrivateParentModule;function auxMandatoryPrivateParentDenial(){return auxMandatoryPrivateParentModule??=require$2(path.join(__auxDaemonResources,'native/mandatory-private-parent.cjs'))}\n${wrap}\n`;
  return {source,prelude,anchors,coverage:'private-parent-only',browserProfileContainment:false,inheritedHandleContainment:false,custodyAccepted:false};
}
