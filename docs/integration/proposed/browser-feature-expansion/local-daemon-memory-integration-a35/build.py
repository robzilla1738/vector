"""Compose and compile the final per-account helper into the actual daemon.

Run through scripts/native-build.py. All product links remain unsigned.
"""
from pathlib import Path
import hashlib
import json
import shutil
import subprocess
import time

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[4]
FEATURE = HERE.parent
OUT = Path('/private/tmp/aux-browser-only-daemon-build-20261025-a61')
sha = lambda p: hashlib.sha256(Path(p).read_bytes()).hexdigest()
def repository_path(value):
    return ROOT/value[value.index('docs/'):]
def commands(value):
    if isinstance(value, dict):
        for child in value.values():
            yield from commands(child)
    elif isinstance(value, list):
        if '-c' in value and any(isinstance(x,str) and x.endswith('/AuxDevelopmentWorkerHost.cc') for x in value):
            yield value
        else:
            for child in value:
                yield from commands(child)

base_path = FEATURE/'local-daemon-integration-a33/actual-link.json'
base = json.loads(base_path.read_text())
assert base['passed'] and not base['productSigned'] and base['swiftSourceCount'] == 49
for path, digest in base['inputFiles'].items():
    assert sha(path) == digest, path
selected = {Path(path).name:Path(path) for path in base['command'] if path.endswith('.swift')}
files = {}
plans = [FEATURE/name/'projection.json' for name in (
    'productivity-memory-native-a41', 'productivity-memory-launch-fence-a42')]
for plan_path in plans:
    for row in json.loads(plan_path.read_text())['files']:
        name = Path(row['output']).name
        source = repository_path(row['output'])
        assert sha(source) == row['outputSha256'], name
        if not row.get('create'):
            previous = files.get(name) or repository_path(row['input'])
            assert sha(previous) == row['inputSha256'], name
            if name.endswith('.swift'):
                assert sha(selected[name]) == row['inputSha256'], name
            text = previous.read_text()
            for anchor in row['anchors']:
                before = anchor.get('before',anchor.get('find'))
                after = anchor.get('after',anchor.get('replace'))
                count = anchor.get('count',anchor.get('expectedCount'))
                assert text.count(before) == count, name
                text = text.replace(before,after)
            assert text == source.read_text(), name
        files[name] = source
        if name.endswith('.swift'):
            selected[name] = source

OUT.mkdir(mode=0o700)
flat = OUT/'source'
flat.mkdir(mode=0o700)
# Quoted includes search their source directory first. Put the final header,
# inline and translation-unit bytes together, not in competing -I overlays.
for name, source in files.items():
    shutil.copyfile(source,flat/name)
    assert sha(flat/name) == sha(source)
    if name.endswith('.swift'):
        selected[name] = flat/name

history_path = FEATURE/'fresh-startup-milestone-a42/actual-daemon-ordinary-storage-build-a15.json'
history = json.loads(history_path.read_text())
worker = list(next(commands(history)))
old_worker_source = next(x for x in worker if x.endswith('/AuxDevelopmentWorkerHost.cc'))
assert sha(old_worker_source) == next(row['inputSha256'] for row in json.loads(plans[0].read_text())['files'] if row['name']=='AuxDevelopmentWorkerHost.cc')
worker[worker.index(old_worker_source)] = str(flat/'AuxDevelopmentWorkerHost.cc')
worker[worker.index('-o')+1] = str(OUT/'worker-host.o')
worker[worker.index('-MF')+1] = str(OUT/'worker-host.d')
worker.insert(1,'-I'+str(flat))
helper = list(worker)
helper[helper.index(str(flat/'AuxDevelopmentWorkerHost.cc'))] = str(flat/'AuxAccountMemoryHelper.mm')
helper[helper.index('-o')+1] = str(OUT/'memory-helper.o')
helper[helper.index('-MF')+1] = str(OUT/'memory-helper.d')
helper.insert(1,'-fobjc-arc')

link = list(base['command'])
old_swift_names = {Path(path).name for path in link if path.endswith('.swift')}
for i,path in enumerate(link):
    if path.endswith('.swift'):
        link[i] = str(selected[Path(path).name])
    elif path.endswith('/worker-host.o'):
        link[i] = str(OUT/'worker-host.o')
link += [str(path) for name,path in selected.items() if name not in old_swift_names]
link.append(str(OUT/'memory-helper.o'))
link[link.index('-o')+1] = str(OUT/'Aux Daemon')
assert '-no_adhoc_codesign' in link and len(selected) == 50
assert sum(path==str(OUT/'worker-host.o') for path in link)==1

frozen = {str(path):sha(path) for path in files.values()}
frozen.update({str(path):sha(path) for path in flat.iterdir()})
frozen.update({str(path):sha(path) for path in selected.values()})
for command in [worker,helper,link]:
    for value in command:
        if Path(value).is_file():
            frozen[value] = sha(value)
plan = dict(base=base_path.as_posix(),baseSha256=sha(base_path),
    projectionPins={str(path):sha(path) for path in plans},inputFiles=frozen,
    commands=[worker,helper,link],swiftSourceCount=50,flatSourceDirectory=str(flat),
    productExecuted=False,productSigned=False)
(HERE/'build-plan.json').write_text(json.dumps(plan,indent=2)+'\n')
results=[]
start=time.monotonic()
for label,command in zip(['worker','helper','link'],[worker,helper,link]):
    with (OUT/(label+'.stdout')).open('wb') as stdout,(OUT/(label+'.stderr')).open('wb') as stderr:
        result=subprocess.run(command,cwd=ROOT,stdout=stdout,stderr=stderr)
    results.append(dict(label=label,exitCode=result.returncode))
    if result.returncode:
        break
receipt=dict(passed=len(results)==3 and all(row['exitCode']==0 for row in results),
    planSha256=sha(HERE/'build-plan.json'),results=results,seconds=time.monotonic()-start,
    swiftSourceCount=50,changedCppObjects=2,productExecuted=False,productSigned=False)
if receipt['passed']:
    binary=OUT/'Aux Daemon'
    probe=subprocess.run(['/usr/bin/otool','-l',str(binary)],check=True,capture_output=True).stdout
    assert b'LC_CODE_SIGNATURE' not in probe
    receipt.update(binary=str(binary),binarySha256=sha(binary),codeSignatureLoadCommandPresent=False)
for path,digest in frozen.items():
    assert sha(path)==digest,path
(HERE/'actual-build.json').write_text(json.dumps(receipt,indent=2)+'\n')
print(json.dumps(receipt))
raise SystemExit(0 if receipt['passed'] else 1)
