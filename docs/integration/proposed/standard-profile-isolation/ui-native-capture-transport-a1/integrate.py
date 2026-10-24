"""Compose storage, routing and paired capture transport in an owned source tree."""
import hashlib
import json
import shutil
import subprocess
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[4]
ROOT = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
OUT = Path('/private/tmp/aux-ui-native-migration-integration-overlay-20261024-a1')
OUT.mkdir(mode=0o700)
TREE = OUT / 'tree'
TREE.mkdir()
sha = lambda path: hashlib.sha256(Path(path).read_bytes()).hexdigest()
base_path = HERE.parent / 'integration/full-native-input-pins-a8.json'
base = json.loads(base_path.read_text())
for name, expected in base['files'].items():
    assert sha(ROOT / name) == expected, name
layers = []
for name in ['ui-storage-durable-drain-a1', 'ui-extension-native-binding-a1']:
    path = HERE.parent / name / 'actual-series-integration-a1.json'
    record = json.loads(path.read_text())
    assert record['passed']
    patch = Path(record['patch'])
    assert sha(patch) == record['patchSha256']
    layers.append({'receipt': str(path), 'receiptSha256': sha(path), 'patch': str(patch),
                   'patchSha256': sha(patch), 'files': record['files'], 'include': []})
plan = json.loads((HERE / 'source-plan.json').read_text())
layers.append({'receipt': str(HERE / 'source-plan.json'), 'receiptSha256': sha(HERE / 'source-plan.json'),
               'patch': str(HERE / 'native.patch'), 'patchSha256': sha(HERE / 'native.patch'),
               'files': [{'path': row['path'], 'inputSha256': row['inputSha256'], 'outputSha256': row['outputSha256']}
                         for row in plan['files'] if row['path'].startswith('chrome/')],
               'include': ['--include=chrome/browser/aux/*']})
initial, final = {}, {}
for layer in layers:
    for row in layer['files']:
        name = row['path']
        if name in final:
            assert final[name] == row['inputSha256']
        else:
            initial[name] = row['inputSha256']
        final[name] = row['outputSha256']
assert len(final) == 44
for name, expected in initial.items():
    source, target = ROOT / name, TREE / name
    if expected is None:
        assert not source.exists()
    else:
        assert sha(source) == expected, name
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, target)
git = lambda *args: subprocess.run(['git', '-C', str(TREE), *args], check=True, capture_output=True)
git('init', '-q')
git('add', '--all')
for layer in layers:
    git('apply', '--check', *layer['include'], layer['patch'])
    git('apply', *layer['include'], layer['patch'])
    for row in layer['files']:
        assert sha(TREE / row['path']) == row['outputSha256']
git('apply', '--reverse', '--check', *layers[-1]['include'], layers[-1]['patch'])
for name, expected in final.items():
    assert sha(TREE / name) == expected
for name, expected in initial.items():
    assert (sha(ROOT / name) if (ROOT / name).exists() else None) == expected
for name, expected in base['files'].items():
    assert sha(ROOT / name) == expected
selected = {name: {'path': str(ROOT / name), 'sha256': expected, 'changed': False}
            for name, expected in base['files'].items()}
for name, expected in final.items():
    selected[name] = {'path': str(TREE / name), 'sha256': expected, 'changed': True}
receipt = {'format': 'aux.ui-native-migration.source-composition.actual.v1', 'passed': True,
           'basePins': str(base_path), 'basePinsSha256': sha(base_path),
           'baseInputCount': len(base['files']), 'changedFileCount': len(final),
           'selectedFileCount': len(selected), 'selectedFiles': selected, 'layers': layers,
           'overlay': str(TREE), 'exactReplayPassed': True, 'transportReverseCheckPassed': True,
           'authorityWireVersion': 6, 'requiresPairedWireVersion6Daemon': True,
           'oldWireVersion5DaemonCompatible': False,
           'nativeCheckoutChanged': False, 'browserFullyBuilt': False,
           'packageIntegrated': False, 'productExecuted': False,
           'profileImporterComplete': False, 'migrationActivationAuthorized': False,
           'runtimeAcceptance': False}
(HERE / 'actual-native-source-composition-a1.json').write_text(json.dumps(receipt, indent=2) + '\n')
print(json.dumps({key: value for key, value in receipt.items() if key not in ['selectedFiles', 'layers']}))
