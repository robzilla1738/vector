#!/usr/bin/env python3
"""Typecheck the paired existing daemon cohort with the finite host backend."""
from pathlib import Path
import hashlib
import json
import subprocess

HERE=Path(__file__).resolve().parent
REPO=HERE.parents[5]
plan=json.loads((REPO/'docs/integration/proposed/browser-feature-expansion/local-completion-package-a38/disposable-location-review-a4/daemon-build/awaited-storage-authority-a13/build-plan.json').read_text())
changes=json.loads((HERE/'changes.json').read_text())
for change in changes['files']:
    if change['input'] and hashlib.sha256(Path(change['input']).read_bytes()).hexdigest()!=change['before']:
        raise RuntimeError('Source changed: '+change['input'])
link=next(c for c in plan['commands'] if any(x.endswith('.swift') for x in c))
flags=[]
index=1
while index<len(link):
    item=link[index]
    if item in ['-o','-Xlinker']:index+=2;continue
    if item in ['-emit-executable','-parse-as-library','-static-stdlib']:
        index+=1;continue
    if item.endswith(('.o','.a','.dylib')):
        index+=1;continue
    if item.endswith('.swift'):
        replacement=HERE/'source/daemon'/Path(item).name
        flags.append(str(replacement) if replacement.exists() else item)
    else:flags.append(item)
    index+=1
flags.extend(['-typecheck',str(HERE/'source/daemon/AuxNativeHostJournal.swift')])
command=[link[0],*flags]
result=subprocess.run(command,cwd=REPO,capture_output=True,text=True)
(HERE/'swift-typecheck.txt').write_text(result.stdout+result.stderr)
(HERE/'syntax.json').write_text(json.dumps({'command':command,'exitCode':result.returncode,
    'nativeTreeChanged':False,'objectBuild':False},indent=2)+'\n')
print('Paired Swift typecheck:',result.returncode)
raise SystemExit(result.returncode)
