#!/usr/bin/env python3
"""Recompile only changed boundary actions, then use the original full builder."""
from pathlib import Path
import hashlib
import json
import re
import subprocess
import sys
import time
HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[4]
TREE = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
OLD = TREE.parent / 'unsigned-standard-profile-browser-focused-20261024-a8'
OUT = TREE.parent / 'unsigned-standard-profile-browser-focused-20261024-a9'
PIN = HERE / 'full-native-input-pins-a8.json'

def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()

old = json.loads((OLD / 'receipt.json').read_text())
assert old['passed'] is False and old['error'] == 'compile failed'
assert old['commandInventorySha256'] == sha(OLD / 'commands.log')
commands = (OLD / 'commands.log').read_bytes()
assert not re.search(rb'(^|[ /])(?:codesign|productsign|notarytool)(?:\s|$)', commands, re.M)
assert all(b'-no_adhoc_codesign' in line for line in commands.splitlines() if b'linker_driver.py' in line)
pins = json.loads(PIN.read_text())
result = {'format': 'aux.standard-browser-focused.actual.v4', 'passed': False,
    'source': str(TREE), 'targets': old['targets'], 'runs': [],
    'nativeInputPinsPath': str(PIN), 'nativeInputPinsSha256': sha(PIN),
    'previousReceiptPath': str(OLD / 'receipt.json'), 'previousReceiptSha256': sha(OLD / 'receipt.json'),
    'reusedCommandInventorySha256': sha(OLD / 'commands.log'),
    'reviewedBuildGraphSha256': sha(TREE / 'out/AuxFast/build.ninja'),
    'appExecuted': False, 'productSigned': False, 'fullBrowserBuilt': False}

def verify():
    assert sha(PIN) == result['nativeInputPinsSha256']
    for name, expected in pins['files'].items():
        assert sha(TREE / name) == expected, name
    assert sha(TREE / 'out/AuxFast/build.ninja') == result['reviewedBuildGraphSha256']

assert not OUT.exists()
verify()
OUT.mkdir()
try:
    command = [str(TREE / 'third_party/ninja/ninja'), '-C', str(TREE / 'out/AuxFast'), '-j8', *old['targets']]
    start = time.monotonic()
    with (OUT / 'compile.log').open('xb') as log:
        completed = subprocess.run(command, cwd=TREE, stdout=log, stderr=subprocess.STDOUT)
    result['runs'].append({'name': 'compile', 'command': command, 'exitCode': completed.returncode,
                          'seconds': time.monotonic() - start})
    assert completed.returncode == 0, 'compile failed'
    verify()
    result.update(passed=True, objects={name: sha(TREE / 'out/AuxFast' / name) for name in old['targets']})
except Exception as error:
    result['error'] = str(error)
finally:
    with (OUT / 'receipt.json').open('x') as stream:
        stream.write(json.dumps(result, indent=2) + '\n')
print(json.dumps({key: result.get(key) for key in ['passed', 'error', 'fullBrowserBuilt']}), flush=True)
if not result['passed']:
    raise SystemExit(1)
raise SystemExit(subprocess.call([sys.executable,
    str(ROOT / 'docs/integration/proposed/browser-feature-expansion/integration/full-build.py'),
    '--snapshot', str(TREE.parent), '--input-pins', str(PIN), '--require-input-pins',
    '--build', '--jobs', '8', '--receipt-name', 'unsigned-standard-profile-browser-build-20261024-a8'], cwd=ROOT))
