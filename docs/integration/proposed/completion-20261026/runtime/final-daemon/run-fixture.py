#!/usr/bin/env python3
"""Data-only owner fixture after a successful frozen CPP/Swift build; no app runs."""
import hashlib,json,subprocess,time
from pathlib import Path
HERE=Path(__file__).resolve().parent
recipe=json.loads((HERE/'fixture-recipe.json').read_text())
def sha(path):return hashlib.sha256(Path(path).read_bytes()).hexdigest()
for path,expected in recipe['inputPins'].items():
    if sha(path)!=expected:raise SystemExit('Fixture input pin changed: '+path)
build=json.loads(Path(recipe['requiresBuildReceipt']).read_text())
if build.get('result')!='pass':raise SystemExit('Final CPP/Swift build has not passed')
for path,expected in build['outputs'].items():
    if Path(path).name=='Aux Daemon' and sha(path)!=expected:raise SystemExit('Final linked daemon bytes changed')
if build['recipeSha256']!=sha(HERE/'daemon-recipe.json'):raise SystemExit('Final build receipt belongs to another recipe')
output=Path(recipe['output'])
if output.exists():raise SystemExit('Refusing an existing fixture directory: '+str(output))
output.mkdir(parents=True)
receipt={'format':'aux.final-daemon-owner-fixture-receipt.v1','inputPins':recipe['inputPins'],
         'buildReceiptSha256':sha(recipe['requiresBuildReceipt']),'commands':[],
         'actualInstallationAdmission':False,'appOrAddonExecution':False,'credentialAccess':False}
try:
    for index,command in enumerate(recipe['commands']):
        start=time.monotonic()
        with (output/f'command-{index}.log').open('wb') as log:
            result=subprocess.run(command,cwd='/Users/rcourson/Documents/Vibe/web',stdout=log,stderr=subprocess.STDOUT)
        receipt['commands'].append({'argv':command,'exitCode':result.returncode,'elapsedSeconds':time.monotonic()-start})
        if result.returncode:raise RuntimeError('Fixture command failed: '+str(index))
    for path,expected in recipe['inputPins'].items():
        if sha(path)!=expected:raise RuntimeError('Fixture source changed during run: '+path)
    receipt['result']='pass'
except Exception as error:
    receipt['result']='failed';receipt['error']=str(error);raise
finally:
    receipt['outputs']={str(path):sha(path) for path in output.iterdir() if path.is_file()}
    (output/'fixture-receipt.json').write_text(json.dumps(receipt,indent=2)+'\n')
