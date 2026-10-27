#!/usr/bin/env python3
"""Run this frozen local daemon recipe only inside scripts/native-build.py."""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess
import time

parser=argparse.ArgumentParser()
parser.add_argument('--check-inputs-only',action='store_true')
args=parser.parse_args()
recipe_path=Path(__file__).with_name('daemon-recipe.json').resolve()
recipe_bytes=recipe_path.read_bytes()
recipe=json.loads(recipe_bytes)

def digest(path):
    h=hashlib.sha256()
    with Path(path).open('rb') as source:
        while data:=source.read(4*1024*1024):h.update(data)
    return h.hexdigest()

def verify():
    pins={}
    for group in ('sourceInputHashes','headerAndIncludePins','retainedObjectAndLibraryHashes','closureInputHashes'):
        for path,expected in recipe.get(group,{}).items():
            if path in pins and pins[path]!=expected:raise RuntimeError('Conflicting input pin: '+path)
            pins[path]=expected
    mismatches=[]
    for path,expected in pins.items():
        actual=digest(path)
        if actual!=expected:mismatches.append({'path':path,'expected':expected,'actual':actual})
    if mismatches:raise RuntimeError(json.dumps({'inputPinMismatches':mismatches}))
    return pins

before=verify()
if args.check_inputs_only:
    print(json.dumps({'inputPins':'pass','count':len(before),'recipeSha256':hashlib.sha256(recipe_bytes).hexdigest()}))
    raise SystemExit(0)
output=Path(recipe['output'])
if output.exists():raise SystemExit('Refusing an existing build directory: '+str(output))
output.mkdir(parents=True)
receipt={'format':'aux.final-daemon-build-receipt.v1','recipe':str(recipe_path),
         'recipeSha256':hashlib.sha256(recipe_bytes).hexdigest(),'beforeInputHashes':before,
         'productSigned':False,'productExecuted':False,'commands':[]}
try:
    for index,command in enumerate(recipe['commands']):
        start=time.monotonic()
        with (output/f'command-{index}.log').open('wb') as log:
            result=subprocess.run(command,cwd='/Users/rcourson/Documents/Vibe/web',stdout=log,stderr=subprocess.STDOUT)
        receipt['commands'].append({'argv':command,'exitCode':result.returncode,'elapsedSeconds':time.monotonic()-start,'log':str(output/f'command-{index}.log')})
        if result.returncode:raise RuntimeError('Build command failed: '+str(index))
    receipt['afterInputHashes']=verify()
    receipt['outputs']={str(path):digest(path) for path in output.iterdir() if path.is_file() and (path.suffix in ('.o','.d') or path.name=='Aux Daemon')}
    receipt['result']='pass'
except Exception as error:
    receipt['result']='failed'
    receipt['error']=str(error)
    raise
finally:
    (output/'build-receipt.json').write_text(json.dumps(receipt,indent=2)+'\n')
