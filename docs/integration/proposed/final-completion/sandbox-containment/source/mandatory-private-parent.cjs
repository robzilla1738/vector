'use strict';
// Proposal only: enforces one genuine native parent's denial, not writer custody.
// This cannot establish browser-profile containment until its native producer exists.
const path = require('node:path');
const { realpathSync } = require('node:fs');
const childProcess = require('node:child_process');
const fail = message => { const error = Error(`Aux exec containment: ${message}`); error.code = 'AUX_EXEC_CONTAINMENT_UNAVAILABLE'; throw error; };
function captureNativePrivateParent() {
  if (process.platform !== 'darwin') fail('mandatory macOS private-state denial is unavailable');
  const linked = process._linkedBinding;
  if (typeof linked !== 'function') fail('authenticated native owner binding is unavailable');
  let binding; try { binding = linked.call(process, 'aux_owned_native'); } catch { fail('authenticated native owner binding is unavailable'); }
  const descriptor = binding && Object.getOwnPropertyDescriptor(binding, 'captureExecPrivateParent');
  if (typeof descriptor?.value !== 'function' || descriptor.get || descriptor.set || descriptor.writable !== false || descriptor.configurable !== false) fail('authenticated private-parent producer is unavailable');
  // The native implementation accepts zero JS arguments and brackets the sealed
  // policy copy with current retained Environment/Owner/generation validation.
  let captured; try { captured = descriptor.value.call(binding); } catch { fail('authenticated private-parent capture failed'); }
  if (!captured || captured.format !== 'aux.native.exec-private-parent.v1' || typeof captured.privateParent !== 'string') fail('native private-parent metadata was refused');
  const parent = captured.privateParent;
  if (!path.isAbsolute(parent) || parent === '/' || path.normalize(parent) !== parent || /[\0\r\n]/.test(parent) || Buffer.byteLength(parent) > 4096) fail('native private-parent metadata is invalid');
  return parent;
}
const PRIVATE_PARENT_POLICY = `(version 1)
(allow default)
(deny file-read* file-write* file-map-executable
  (literal (param "AUX_NATIVE_PRIVATE_PARENT"))
  (subpath (param "AUX_NATIVE_PRIVATE_PARENT")))
(deny file-write-unlink
  (path-ancestors (param "AUX_NATIVE_PRIVATE_PARENT")))`;
function wrap(options) {
  // No path from options, environment, settings or a profile ID chooses this root.
  const parent = captureNativePrivateParent();
  if (!options || !Array.isArray(options.command) || !options.command.length || options.command.some(value => typeof value !== 'string' || value.includes('\0'))) fail('invalid command envelope');
  if (typeof options.cwd !== 'string' || !path.isAbsolute(options.cwd)) fail('absolute command working directory is required');
  let cwd; try { cwd = realpathSync(options.cwd); } catch { fail('working directory cannot be resolved'); }
  const relative = path.relative(parent, cwd);
  if (relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative))) fail('command working directory is inside private state');
  return {
    ...options,
    cwd,
    command: ['/usr/bin/sandbox-exec', '-p', PRIVATE_PARENT_POLICY, `-DAUX_NATIVE_PRIVATE_PARENT=${parent}`, '--', ...options.command],
    // Preserve the supplied optional workspace sandbox's status. This flag only
    // describes an outer private-parent-denial layer, never profile drain/authority.
    auxPrivateParentDenied: true,
  };
}
function pipeOptions(options) {
  if (options.shell !== undefined && options.shell !== false) fail('shell overrides are not accepted');
  if (!Array.isArray(options.stdio) || options.stdio.length !== 3 || options.stdio.some(mode => !['ignore','pipe'].includes(mode))) fail('only fresh pipe or ignored stdio may be inherited');
}
function spawn(command, options = {}) {
  pipeOptions(options);
  const contained = wrap({command,cwd:options.cwd??process.cwd(),env:options.env??process.env});
  return childProcess.spawn(contained.command[0], contained.command.slice(1), {...options,cwd:contained.cwd,env:contained.env,shell:false});
}
function execShell(script, options = {}) {
  if (typeof script !== 'string' || !script || script.includes('\0')) fail('invalid configured shell command');
  if (options.shell !== undefined || options.stdio !== undefined) fail('configured shell descriptor overrides are not accepted');
  const contained = wrap({command:['/bin/sh','-c',script],cwd:options.cwd??process.cwd(),env:options.env??process.env});
  return new Promise((resolve,reject)=>{
    // execFile creates pipe stdio. It receives no arbitrary descriptor/IPC or
    // shell option; the script remains stdin-free shell argv after sandbox-exec.
    childProcess.execFile(contained.command[0],contained.command.slice(1),{cwd:contained.cwd,env:contained.env,encoding:'utf8',timeout:options.timeout,signal:options.signal,maxBuffer:options.maxBuffer??1024*1024,shell:false},(error,stdout,stderr)=>{
      if (error) { error.stdout=stdout;error.stderr=stderr;reject(error); } else resolve({stdout,stderr});
    });
  });
}
module.exports = Object.freeze({ wrap, spawn, execShell });
