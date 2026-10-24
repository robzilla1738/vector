#!/usr/bin/env python3
"""Compile the same changed units after byte-safe command inventory validation."""
from pathlib import Path
import hashlib
import json
import re
import subprocess
import time

HERE = Path(__file__).resolve().parent
TREE = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
OLD = TREE.parent / 'unsigned-standard-profile-browser-focused-20261024-a6'
OUT = TREE.parent / 'unsigned-standard-profile-browser-focused-20261024-a7'
assert not OUT.exists()


def sha(path):
    with Path(path).open('rb') as stream:
        return hashlib.file_digest(stream, 'sha256').hexdigest()


old = json.loads((OLD / 'receipt.json').read_text())
assert old['passed'] is False and 'utf-8' in old['error']
assert len(old['runs']) == 1 and old['runs'][0]['name'] == 'commands' and old['runs'][0]['exitCode'] == 0
# Ninja shell-escapes individual non-ASCII package-description bytes. Such a
# command inventory need not itself be UTF-8. Validate executable ASCII tokens
# directly; do not decode with ignored/replaced bytes or weaken the check.
raw_commands = (OLD / 'commands.log').read_bytes()
assert not re.search(rb'(^|[ /])(?:codesign|productsign|notarytool)(?:\s|$)', raw_commands, re.M)
pin_path = Path(old['nativeInputPinsPath'])
pins = json.loads(pin_path.read_text())
assert sha(pin_path) == old['nativeInputPinsSha256']


def verify():
    assert sha(pin_path) == old['nativeInputPinsSha256']
    for name, value in pins['files'].items():
        assert sha(TREE / name) == value, name


verify()
OUT.mkdir()
command = [str(TREE / 'third_party/ninja/ninja'), '-C', str(TREE / 'out/AuxFast'),
           '-j8', *old['targets']]
result = {'format': 'aux.standard-browser-focused.actual.v2', 'passed': False,
          'source': str(TREE), 'targets': old['targets'],
          'previousReceipt': str(OLD / 'receipt.json'), 'previousReceiptSha256': sha(OLD / 'receipt.json'),
          'commandInventorySha256': sha(OLD / 'commands.log'),
          'nativeInputPinsPath': str(pin_path), 'nativeInputPinsSha256': sha(pin_path),
          'appExecuted': False, 'productSigned': False, 'fullBrowserBuilt': False,
          'command': command}
try:
    start = time.monotonic()
    with (OUT / 'compile.log').open('x') as log:
        completed = subprocess.run(command, cwd=TREE, stdout=log, stderr=subprocess.STDOUT)
    result.update(exitCode=completed.returncode, seconds=time.monotonic() - start)
    assert completed.returncode == 0, 'Focused compilation failed'
    verify()
    result.update(passed=True, objects={name: sha(TREE / 'out/AuxFast' / name) for name in old['targets']})
except Exception as error:
    result['error'] = str(error)
finally:
    (OUT / 'receipt.json').write_text(json.dumps(result, indent=2) + '\n')
print(json.dumps({k: result.get(k) for k in ['passed', 'error', 'fullBrowserBuilt']}))
raise SystemExit(0 if result['passed'] else 1)
