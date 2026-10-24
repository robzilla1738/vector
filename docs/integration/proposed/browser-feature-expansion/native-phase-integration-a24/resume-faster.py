"""Resume only the frozen owned build with measured compiler headroom."""
import hashlib
import json
from pathlib import Path
import subprocess
import sys

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[4]
ROOT = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
prior_path = ROOT.parent / 'unsigned-feature-completion-browser-build-20261024-a24/receipt.json'
prior = json.loads(prior_path.read_text())
assert prior['prepared'] and not prior['passed']
assert all(any(row['name'] == name and row['exitCode'] == 0 for row in prior['runs'])
           for name in ['gn', 'dryrun', 'commands'])
sha = lambda path: hashlib.sha256(Path(path).read_bytes()).hexdigest()
pins_path = HERE / 'full-native-input-pins-a1.json'
assert sha(pins_path) == prior['nativeInputPinsSha256']
for name, digest in json.loads(pins_path.read_text())['files'].items():
    assert sha(ROOT / name) == digest, name
command = [sys.executable, str(REPO / 'docs/integration/proposed/browser-feature-expansion/integration/full-build.py'),
    '--snapshot', str(ROOT.parent), '--input-pins', str(pins_path), '--require-input-pins',
    '--build', '--jobs', '12', '--receipt-name', 'unsigned-feature-completion-browser-build-20261024-a24-fast']
(HERE / 'full-build-command-faster.json').write_text(json.dumps({'command': command,
    'inputPinsSha256': sha(pins_path), 'priorInterruptedReceiptSha256': sha(prior_path),
    'sameSourceInputs': True, 'completedObjectsReused': True,
    'productExecuted': False, 'productSigned': False}, indent=2) + '\n')
raise SystemExit(subprocess.call(command, cwd=REPO))
