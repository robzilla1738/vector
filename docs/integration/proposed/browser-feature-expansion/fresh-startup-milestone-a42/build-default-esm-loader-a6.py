"""Use Node's real file ESM loader while supplying exact native-sealed bytes."""
import difflib
import hashlib
import json
from pathlib import Path
import shutil
import subprocess

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[4]
OUT = Path('/private/tmp/aux-browser-only-daemon-build-20261025-a46')
SOURCE = Path('/private/tmp/aux-standard-native-source-20261023-a4/AuxNativeNodeRunner.cc')
EXPECTED = '3379d8ef6bb089acc052228713906517bdda21945f3840e7216a104714ef6e7a'
sha = lambda path: hashlib.sha256(Path(path).read_bytes()).hexdigest()
assert sha(SOURCE) == EXPECTED
original = SOURCE.read_text()
helper = '''#if defined(AUX_BROWSER_ONLY_NATIVE_STARTUP) && AUX_BROWSER_ONLY_NATIVE_STARTUP
namespace {
// Node's embedder ESM loader supports builtins only. Run the fixed entry with
// its standard loader; a synchronous hook supplies the authenticated bytes.
constexpr char kSealedEntryBootstrap[] = R"AUXJS((function(require, process, sealedSource, sealedURL) {
  'use strict';
  const modules = require('node:module');
  const { pathToFileURL } = require('node:url');
  if (pathToFileURL(process.argv[1]).href !== sealedURL) {
    throw new Error('Aux sealed entry URL does not match the native entry');
  }
  modules.registerHooks({
    load(url, context, nextLoad) {
      if (url === sealedURL) {
        return { format: 'module', source: sealedSource, shortCircuit: true };
      }
      return nextLoad(url, context);
    }
  });
  return modules.runMain(process.argv[1]);
}))AUXJS";

v8::MaybeLocal<v8::Value> LoadSealedEntry(
    const node::StartExecutionCallbackInfo& info,
    node::CommonEnvironmentSetup& setup, const node::ModuleData& entry) {
  auto* isolate = setup.isolate();
  const auto context = setup.context();
  if (entry.format() != node::ModuleFormat::kModule || entry.source().empty() ||
      entry.source().size() > static_cast<size_t>(std::numeric_limits<int>::max()) ||
      entry.resource_name().empty() ||
      entry.resource_name().size() > static_cast<size_t>(std::numeric_limits<int>::max())) {
    isolate->ThrowException(v8::Exception::Error(
        v8::String::NewFromUtf8Literal(isolate, "Aux sealed entry is invalid")));
    return {};
  }
  v8::Local<v8::String> source, url;
  if (!v8::String::NewFromUtf8(isolate, entry.source().data(),
          v8::NewStringType::kNormal, static_cast<int>(entry.source().size())).ToLocal(&source) ||
      !v8::String::NewFromUtf8(isolate, entry.resource_name().data(),
          v8::NewStringType::kNormal, static_cast<int>(entry.resource_name().size())).ToLocal(&url)) return {};
  v8::Local<v8::Script> script;
  v8::Local<v8::Value> function;
  if (!v8::Script::Compile(context,
          v8::String::NewFromUtf8Literal(isolate, kSealedEntryBootstrap)).ToLocal(&script) ||
      !script->Run(context).ToLocal(&function)) return {};
  if (!function->IsFunction()) return {};
  v8::Local<v8::Value> arguments[] = {info.native_require, info.process_object, source, url};
  return function.As<v8::Function>()->Call(context, v8::Undefined(isolate), 4, arguments);
}
}  // namespace
#endif

'''
text = original.replace('#include <optional>\n', '#include <optional>\n#include <limits>\n' + helper)
assert text != original
before = '''  const bool loaded =
      !node::LoadEnvironment(env, &entry, preload.Callback()).IsEmpty();
'''
after = '''#if defined(AUX_BROWSER_ONLY_NATIVE_STARTUP) && AUX_BROWSER_ONLY_NATIVE_STARTUP
  const bool loaded = !node::LoadEnvironment(env,
      node::StartExecutionCallback{[&setup, &entry](const node::StartExecutionCallbackInfo& info) {
        return LoadSealedEntry(info, setup, entry);
      }}, preload.Callback()).IsEmpty();
#else
''' + before + '''#endif
'''
assert text.count(before) == 1
text = text.replace(before, after)
source = HERE / 'startup-default-esm-source/AuxNativeNodeRunner.cc'
source.parent.mkdir(exist_ok=True)
if source.exists():
    assert source.read_text() == text
