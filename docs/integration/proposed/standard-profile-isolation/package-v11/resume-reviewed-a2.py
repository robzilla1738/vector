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


commands_path = HERE / 'commands-a2.json'
commands = json.loads(commands_path.read_text())
order = ['prepareFeature', 'verify', 'assemble']
previous_path = HERE / 'actual-run-a1.json'
previous = json.loads(previous_path.read_text())
assert previous['passed'] is False and previous['error'] == 'Reviewed package phase failed: prepareFeature'
assert [(x['name'],x['exitCode']) for x in previous['runs']] == [('freezeReview',0),('checkInputs',0),('bindPair',0),('prepareBase',0),('prepareFeature',1)]
original_commands = json.loads((HERE/'commands.json').read_text())
assert sha(HERE/'commands.json') == previous['commandsSha256']
expected_commands = json.loads(json.dumps(original_commands))
index = expected_commands['prepareFeature'].index('--daemon-inputs')+1
old_path = Path(expected_commands['prepareFeature'][index])
new_path = Path('/private/tmp/aux-daemon-crash-registration-close-check/daemon-inputs.json')
assert old_path.read_bytes() == new_path.read_bytes()
expected_commands['prepareFeature'][index] = str(new_path)
assert commands == expected_commands
receipt_path = HERE / 'actual-run-a2.json'
assert not receipt_path.exists() and not (HERE/'prepared/feature-recipe.json').exists()
assert not (ROOT/'out/provided-candidate-standard-profile-finish-20261024').exists()
record = {
    'format': 'aux.standard-profile-package.execution.v1',
    'commandsSha256': sha(commands_path), 'runnerSha256': sha(__file__),
    'previousExecution': str(previous_path), 'previousExecutionSha256': sha(previous_path),
    'passed': False, 'runs': [], 'appExecuted': False,
    'productSigned': False, 'runtimeAuthorityGranted': False,
    'acceptedAppReplaced': False, 'testable': False}
try:
    for name in order:
        command = commands[name]
        assert len(command) >= 2 and Path(command[1]).parent == HERE
        assert sha(commands_path) == record['commandsSha256']
        started = time.monotonic()
        with (HERE / (name + '-a2.log')).open('xb') as output:
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
