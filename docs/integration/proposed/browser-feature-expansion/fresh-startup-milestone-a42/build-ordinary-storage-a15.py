"""Build the existing daemon with retained ordinary storage authorization."""
import hashlib
import json
from pathlib import Path
import subprocess

HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[4]
OUT=Path('/private/tmp/aux-browser-only-daemon-build-20261025-a55')
sha=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest()
projection=json.loads((HERE/'ordinary-storage-source/projection.json').read_text())
previous=json.loads((HERE/'actual-daemon-image-path-check-build-a13.json').read_text())
assert previous['passed']
link=list(previous['results'][-1]['command'])
for row in projection['files']:
    assert sha(row['input'])==row['inputSha256']
    target=HERE/'ordinary-storage-source'/Path(row['output']).name
    assert sha(target)==row['outputSha256']
    assert link.count(row['input'])==1,row['input']
    link[link.index(row['input'])]=str(target)
native=json.loads((HERE/'actual-ordinary-storage-native-projection-a15.json').read_text())
for row in native['files']:
    assert sha(row['input'])==row['inputSha256']
    assert sha(row['output'])==row['outputSha256']
old=json.loads((HERE/'actual-daemon-startup-diagnostics-build-a10.json').read_text())
worker=list(next(row['command'] for row in old['results'] if any(a.endswith('/AuxDevelopmentWorkerHost.cc') for a in row['command'])))
manifest=json.loads((ROOT/'docs/integration/proposed/standard-profile-isolation/integration/native-build-a2.json').read_text())
bridge=list(next(row['command'] for row in manifest['commands'] if row['name']=='parent-bridge'))
OUT.mkdir(mode=0o700)
commands=[]
for command,name in [(worker,'worker-host'),(bridge,'parent-bridge')]:
    source=next(a for a in command if a.endswith('.cc'))
    target=HERE/'ordinary-storage-native'/Path(source).name
    old_object=command[command.index('-o')+1]
    assert link.count(old_object)==1,old_object
    command[command.index(source)]=str(target)
    command[command.index('-o')+1]=str(OUT/(name+'.o'))
    command[command.index('-MF')+1]=str(OUT/(name+'.d'))
    link[link.index(old_object)]=str(OUT/(name+'.o'))
    commands.append(command)
link[link.index('-o')+1]=str(OUT/'Aux Daemon')
commands.append(link)
results=[]
frozen={row['output']:sha(row['output']) for row in native['files']}
for index,command in enumerate(commands):
    for arg in command:
        if Path(arg).is_file():frozen[arg]=sha(arg)
    run=subprocess.run(command,cwd=ROOT,capture_output=True)
    (OUT/f'{index}.stdout').write_bytes(run.stdout);(OUT/f'{index}.stderr').write_bytes(run.stderr)
    results.append(dict(command=command,exitCode=run.returncode))
    print(json.dumps(dict(step=index,exitCode=run.returncode)),flush=True)
    if run.returncode:print(run.stderr.decode(errors='replace')[-5000:]);break
passed=len(results)==3 and all(row['exitCode']==0 for row in results)
receipt=dict(format='aux.ordinary-fresh.storage-lifetime.build.v1',passed=passed,results=results,inputFiles=frozen,cppOwnersRecompiled=2,cppObjectsReused=12,swiftSourceCount=sum(a.endswith('.swift') for a in link),sensitiveCommandsStillFullValidation=True,productSigned=False,productExecuted=False)
if passed:
    binary=OUT/'Aux Daemon';load=subprocess.run(['/usr/bin/otool','-l',str(binary)],check=True,capture_output=True).stdout
    assert b'LC_CODE_SIGNATURE' not in load
    receipt.update(binary=str(binary),binarySha256=sha(binary),codeSignatureLoadCommandPresent=False)
for name,digest in frozen.items():assert sha(name)==digest,name
with (HERE/'actual-daemon-ordinary-storage-build-a15.json').open('x') as f:json.dump(receipt,f,indent=2);f.write('\n')
if not passed:raise SystemExit(1)
