"""Freeze successful paired inputs, preserve A3, and link a full unsigned app."""
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[4]
ROOT = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
OUT = ROOT.parent / 'native-phase-full-20261024-a24'
sha = lambda path: hashlib.sha256(Path(path).read_bytes()).hexdigest()
composition_path = HERE / 'source-composition.json'
composition = json.loads(composition_path.read_text())
compiled = json.loads((HERE / 'actual-compile-a1.json').read_text())
assert compiled['passed'] and len(compiled['results']) == 3
assert compiled['sourceCompositionSha256'] == sha(composition_path)
assert json.loads((HERE.parent / 'native-recovery-integration-a22/actual-compile-a1.json').read_text())['passed']
assert json.loads((HERE.parent / 'native-completion-integration-a23/actual-compile-a1.json').read_text())['passed']
assert json.loads((HERE.parent / 'cli-unsigned-integration-a20/actual-link-a5.json').read_text())['passed']
for name, row in composition['selectedFiles'].items():
    assert sha(ROOT / name) == row['sha256'] == sha(row['path']), name
previous_path = ROOT.parent / 'unsigned-feature-completion-browser-build-20261024-a3b/receipt.json'
previous = json.loads(previous_path.read_text())
assert previous['passed'] and previous['allInspectedMachoUnsigned']
inventory = json.loads((previous_path.parent / 'app-inventory.json').read_text())
old_app = Path(previous['appPath'])
def verify(app):
    for row in inventory:
        path = app / row['path']
        if row['type'] == 'file':
            assert path.is_file() and not path.is_symlink() and sha(path) == row['sha256']
        else:
            assert path.is_symlink() and os.readlink(path) == row['target']
verify(old_app)
OUT.mkdir(mode=0o700)
backup = OUT / 'previous-native-a3/Aux.app'
backup.parent.mkdir()
shutil.copytree(old_app, backup, symlinks=True)
verify(backup)
pins = {'format': 'aux.feature-completion.full-native-input-pins.v1',
    'files': {name: row['sha256'] for name, row in composition['selectedFiles'].items()},
    'sourceCompositionSha256': sha(composition_path), 'authorityWireVersion': 6,
    'predecessorNativeReceipt': str(previous_path), 'predecessorNativeReceiptSha256': sha(previous_path),
    'preservedPredecessorApp': str(backup), 'coldFeatureEnabled': False}
pin_path = HERE / 'full-native-input-pins-a1.json'
assert not pin_path.exists()
pin_path.write_text(json.dumps(pins, indent=2) + '\n')
command = [sys.executable, str(REPO / 'docs/integration/proposed/browser-feature-expansion/integration/full-build.py'),
    '--snapshot', str(ROOT.parent), '--input-pins', str(pin_path), '--require-input-pins',
    '--build', '--jobs', '4', '--receipt-name', 'unsigned-feature-completion-browser-build-20261024-a24']
(HERE / 'full-build-command.json').write_text(json.dumps({'command': command,
    'inputPinsSha256': sha(pin_path), 'preservedPredecessorApp': str(backup),
    'productExecuted': False, 'productSigned': False}, indent=2) + '\n')
print(json.dumps({'nativeInputs': len(pins['files']), 'predecessorAppPreserved': str(backup),
    'fullUnsignedBuildStarting': True}), flush=True)
raise SystemExit(subprocess.call(command, cwd=REPO))
