"""Resume only the failed helper object and full paired daemon link."""
from pathlib import Path
import hashlib
import json
import subprocess
import time

HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[4]
PREVIOUS=HERE.parent/'local-daemon-memory-integration-a35'
OUT=Path('/private/tmp/aux-browser-only-daemon-build-20261025-a62')
sha=lambda path:hashlib.sha256(Path(path).read_bytes()).hexdigest()
plan=json.loads((PREVIOUS/'build-plan.json').read_text())
failed=json.loads((PREVIOUS/'actual-build.json').read_text())
assert not failed['passed'] and failed['planSha256']==sha(PREVIOUS/'build-plan.json')
assert failed['results']==[dict(label='worker',exitCode=0),dict(label='helper',exitCode=1)]
for name,digest in plan['inputFiles'].items():
    assert sha(name)==digest,name
fix=json.loads((HERE/'source-plan.json').read_text())
assert sha(fix['input'])==fix['inputSha256'] and sha(fix['output'])==fix['outputSha256']
text=Path(fix['input']).read_text()
for anchor in fix['anchors']:
    assert text.count(anchor['before'])==anchor['count']
    text=text.replace(anchor['before'],anchor['after'])
assert text==Path(fix['output']).read_text()
OUT.mkdir(mode=0o700)
helper=list(plan['commands'][1])
old=next(value for value in helper if value.endswith('/AuxAccountMemoryHelper.mm'))
helper[helper.index(old)]=fix['output']
helper[helper.index('-o')+1]=str(OUT/'memory-helper.o')
helper[helper.index('-MF')+1]=str(OUT/'memory-helper.d')
link=list(plan['commands'][2])
old_object=next(value for value in link if value.endswith('/memory-helper.o'))
link[link.index(old_object)]=str(OUT/'memory-helper.o')
link[link.index('-o')+1]=str(OUT/'Aux Daemon')
assert '-no_adhoc_codesign' in link
inputs={value:sha(value) for command in [helper,link] for value in command if Path(value).is_file()}
inputs.update({fix['input']:fix['inputSha256'],fix['output']:fix['outputSha256']})
recipe=dict(previousPlanSha256=sha(PREVIOUS/'build-plan.json'),commands=[helper,link],
    inputFiles=inputs,retainedWorkerObject=next(value for value in link if value.endswith('/worker-host.o')),
    swiftSourceCount=50,productExecuted=False,productSigned=False)
(HERE/'build-plan.json').write_text(json.dumps(recipe,indent=2)+'\n')
results=[];start=time.monotonic()
for label,command in zip(['helper','link'],[helper,link]):
    with (OUT/(label+'.stdout')).open('wb') as stdout,(OUT/(label+'.stderr')).open('wb') as stderr:
        result=subprocess.run(command,cwd=ROOT,stdout=stdout,stderr=stderr)
    results.append(dict(label=label,exitCode=result.returncode))
    if result.returncode:break
receipt=dict(passed=len(results)==2 and all(row['exitCode']==0 for row in results),
    results=results,seconds=time.monotonic()-start,planSha256=sha(HERE/'build-plan.json'),
    swiftSourceCount=50,workerRecompiled=False,productExecuted=False,productSigned=False)
if receipt['passed']:
    binary=OUT/'Aux Daemon'
    probe=subprocess.run(['/usr/bin/otool','-l',str(binary)],check=True,capture_output=True).stdout
    assert b'LC_CODE_SIGNATURE' not in probe
    receipt.update(binary=str(binary),binarySha256=sha(binary),codeSignatureLoadCommandPresent=False)
for name,digest in inputs.items():assert sha(name)==digest,name
(HERE/'actual-build.json').write_text(json.dumps(receipt,indent=2)+'\n')
print(json.dumps(receipt))
raise SystemExit(0 if receipt['passed'] else 1)
