#!/usr/bin/env python3
"""Finish only the fixed local inactive package after the serialized full build."""
from pathlib import Path
import hashlib
import json
import subprocess
import sys
import time
HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[4]
BUILD = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/unsigned-standard-profile-browser-build-20261024-a8')
OUTPUT = HERE / 'final-local-v9'

def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()

assert not OUTPUT.exists()
OUTPUT.mkdir()
result = {'format': 'aux.standard-profile-final-local.execution.v1', 'passed': False,
    'appExecuted': False, 'productSigned': False, 'runtimeAuthorityGranted': False,
    'acceptedAppReplaced': False, 'testable': False, 'runs': []}
try:
    native = json.loads((BUILD / 'receipt.json').read_text())
    assert native['passed'] is True and native['allInspectedMachoUnsigned'] is True, 'Complete unsigned browser required'
    assert native['nativeInputPinsSha256'] == sha(HERE / 'full-native-input-pins-a8.json')
    result.update(nativeReceipt=str(BUILD / 'receipt.json'), nativeReceiptSha256=sha(BUILD / 'receipt.json'))
    for label, command in [
        ('primary-bridge', [sys.executable, str(HERE / 'inspect-browser-a8.py')]),
        ('package', [sys.executable, str(HERE.parent / 'package-v9/run-reviewed.py')]),
    ]:
        started = time.monotonic()
        with (OUTPUT / (label + '.log')).open('xb') as stream:
            completed = subprocess.run(command, cwd=ROOT, stdout=stream, stderr=subprocess.STDOUT)
        result['runs'].append({'name': label, 'command': command, 'exitCode': completed.returncode,
                               'seconds': time.monotonic() - started})
        assert completed.returncode == 0, label + ' refused'
    final = ROOT / 'out/provided-candidate-standard-profile-finish-20261024/receipt.json'
    package = json.loads(final.read_text())
    assert package['passed'] is True
    for key in ['testable', 'runtimeAuthorityGranted', 'appExecuted', 'productSigned', 'acceptedAppReplaced']:
        assert package[key] is False, key
    result.update(passed=True, finalReceipt=str(final), finalReceiptSha256=sha(final))
except Exception as error:
    result['error'] = str(error)
finally:
    with (OUTPUT / 'receipt.json').open('x') as stream:
        stream.write(json.dumps(result, indent=2) + '\n')
print(json.dumps({key: result.get(key) for key in ['passed', 'error', 'finalReceiptSha256']}))
raise SystemExit(0 if result['passed'] else 1)
