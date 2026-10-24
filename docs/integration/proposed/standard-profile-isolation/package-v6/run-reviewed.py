#!/usr/bin/env python3
"""Execute the fixed inactive package recipe after the serialized native build."""
from pathlib import Path
import hashlib
import json
import subprocess
import time

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[4]


def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


commands_path = HERE / 'commands.json'
commands = json.loads(commands_path.read_text())
order = ['freezeReview', 'checkInputs', 'bindPair', 'prepareBase',
         'prepareFeature', 'verify', 'assemble']
assert commands['order'] == order
receipt_path = HERE / 'actual-run-a1.json'
assert not receipt_path.exists() and not (HERE / 'prepared').exists()
assert all(not (HERE / name).exists() for name in [
    'review.json', 'standard-review.json', 'runtime-helper-overlay.json', 'source-pair-final.json'])
(HERE / 'prepared').mkdir()
record = {
    'format': 'aux.standard-profile-package.execution.v1',
    'commandsSha256': sha(commands_path), 'runnerSha256': sha(__file__),
    'passed': False, 'runs': [], 'appExecuted': False,
    'productSigned': False, 'runtimeAuthorityGranted': False,
    'acceptedAppReplaced': False, 'testable': False}
try:
    for name in order:
        command = commands[name]
        assert len(command) >= 2 and Path(command[1]).parent == HERE
        assert sha(commands_path) == record['commandsSha256']
        started = time.monotonic()
        with (HERE / (name + '-a1.log')).open('xb') as output:
            result = subprocess.run(command, cwd=ROOT, stdout=output, stderr=subprocess.STDOUT)
        record['runs'].append({'name': name, 'command': command,
                               'exitCode': result.returncode, 'seconds': time.monotonic() - started})
        receipt_path.write_text(json.dumps(record, indent=2) + '\n')
        print(name + ': ' + str(result.returncode), flush=True)
        if result.returncode:
            raise RuntimeError('Reviewed package phase failed: ' + name)
    review = json.loads((HERE / 'review.json').read_text())
    app = Path(review['expectedApp'])
    final_receipt = app.parent / 'receipt.json'
    value = json.loads(final_receipt.read_text())
    assert value['passed'] is True
    for name in ['testable', 'runtimeAuthorityGranted', 'appExecuted', 'productSigned', 'acceptedAppReplaced']:
        assert value[name] is False, name
    record.update(passed=True, app=str(app), finalReceipt=str(final_receipt),
                  finalReceiptSha256=sha(final_receipt))
except Exception as error:
    record['error'] = str(error)
finally:
    receipt_path.write_text(json.dumps(record, indent=2) + '\n')
if not record['passed']:
    raise SystemExit(1)
