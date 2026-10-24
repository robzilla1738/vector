"""Preserve the a8 build, project only reviewed files, and build unsigned once."""
import hashlib
import json
import os
import shutil
import stat
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[4]
ROOT = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
OUT = ROOT.parent / 'feature-completion-native-projection-20261024-a1'
OUT.mkdir(mode=0o700)
sha = lambda path: hashlib.sha256(Path(path).read_bytes()).hexdigest()
composition_path = HERE / 'source-composition.json'
composition = json.loads(composition_path.read_text())
compile_receipt = json.loads((HERE / 'actual-compile-a2.json').read_text())
assert compile_receipt['passed'] and len(compile_receipt['results']) == 13
assert compile_receipt['sourceCompositionSha256'] == sha(composition_path)
prior = json.loads(Path(composition['priorComposition']).read_text())
base = json.loads(Path(prior['basePins']).read_text())
for name, expected in base['files'].items():
    assert sha(ROOT / name) == expected
originals = {}
for layer in prior['layers']:
    for row in layer['files']:
        originals.setdefault(row['path'], row['inputSha256'])
for manifest in composition['laneManifests']:
    assert sha(manifest['path']) == manifest['sha256']
    for row in json.loads(Path(manifest['path']).read_text())['files']:
        assert row['path'] not in originals
        originals[row['path']] = row['inputSha256']
assert len(originals) == 63
for name, expected in originals.items():
    path = ROOT / name
    assert (sha(path) if path.exists() else None) == expected, name
    assert not path.is_symlink()
for name, row in composition['selectedFiles'].items():
    assert sha(row['path']) == row['sha256']

# Preserve the entire successful native app before its build directory changes.
previous_receipt = ROOT.parent / 'unsigned-standard-profile-browser-build-20261024-a8/receipt.json'
previous = json.loads(previous_receipt.read_text())
assert previous['passed'] and previous['allInspectedMachoUnsigned']
inventory = json.loads((previous_receipt.parent / 'app-inventory.json').read_text())
old_app = Path(previous['appPath'])
for row in inventory:
    path = old_app / row['path']
    if row['type'] == 'file':
        assert path.is_file() and not path.is_symlink() and sha(path) == row['sha256']
    else:
        assert path.is_symlink() and os.readlink(path) == row['target']
backup = OUT / 'previous-native-a8/Aux.app'
backup.parent.mkdir()
shutil.copytree(old_app, backup, symlinks=True)
for row in inventory:
    path = backup / row['path']
    if row['type'] == 'file':
        assert sha(path) == row['sha256']
    else:
        assert path.is_symlink() and os.readlink(path) == row['target']
source_backup = OUT / 'before'
for name, expected in originals.items():
    if expected is not None:
        target = source_backup / name
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(ROOT / name, target)
        assert sha(target) == expected
record = {'format': 'aux.feature-completion.native-projection.actual.v1', 'passed': False,
          'sourceCompositionSha256': sha(composition_path),
          'predecessorNativeReceipt': str(previous_receipt),
          'predecessorNativeReceiptSha256': sha(previous_receipt),
          'preservedNativeApp': str(backup), 'preservedNativeAppLeafCount': len(inventory),
          'originalInputs': originals, 'projected': [], 'sourceBackup': str(source_backup),
          'ownerChangesReset': False, 'acceptedAppChanged': False,
          'productExecuted': False, 'productSigned': False}
receipt_path = HERE / 'actual-native-projection-a1.json'
try:
    for name, expected in originals.items():
        destination = ROOT / name
        assert (sha(destination) if destination.exists() else None) == expected, name
        source = Path(composition['selectedFiles'][name]['path'])
        assert sha(source) == composition['selectedFiles'][name]['sha256']
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, destination)
        assert stat.S_ISREG(destination.lstat().st_mode)
        assert sha(destination) == composition['selectedFiles'][name]['sha256']
        record['projected'].append(name)
        receipt_path.write_text(json.dumps(record, indent=2) + '\n')
    for name, row in composition['selectedFiles'].items():
        assert sha(ROOT / name) == row['sha256'], name
    pins = {'format': 'aux.feature-completion.full-native-input-pins.v1',
            'files': {name: row['sha256'] for name, row in composition['selectedFiles'].items()},
            'sourceCompositionSha256': sha(composition_path), 'authorityWireVersion': 6,
            'predecessorNativeReceipt': str(previous_receipt),
            'predecessorNativeReceiptSha256': sha(previous_receipt)}
    pin_path = HERE / 'full-native-input-pins-a1.json'
    pin_path.write_text(json.dumps(pins, indent=2) + '\n')
    record.update(passed=True, nativeInputPins=str(pin_path), nativeInputPinsSha256=sha(pin_path))
except Exception as error:
    record['error'] = str(error)
    raise
finally:
    receipt_path.write_text(json.dumps(record, indent=2) + '\n')
print(json.dumps({'projectionPassed': True, 'files': len(record['projected']),
                  'previousNativeAppPreserved': str(backup)}), flush=True)
command = [sys.executable, str(REPO / 'docs/integration/proposed/browser-feature-expansion/integration/full-build.py'),
           '--snapshot', str(ROOT.parent), '--input-pins', str(pin_path), '--require-input-pins',
           '--build', '--jobs', '4', '--receipt-name', 'unsigned-feature-completion-browser-build-20261024-a1']
(HERE / 'full-build-command.json').write_text(json.dumps({'command': command,
    'inputPinsSha256': sha(pin_path), 'projectionReceiptSha256': sha(receipt_path),
    'productExecuted': False, 'productSigned': False}, indent=2) + '\n')
raise SystemExit(subprocess.call(command, cwd=REPO))
