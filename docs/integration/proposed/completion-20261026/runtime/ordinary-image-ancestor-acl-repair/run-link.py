#!/usr/bin/env python3
"""Root-owned one-command Swift link; invoke through scripts/native-build.py."""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess
import time

parser=argparse.ArgumentParser()
mode=parser.add_mutually_exclusive_group(required=True)
mode.add_argument('--check-inputs-only',action='store_true')
mode.add_argument('--execute',action='store_true')
args=parser.parse_args()
recipe_path=Path(__file__).with_name('daemon-link-recipe.json').resolve()
recipe_bytes=recipe_path.read_bytes()
recipe=json.loads(recipe_bytes)

def digest(path):
    h=hashlib.sha256()
    with Path(path).open('rb') as source:
        while data:=source.read(4*1024*1024):h.update(data)
    return h.hexdigest()

def verify():
    for path,expected in recipe['inputHashes'].items():
        if digest(path)!=expected:raise RuntimeError('Input pin changed: '+path)
    command=recipe['commands'][0]
    if len(recipe['commands'])!=1 or len([x for x in command if x.endswith('.swift')])!=54:
        raise RuntimeError('Expected exactly one final 54-source Swift link.')
    return recipe['inputHashes']

before=verify()
if args.check_inputs_only:
    print(json.dumps({'inputPins':'pass','count':len(before),'commands':1,'SwiftSources':54}))
    raise SystemExit(0)
output=Path(recipe['output'])
if output.exists():raise SystemExit('Refusing existing output: '+str(output))
output.mkdir(parents=True)
receipt={'format':'aux.ordinary-image-ancestor-acl.daemon-link-result.v1',
         'recipe':str(recipe_path),'recipeSha256':hashlib.sha256(recipe_bytes).hexdigest(),
         'beforeInputHashes':before,'workerOrComputerUseRecompiled':False,
         'productSigned':False,'productExecuted':False,'candidateChanged':False,'commands':[]}
try:
    started=time.monotonic()
    log=output/'swift-link.log'
    with log.open('wb') as stream:
        result=subprocess.run(recipe['commands'][0],cwd='/Users/rcourson/Documents/Vibe/web',stdout=stream,stderr=subprocess.STDOUT)
    receipt['commands'].append({'argv':recipe['commands'][0],'exitCode':result.returncode,
         'elapsedSeconds':time.monotonic()-started,'log':str(log)})
    if result.returncode:raise RuntimeError('Final Swift link failed; retained log.')
    receipt['afterInputHashes']=verify()
    receipt['outputs']={str(output/'Aux Daemon'):digest(output/'Aux Daemon')}
    receipt['result']='pass'
except Exception as error:
    receipt['result']='failed'
    receipt['error']=str(error)
    raise
finally:
    (output/'build-receipt.json').write_text(json.dumps(receipt,indent=2)+'\n')
