"""Fix borrowed ModuleData buffer ownership and rebuild only its C++ owner."""
import difflib
import hashlib
import json
from pathlib import Path
import subprocess

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[4]
OUT = Path('/private/tmp/aux-browser-only-daemon-build-20261025-a45')
SOURCE = Path('/private/tmp/aux-browser-only-daemon-build-20261024-a42e/source/AuxNativeDaemonMain.cc')
EXPECTED = '1711d0383cce5657e7332caf9ae61af717c8483fe67487cc0914fc5409566908'
sha = lambda path: hashlib.sha256(Path(path).read_bytes()).hexdigest()
assert sha(SOURCE) == EXPECTED
original = SOURCE.read_text()
before = '''  node::ModuleData entry;
  entry.set_source({static_cast<const char*>(source), source_length});
  entry.set_format(node::ModuleFormat::kModule);
  entry.set_resource_name(resource_url);
  const auto script_path = FilePath(resource_url);
  free(source);
  free(resource_url);
'''
after = '''  // ModuleData stores borrowed string_views. Keep both native buffers
  // alive through LoadEnvironment, the event loop and environment teardown.
  const std::unique_ptr<void, decltype(&free)> entry_source(source, &free);
  const std::unique_ptr<char, decltype(&free)> entry_resource_url(resource_url, &free);
  node::ModuleData entry;
  entry.set_source({static_cast<const char*>(entry_source.get()), source_length});
  entry.set_format(node::ModuleFormat::kModule);
  entry.set_resource_name(entry_resource_url.get());
  const auto script_path = FilePath(entry_resource_url.get());
'''
assert original.count(before) == 1
text = original.replace(before, after)
source = HERE / 'startup-entry-lifetime-source/AuxNativeDaemonMain.cc'
source.parent.mkdir()
with source.open('x') as f:f.write(text)
with (HERE / 'startup-entry-lifetime-a5.patch').open('x') as f:f.writelines(difflib.unified_diff(original.splitlines(True),text.splitlines(True),fromfile='a/AuxNativeDaemonMain.cc',tofile='b/AuxNativeDaemonMain.cc'))
projection = dict(format='aux.ordinary-fresh.entry-lifetime.projection.v1',passed=True,
    input=str(SOURCE),inputSha256=EXPECTED,output=str(source.resolve()),outputSha256=sha(source),
    anchor=dict(before=before,after=after,count=1),
    sourceAndResourceOwnersOutliveModuleData=True,failurePathFreesPreserved=True,
    authenticationUnchanged=True,policyUnchanged=True,uiChanged=False,productExecuted=False,signed=False)
with (HERE / 'actual-entry-lifetime-projection-a5.json').open('x') as f:json.dump(projection,f,indent=2);f.write('\n')
OUT.mkdir(mode=0o700)
old = json.loads((HERE / 'actual-daemon-build-a4.json').read_text())
previous = json.loads((HERE / 'actual-daemon-identity-reuse-build-a4b.json').read_text())
assert old['passed'] and previous['passed']
compile_command = list(old['results'][0]['command'])
assert compile_command.count(str(SOURCE)) == 1
compile_command[compile_command.index(str(SOURCE))] = str(source.resolve())
object_file = str(OUT / 'main.o')
compile_command[compile_command.index('-o') + 1] = object_file
compile_command[compile_command.index('-MF') + 1] = str(OUT / 'main.d')
link_command = list(previous['command'])
old_object = old['results'][0]['command'][old['results'][0]['command'].index('-o') + 1]
assert link_command.count(old_object) == 1
link_command[link_command.index(old_object)] = object_file
link_command[link_command.index('-o') + 1] = str(OUT / 'Aux Daemon')
assert '-no_adhoc_codesign' in ' '.join(link_command)
results = []
frozen = {}
for index,command in enumerate([compile_command,link_command]):
    for arg in command:
        if Path(arg).is_file():frozen[arg]=sha(arg)
    run=subprocess.run(command,cwd=ROOT,capture_output=True)
    (OUT / f'{index}.stdout').write_bytes(run.stdout)
    (OUT / f'{index}.stderr').write_bytes(run.stderr)
    results.append(dict(command=command,exitCode=run.returncode))
    if run.returncode:
        print(run.stderr.decode(errors='replace')[-6000:]);break
passed=len(results)==2 and all(row['exitCode']==0 for row in results)
receipt=dict(format='aux.ordinary-fresh.entry-lifetime.daemon-build.v1',passed=passed,
    results=results,inputFiles=frozen,cppObjectsReused=13,cppOwnersRecompiled=1,
    swiftSourceCount=sum(arg.endswith('.swift') for arg in link_command),
    handleReuseRetained=True,policyUnchanged=True,productSigned=False,productExecuted=False,runtimeAcceptance=False)
if passed:
    binary=OUT / 'Aux Daemon'
    load=subprocess.run(['/usr/bin/otool','-l',str(binary)],capture_output=True,check=True).stdout
    assert b'LC_CODE_SIGNATURE' not in load
    receipt.update(binary=str(binary),binarySha256=sha(binary),codeSignatureLoadCommandPresent=False)
for name,digest in frozen.items():assert sha(name)==digest,name
with (HERE / 'actual-daemon-entry-lifetime-build-a5.json').open('x') as f:json.dump(receipt,f,indent=2);f.write('\n')
print(json.dumps(dict(passed=passed,cppOwnersRecompiled=1,swiftSources=receipt['swiftSourceCount'],signed=False)))
if not passed:raise SystemExit(1)
