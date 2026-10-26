#!/usr/bin/env python3
"""Inactive finite PTY source overlays only; never project, compile or activate."""
from pathlib import Path
import hashlib,json,difflib
HERE=Path(__file__).resolve().parent
ROOT=Path('/Users/rcourson/Documents/Vibe/web')
sha=lambda b:hashlib.sha256(b).hexdigest()
records=[]
def overlay(source,name,pairs):
    before=source.read_text();after=before
    for a,z in pairs:
        assert after.count(a)==1,(str(source),a[:90],after.count(a));after=after.replace(a,z)
    output=HERE/'source'/name;output.write_text(after)
    records.append({'input':str(source),'inputSha256':sha(before.encode()),'output':str(ROOT/'docs/integration/proposed/completion-20261026/runtime/fixed-pty-linked/source'/name),'outputSha256':sha(after.encode()),'anchors':[{'before':a,'after':z,'count':1} for a,z in pairs]})
    return ''.join(difflib.unified_diff(before.splitlines(True),after.splitlines(True),fromfile=str(source),tofile=name))
pty=ROOT/'docs/integration/proposed/aux-node-pty-direct-child/source/pty.cc'
patch=overlay(pty,'pty-linked.cc',[( 'NODE_API_MODULE(NODE_GYP_MODULE_NAME, init)', '''// Linked initializer only: the actual host registers it in the original main
// Environment after genuine supervised/ES admission. No dynamic module export.
extern "C" napi_value AuxInitializeFixedPty(napi_env env,napi_value exports) {
  try { return init(Napi::Env(env),Napi::Object(env,exports)); }
  catch(const Napi::Error& error) {error.ThrowAsJavaScriptException();return nullptr;}
  catch(...) {napi_throw_error(env,"AUX_PTY_INITIALIZER_FAILED","Fixed PTY initializer interrupted");return nullptr;}
}''')])
worker=ROOT/'docs/integration/proposed/completion-20261026/runtime/final-daemon/source/AuxDevelopmentWorkerHost.combined.cc'
patch+=overlay(worker,'AuxDevelopmentWorkerHost.cc',[
 ('#include "AuxAccountMemoryHelper.h"','#include "AuxAccountMemoryHelper.h"\nextern "C" napi_value AuxInitializeFixedPty(napi_env,napi_value);'),
 ('#include "AuxSelectedFileReader.inc"','#include "AuxSelectedFileReader.inc"\n#include "AuxFixedPtyLinked.inc"'),
 ('  if(status==napi_ok && worker->CanContinue()) RegisterFixedBuiltins(worker);','  if(status==napi_ok && worker->CanContinue()) RegisterFixedBuiltins(worker);\n  if(status==napi_ok && worker->CanContinue()) RegisterFixedPtyLinked(worker);')])
base=ROOT/'out/provided-candidate-local-completion-20261025-a38/Aux.app/Contents/Resources/aux/apps/daemon/Aux Daemon.app/Contents/Resources'
package=base/'native/node-pty/lib/unixTerminal.js'
patch+=overlay(package,'unixTerminal.js',[("var native = utils_1.loadNativeModule('pty');", "// Native policy selects the real helper; this string preserves fork ABI only.\nvar native = { module: process._linkedBinding('aux_pty_builtin'), dir: '.' };")])
entry=base/'node-development/aux-native-entry.mjs';text=entry.read_text();a=text.index('function loadNodePty(){');z=text.index('function ',a+len('function loadNodePty(){'));z=text.index('function ',z+9)
# Capture the actual pair exactly through the next declaration rather than old source normalization.
before=text[a:z]
assert before.startswith('function loadNodePty(){') and 'function ensureSpawnHelperExecutable(' in before
fixed='function loadNodePty(){if(loadedNodePty)return loadedNodePty;auxRequireSupervisedTasks();if(process.platform!==`darwin`||process.arch!==`arm64`)throw Error(`PTY_UNAVAILABLE: unsupported fixed target.`);let Cn=path.resolve(path.dirname(process.execPath),`../Resources/native/node-pty/package.json`);let ei=createRequire(Cn);return loadedNodePty=ei(path.dirname(Cn)),loadedNodePty}'
# Resource entry proposal excludes full huge source; count-checked pair only.
(HERE/'entry.anchors.json').write_text(json.dumps({'input':str(entry),'inputSha256':sha(entry.read_bytes()),'anchors':[{'before':before,'after':fixed,'count':1}],'activation':'EntitlementRequired; no guard/compile flag changed'},indent=2)+'\n')
(HERE/'source.patch').write_text(patch)
(HERE/'changes.json').write_text(json.dumps({'format':'aux.fixed-pty-linked-proposal.v1','records':records,'entitlementRequired':True,'activated':False,'compiled':False,'executed':False},indent=2)+'\n')
