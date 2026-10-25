"""Identify the existing native refusal without changing admission behavior."""
import difflib
import hashlib
import json
from pathlib import Path
import subprocess

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[4]
OUT = Path('/private/tmp/aux-browser-only-daemon-build-20261025-a50')
SOURCES = HERE / 'startup-diagnostics-source'
sha = lambda p: hashlib.sha256(Path(p).read_bytes()).hexdigest()
old_build = json.loads((HERE / 'actual-daemon-build-a4.json').read_text())
main_build = json.loads((HERE / 'actual-daemon-entry-lifetime-build-a5.json').read_text())
previous = json.loads((HERE / 'actual-daemon-default-esm-build-a6.json').read_text())
assert old_build['passed'] and main_build['passed'] and previous['passed']
link = list(previous['results'][-1]['command'])
main_input = Path(next(x for x in main_build['results'][0]['command'] if x.endswith('.cc')))
worker_command = list(next(r['command'] for r in old_build['results'] if any(a.endswith('/AuxDevelopmentWorkerHost.cc') for a in r['command'])))
worker_input = Path(next(a for a in worker_command if a.endswith('/AuxDevelopmentWorkerHost.cc')))
swift_input = Path(next(a for a in link if a.endswith('/AuxOwnedCommandDispatcher.swift')))
broker_input = ROOT / 'docs/integration/proposed/profile-isolation-continuation/broker-writes/source/AuxBrokerWritesNapi.inc'
changes = [
    (main_input, '''          failed_.store(true);
''', '''          fprintf(stderr, "Aux ready pulse refused: status %d\\n", status);
          failed_.store(true);
'''),
    (broker_input, '''  if(!owner||AuxNativeContextValidateCurrentAuthority(owner->handle)!=0)return {};
''', '''  if(!owner){fprintf(stderr,"Aux broker refused: missing owner\\n");return {};}
  const auto authority=AuxNativeContextValidateCurrentAuthority(owner->handle);
  if(authority!=0){fprintf(stderr,"Aux broker refused: authority status %d\\n",authority);return {};}
'''),
    (swift_input, '''            let classified=classifyAuxNativeFreshGuard(error)
''', '''            // Type and finite status only: no paths, keys, rows or error payloads.
            fputs("Aux native guard refused: \\(String(reflecting:type(of:error)))\\n",stderr)
            if case AuxFreshColdGuardError.peer(let status)=error {
                fputs("Aux native guard peer status: \\(status)\\n",stderr)
            }
            let classified=classifyAuxNativeFreshGuard(error)
''')]
SOURCES.mkdir()
rows=[]
patch=[]
for source, before, after in changes:
    text=source.read_text()
    assert text.count(before)==1,str(source)
    changed=text.replace(before,after)
    target=SOURCES/source.name
    target.write_text(changed)
    rows.append(dict(input=str(source),inputSha256=sha(source),output=str(target),outputSha256=sha(target)))
    patch.extend(difflib.unified_diff(text.splitlines(True),changed.splitlines(True),fromfile='a/'+source.name,tofile='b/'+source.name))
(SOURCES/worker_input.name).write_bytes(worker_input.read_bytes())
rows.append(dict(input=str(worker_input),inputSha256=sha(worker_input),output=str(SOURCES/worker_input.name),outputSha256=sha(SOURCES/worker_input.name),unchangedSourceLocalInclude=True))
with (HERE/'startup-diagnostics-a10.patch').open('x') as f:f.writelines(patch)
with (HERE/'actual-startup-diagnostics-projection-a10.json').open('x') as f:json.dump(dict(passed=True,files=rows,admissionBehaviorUnchanged=True,nonSecretFiniteDiagnosticsOnly=True,uiChanged=False,productExecuted=False),f,indent=2);f.write('\n')
OUT.mkdir(mode=0o700)
commands=[]
for command, source, name in [(list(main_build['results'][0]['command']),main_input,'main'),(worker_command,worker_input,'worker-host')]:
    old_object=command[command.index('-o')+1]
    command[command.index(str(source))]=str(SOURCES/source.name)
    command[command.index('-o')+1]=str(OUT/(name+'.o'))
    command[command.index('-MF')+1]=str(OUT/(name+'.d'))
    assert link.count(old_object)==1
    link[link.index(old_object)]=str(OUT/(name+'.o'))
    commands.append(command)
link[link.index(str(swift_input))]=str(SOURCES/swift_input.name)
link[link.index('-o')+1]=str(OUT/'Aux Daemon')
commands.append(link)
frozen={str(SOURCES/r.name):sha(SOURCES/r.name) for r in SOURCES.iterdir()}
results=[]
for i,command in enumerate(commands):
    for arg in command:
        if Path(arg).is_file():frozen[arg]=sha(arg)
    run=subprocess.run(command,cwd=ROOT,capture_output=True)
    (OUT/f'{i}.stdout').write_bytes(run.stdout)
    (OUT/f'{i}.stderr').write_bytes(run.stderr)
    results.append(dict(command=command,exitCode=run.returncode))
    print(json.dumps(dict(step=i,exitCode=run.returncode)),flush=True)
    if run.returncode:
        print(run.stderr.decode(errors='replace')[-4500:]);break
passed=len(results)==3 and all(r['exitCode']==0 for r in results)
receipt=dict(format='aux.ordinary-fresh.startup-diagnostics.build.v1',passed=passed,results=results,inputFiles=frozen,cppOwnersRecompiled=2,cppObjectsReused=12,swiftSourceCount=sum(a.endswith('.swift') for a in link),admissionBehaviorUnchanged=True,productSigned=False,productExecuted=False)
if passed:
    binary=OUT/'Aux Daemon'
    load=subprocess.run(['/usr/bin/otool','-l',str(binary)],check=True,capture_output=True).stdout
    assert b'LC_CODE_SIGNATURE' not in load
    receipt.update(binary=str(binary),binarySha256=sha(binary),codeSignatureLoadCommandPresent=False)
for name,digest in frozen.items():assert sha(name)==digest,name
with (HERE/'actual-daemon-startup-diagnostics-build-a10.json').open('x') as f:json.dump(receipt,f,indent=2);f.write('\n')
if not passed:raise SystemExit(1)
