"""Compile/link the complete real native daemon with one journal source successor."""
import hashlib
import json
from pathlib import Path
import subprocess

HERE = Path(__file__).resolve().parent
OUT = Path('/private/tmp/aux-ui-transaction-record-daemon-link-20261024-a2')
OUT.mkdir(mode=0o700)
sha = lambda p: hashlib.sha256(Path(p).read_bytes()).hexdigest()
prior_path = HERE.parent / 'ui-native-capture-transport-a1/daemon-link-inputs.json'
prior_receipt = HERE.parent / 'ui-native-capture-transport-a1/actual-daemon-link-a3.json'
prior = json.loads(prior_path.read_text())
assert json.loads(prior_receipt.read_text())['passed']
plan = json.loads((HERE / 'source-plan-a2.json').read_text())
row = plan['files'][0]
assert sha(row['input']) == row['inputSha256']
assert sha(row['output']) == row['outputSha256']
args = list(prior['command'])
assert args.count(row['input']) == 1
args[args.index(row['input'])] = row['output']
args[args.index('-o') + 1] = str(OUT / 'Aux Daemon')
args[args.index('-module-cache-path') + 1] = str(OUT / 'module-cache')
assert '-no_adhoc_codesign' in args
assert sum(arg.endswith('.swift') for arg in args) == 48
assert sum(arg.endswith('.o') for arg in args) == 14
frozen = {}
for name, expected in prior['frozenCommandFiles'].items():
    assert sha(name) == expected, name
for arg in args:
    if Path(arg).is_file(): frozen[arg] = sha(arg)
inputs = {'format': 'aux.ui-transaction-record-journal.daemon-inputs.v1',
          'predecessorManifest': str(prior_path), 'predecessorManifestSha256': sha(prior_path),
          'sourcePlanSha256': sha(HERE / 'source-plan-a2.json'), 'command': args,
          'frozenFiles': frozen, 'swiftSourceCount': 48, 'nativeObjectCount': 14,
          'productSigned': False, 'productExecuted': False}
(HERE / 'daemon-link-inputs-a2.json').write_text(json.dumps(inputs, indent=2) + '\n')
run = subprocess.run(args, capture_output=True)
(OUT / 'stdout').write_bytes(run.stdout)
(OUT / 'stderr').write_bytes(run.stderr)
receipt = {'format': 'aux.ui-transaction-record-journal.daemon-link.actual.v1',
           'passed': not run.returncode, 'exitCode': run.returncode,
           'inputManifestSha256': sha(HERE / 'daemon-link-inputs-a2.json'), 'output': str(OUT),
           'productSigned': False, 'productExecuted': False, 'nativeApiExecuted': False,
           'migrationActivationAuthorized': False, 'runtimeAcceptance': False}
if not run.returncode:
    binary = OUT / 'Aux Daemon'
    load = subprocess.run(['/usr/bin/otool', '-l', str(binary)], check=True, capture_output=True).stdout
    (OUT / 'load-commands').write_bytes(load)
    assert b'LC_CODE_SIGNATURE' not in load
    symbols = subprocess.run(['/usr/bin/nm', '-gU', str(binary)], check=True, capture_output=True).stdout
    required = b'_AuxBeginPreparedUiCapture'
    assert len([l for l in symbols.splitlines() if l.split()[-1:] == [required]]) == 1
    receipt.update(binarySha256=sha(binary), codeSignatureLoadCommandPresent=False,
                   captureEntryDefinitionCount=1)
for name, expected in frozen.items(): assert sha(name) == expected, name
(HERE / 'actual-daemon-link-a2.json').write_text(json.dumps(receipt, indent=2) + '\n')
print(json.dumps(receipt), flush=True)
if run.returncode:
    print('\n'.join(l for l in run.stderr.decode(errors='replace').splitlines()
                    if 'error:' in l or 'note:' in l)[:6000], flush=True)
    raise SystemExit(run.returncode)
