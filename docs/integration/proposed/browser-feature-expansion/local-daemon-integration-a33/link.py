"""Link the actual v9/startup/account-owner Swift cohort with retained Node objects.

The new memory process factory is not selected by this intermediate daemon.
Run under scripts/native-build.py; no signing or product execution.
"""
from pathlib import Path
import hashlib
import json
import subprocess
import time

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[4]
sha = lambda p: hashlib.sha256(Path(p).read_bytes()).hexdigest()
plan = json.loads((HERE/'typecheck-plan.json').read_text())
base = json.loads(Path(plan['actualBaseReceipt']).read_text())
check = json.loads((HERE/'actual-typecheck.json').read_text())
if not check['passed'] or check['planSha256'] != sha(HERE/'typecheck-plan.json'):
    raise ValueError('Current whole-source typecheck required')
if not base['passed'] or sha(plan['actualBaseReceipt']) != plan['actualBaseLinkReceiptSha256']:
    raise ValueError('Actual base link changed')
for path, digest in base['inputFiles'].items():
    if sha(path) != digest:
        raise ValueError('Retained base input changed: '+path)
for path, digest in plan['sourcePins'].items():
    if sha(path) != digest:
        raise ValueError('Current Swift input changed: '+path)

selected = {Path(path).name:path for path in plan['sourcePins']}
command = list(base['results'][-1]['command'])
original = {Path(path).name for path in command if path.endswith('.swift')}
for i, path in enumerate(command):
    if path.endswith('.swift'):
        command[i] = selected[Path(path).name]
command += [path for name, path in selected.items() if name not in original]
out = Path('/private/tmp/aux-browser-only-daemon-build-20261025-a60')
out.mkdir(mode=0o700)
binary = out/'Aux Daemon'
command[command.index('-o')+1] = str(binary)
if not any(value == '-no_adhoc_codesign' for value in command):
    raise ValueError('Explicit unsigned link required')
inputs = {value:sha(value) for value in command if Path(value).is_file()}
start = time.monotonic()
with (out/'link.stdout').open('wb') as stdout, (out/'link.stderr').open('wb') as stderr:
    result = subprocess.run(command, cwd=ROOT, stdout=stdout, stderr=stderr)
receipt = dict(passed=result.returncode == 0, exitCode=result.returncode,
    command=command, inputFiles=inputs, seconds=time.monotonic()-start,
    swiftSourceCount=len(selected), productExecuted=False, productSigned=False,
    memoryFactoryEnabled=False, priorFullTypecheck=sha(HERE/'actual-typecheck.json'))
if receipt['passed']:
    load = subprocess.run(['/usr/bin/otool', '-l', str(binary)], check=True, capture_output=True).stdout
    if b'LC_CODE_SIGNATURE' in load:
        raise ValueError('Product unexpectedly signed')
    receipt.update(binary=str(binary), binarySha256=sha(binary), codeSignatureLoadCommandPresent=False)
for path, digest in inputs.items():
    if sha(path) != digest:
        raise ValueError('Input changed during link: '+path)
(HERE/'actual-link.json').write_text(json.dumps(receipt, indent=2)+'\n')
print(json.dumps({k:v for k,v in receipt.items() if k not in ['command','inputFiles']}))
raise SystemExit(result.returncode)