else:
    with source.open('x') as f:f.write(text)
header = ROOT / 'docs/integration/proposed/aux-native-node-runner/source/AuxNativeNodeRunner.h'
shutil.copyfile(header, source.parent / header.name)
with (HERE / 'startup-default-esm-a6.patch').open('x') as f:f.writelines(difflib.unified_diff(original.splitlines(True),text.splitlines(True),fromfile='a/AuxNativeNodeRunner.cc',tofile='b/AuxNativeNodeRunner.cc'))
with (HERE / 'actual-default-esm-projection-a6.json').open('x') as f:json.dump(dict(
    passed=True,input=str(SOURCE),inputSha256=EXPECTED,output=str(source.resolve()),outputSha256=sha(source),
    headerCopiedUnchanged=dict(input=str(header),sha256=sha(header)),ordinaryOnly=True,
    nativeSealedBytesUsed=True,sourceNotInterpolated=True,entryUrlChecked=True,
    synchronousInThreadLoader=True,preloadExitEventLoopDrainUnchanged=True,
    authenticationAndPolicyUnchanged=True,uiChanged=False,signed=False,productExecuted=False),f,indent=2);f.write('\n')
OUT.mkdir(mode=0o700)
manifest=json.loads((ROOT/'docs/integration/proposed/standard-profile-isolation/integration/native-build-a2.json').read_text())
compile_command=list(next(row['command'] for row in manifest['commands'] if row['name']=='node-runner'))
compile_command[1:1]=['-DAUX_BROWSER_ONLY_NATIVE_STARTUP=1','-I/private/tmp/aux-browser-only-daemon-build-20261024-a42e/source']
assert compile_command.count(str(SOURCE))==1
compile_command[compile_command.index(str(SOURCE))]=str(source.resolve())
object_file=str(OUT/'node-runner.o')
compile_command[compile_command.index('-o')+1]=object_file
compile_command[compile_command.index('-MF')+1]=str(OUT/'node-runner.d')
previous=json.loads((HERE/'actual-daemon-entry-lifetime-build-a5.json').read_text());assert previous['passed']
link_command=list(previous['results'][-1]['command'])
old_object='/private/tmp/aux-standard-daemon-objects-20261023-a2/node-runner.o'
assert link_command.count(old_object)==1
link_command[link_command.index(old_object)]=object_file
link_command[link_command.index('-o')+1]=str(OUT/'Aux Daemon')
assert '-no_adhoc_codesign' in ' '.join(link_command)
frozen={};results=[]
for index,command in enumerate([compile_command,link_command]):
    for arg in command:
        if Path(arg).is_file():frozen[arg]=sha(arg)
    run=subprocess.run(command,cwd=ROOT,capture_output=True)
    (OUT/f'{index}.stdout').write_bytes(run.stdout);(OUT/f'{index}.stderr').write_bytes(run.stderr)
    results.append(dict(command=command,exitCode=run.returncode))
    if run.returncode:
        print(run.stderr.decode(errors='replace')[-6500:]);break
passed=len(results)==2 and all(row['exitCode']==0 for row in results)
receipt=dict(format='aux.ordinary-fresh.default-esm.daemon-build.v1',passed=passed,
    results=results,inputFiles=frozen,cppObjectsReused=13,cppOwnersRecompiled=1,
    swiftSourceCount=sum(arg.endswith('.swift') for arg in link_command),
    lifetimeAndIdentityReuseFixesRetained=True,policyUnchanged=True,
    productSigned=False,productExecuted=False,runtimeAcceptance=False)
if passed:
    binary=OUT/'Aux Daemon';load=subprocess.run(['/usr/bin/otool','-l',str(binary)],capture_output=True,check=True).stdout
    assert b'LC_CODE_SIGNATURE' not in load
    receipt.update(binary=str(binary),binarySha256=sha(binary),codeSignatureLoadCommandPresent=False)
for name,digest in frozen.items():assert sha(name)==digest,name
with (HERE/'actual-daemon-default-esm-build-a6.json').open('x') as f:json.dump(receipt,f,indent=2);f.write('\n')
print(json.dumps(dict(passed=passed,cppOwnersRecompiled=1,swiftSources=receipt['swiftSourceCount'],signed=False)))
if not passed:raise SystemExit(1)
