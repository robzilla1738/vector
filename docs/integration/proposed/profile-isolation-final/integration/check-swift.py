#!/usr/bin/env python3
"""Check one pinned actual whole-module graph without executing its code."""
import hashlib
import json
import subprocess
import sys
from pathlib import Path

plan_path, output = Path(sys.argv[1]).resolve(), Path(sys.argv[2]).resolve()
plan = json.loads(plan_path.read_text())
def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()
def verify():
    for path, digest in plan['frozenFiles'].items():
        if sha(path) != digest:
            raise ValueError('Source changed: ' + path)
verify()
output.mkdir(mode=0o700)
assert '-frontend' in plan['command'] and '-typecheck' in plan['command']
result = {'format': 'aux.profile-final.swift-check.v1', 'passed': False,
          'command': plan['command'], 'frozenFiles': plan['frozenFiles'],
          'sourceCount': plan['count'], 'executed': False, 'signed': False}
with (output / 'check.log').open('w') as log:
    run = subprocess.run(plan['command'], stdout=log, stderr=subprocess.STDOUT)
result['exitCode'] = run.returncode
try:
    verify()
    result['inputsUnchanged'] = True
    result['passed'] = run.returncode == 0
except Exception as error:
    result['error'] = str(error)
result['logSha256'] = sha(output / 'check.log')
(output / 'results.json').write_text(json.dumps(result, indent=2) + '\n')
print('PASS' if result['passed'] else 'FAIL', plan['count'], 'actual Swift sources; no execution')
raise SystemExit(0 if result['passed'] else 1)
