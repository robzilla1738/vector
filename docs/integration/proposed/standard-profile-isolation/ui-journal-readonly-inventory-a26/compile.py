"""Compile/link the complete real native daemon with one journal source successor."""
import hashlib
import json
from pathlib import Path
import subprocess

HERE = Path(__file__).resolve().parent
OUT = Path('/private/tmp/aux-ui-journal-inventory-daemon-link-20261024-a26')
OUT.mkdir(mode=0o700)
sha = lambda p: hashlib.sha256(Path(p).read_bytes()).hexdigest()
prior_path = HERE / 'daemon-link-inputs.json'
prior_receipt = HERE.parent / 'ui-transaction-record-journal-a1/actual-daemon-link-a3.json'
prior = json.loads(prior_path.read_text())
assert json.loads(prior_receipt.read_text())['passed']
plan = json.loads((HERE / 'source-plan.json').read_text())
row = plan['files'][0]
assert sha(row['inputSource']) == row['inputSha256']
canonical = str(HERE / 'source' / row['path'])
assert sha(canonical) == row['outputSha256'] == sha(row['source'])
args = list(prior['command'])
assert args.count(row['source']) == 1
args[args.index(row['source'])] = canonical
args[args.index('-o') + 1] = str(OUT / 'Aux Daemon')
args[args.index('-module-cache-path') + 1] = str(OUT / 'module-cache')
assert '-no_adhoc_codesign' in args
assert sum(arg.endswith('.swift') for arg in args) == 48
assert sum(arg.endswith('.o') for arg in args) == 14
frozen = {}
for name, expected in prior['frozenFiles'].items():
    assert sha(name) == expected, name
for arg in args:
    if Path(arg).is_file(): frozen[arg] = sha(arg)
inputs = {'format': 'aux.ui-transaction-record-journal.daemon-inputs.v1',
          'predecessorManifest': str(prior_path), 'predecessorManifestSha256': sha(prior_path),
          'sourcePlanSha256': sha(HERE / 'source-plan.json'), 'command': args,
          'frozenFiles': frozen, 'swiftSourceCount': 48, 'nativeObjectCount': 14,
          'productSigned': False, 'productExecuted': False}
(HERE / 'actual-daemon-link-inputs-a1.json').write_text(json.dumps(inputs, indent=2) + '\n')
run = subprocess.run(args, capture_output=True)
(OUT / 'stdout').write_bytes(run.stdout)
(OUT / 'stderr').write_bytes(run.stderr)
receipt = {'format': 'aux.ui-transaction-record-journal.daemon-link.actual.v1',
           'passed': not run.returncode, 'exitCode': run.returncode,
           'inputManifestSha256': sha(HERE / 'actual-daemon-link-inputs-a1.json'), 'output': str(OUT),
           'productSigned': False, 'productExecuted': False, 'nativeApiExecuted': False,
           'migrationActivationAuthorized': False, 'runtimeAcceptance': False}
if not run.returncode:
    binary = OUT / 'Aux Daemon'
    load = subprocess.run(['/usr/bin/otool', '-l', str(binary)], check=True, capture_output=True).stdout
    (OUT / 'load-commands').write_bytes(load)
    assert b'LC_CODE_SIGNATURE' not in load
    symbols = subprocess.run(['/usr/bin/nm', '-a', str(binary)], check=True, capture_output=True).stdout
    required = b'_AuxBeginPreparedUiCapture'
    definitions=[l.split() for l in symbols.splitlines() if l.split()[-1:] == [required]]
    assert len(definitions)==1 and definitions[0][-2]==b't'
    exports=subprocess.run(['/usr/bin/nm','-gU',str(binary)],check=True,capture_output=True).stdout
    undefined=subprocess.run(['/usr/bin/nm','-u',str(binary)],check=True,capture_output=True).stdout
    assert required not in exports and required not in undefined
    receipt.update(binarySha256=sha(binary), codeSignatureLoadCommandPresent=False,
                   captureEntryDefinitionCount=1)
for name, expected in frozen.items(): assert sha(name) == expected, name
(HERE / 'actual-daemon-link-a1.json').write_text(json.dumps(receipt, indent=2) + '\n')
print(json.dumps(receipt), flush=True)
if run.returncode:
    print('\n'.join(l for l in run.stderr.decode(errors='replace').splitlines()
                    if 'error:' in l or 'note:' in l)[:6000], flush=True)
    raise SystemExit(run.returncode)
