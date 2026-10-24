"""Register one complete native patch; replay only in a disposable source tree."""
import difflib
import hashlib
import json
import subprocess
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[4]
assert (REPO / 'AGENTS.md').is_file()
ROOT = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
OUT = Path('/private/tmp/aux-ui-storage-native-series-replay-20261024-a1')
OUT.mkdir(mode=0o700)
TREE = OUT / 'tree'
TREE.mkdir()
sha = lambda data: hashlib.sha256(data).hexdigest()
git = lambda *args, **kwargs: subprocess.run(['git', *args], check=True, capture_output=True, **kwargs)
base = git('-C', str(ROOT), 'rev-parse', 'HEAD').stdout.decode().strip()
assert base == '0e66b94549a8bd85f03fbdf189b752d6e7b63c32'
files = {}
for folder, manifest in [
    (HERE, 'source-plan.json'),
    (HERE.parent / 'ui-storage-native-drain-a1', 'service-source-plan.json'),
    (HERE.parent / 'ui-extension-storage-migration-a1', 'source-plan.json'),
]:
    plan = json.loads((folder / manifest).read_text())
    overlay = Path(plan['overlay']) if 'overlay' in plan else folder / 'source'
    for row in plan['files']:
        name = row['path']
        assert name not in files
        original = (ROOT / name).read_bytes()
        expected = row.get('originalSha256', row['inputSha256'])
        assert sha(original) == expected
        assert git('-C', str(ROOT), 'show', base + ':' + name).stdout == original
        result = (overlay / name).read_bytes()
        assert sha(result) == row['outputSha256']
        files[name] = (original, result)

name = 'components/value_store/BUILD.gn'
original = (ROOT / name).read_bytes()
assert git('-C', str(ROOT), 'show', base + ':' + name).stdout == original
anchor = b'    "leveldb_value_store_unittest.cc",'
assert original.count(anchor) == 1
files[name] = (original, original.replace(anchor, b'    "aux_ui_preference_migration_unittest.cc",\n' + anchor))
test = HERE.parent / 'ui-extension-storage-migration-a1/migration_unittest.cc'
test_receipt = json.loads((test.parent / 'actual-test-compile-a1.json').read_text())
assert test_receipt['passed'] and sha(test.read_bytes()) == test_receipt['testSourceSha256']
files['components/value_store/aux_ui_preference_migration_unittest.cc'] = (None, test.read_bytes())

series = REPO / 'chromium/patches/series'
series_before = series.read_bytes()
entry = 'aux/0106-aux-ui-storage-migration.patch'
assert entry.encode() not in series_before
patch_path = REPO / 'chromium/patches' / entry
assert not patch_path.exists()
overlap = []
for line in series_before.decode().splitlines():
    if not line.strip() or line.startswith('#'):
        continue
    owned = git('apply', '--numstat', str(REPO / 'chromium/patches' / line)).stdout.decode().splitlines()
    for row in owned:
        name = row.split('\t', 2)[2]
        if name in files:
            overlap.append({'patch': line, 'path': name})
assert not overlap, overlap

patch = []
for name, (original, result) in sorted(files.items()):
    patch.append(f'diff --git a/{name} b/{name}\n')
    if original is None:
        patch.append('new file mode 100644\n')
    patch.extend(difflib.unified_diff((original or b'').decode().splitlines(True), result.decode().splitlines(True),
                                    fromfile='a/' + name if original is not None else '/dev/null', tofile='b/' + name))
    if original is not None:
        path = TREE / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(original)
patch_bytes = ''.join(patch).encode()
(OUT / 'candidate.patch').write_bytes(patch_bytes)
git('-C', str(TREE), 'init', '-q')
git('-C', str(TREE), 'add', '--all')
git('-C', str(TREE), 'apply', '--check', str(OUT / 'candidate.patch'))
git('-C', str(TREE), 'apply', str(OUT / 'candidate.patch'))
for name, (original, result) in files.items():
    assert (TREE / name).read_bytes() == result
    if original is not None:
        assert (ROOT / name).read_bytes() == original
git('-C', str(TREE), 'apply', '--reverse', '--check', str(OUT / 'candidate.patch'))
patch_path.write_bytes(patch_bytes)
series.write_bytes(series_before + (b'' if series_before.endswith(b'\n') else b'\n') + entry.encode() + b'\n')
receipt = {'format': 'aux.ui-storage.native-series.integration.actual.v1',
           'passed': True, 'base': base, 'patch': str(patch_path),
           'patchSha256': sha(patch_bytes), 'seriesBeforeSha256': sha(series_before),
           'seriesAfterSha256': sha(series.read_bytes()), 'output': str(OUT),
           'sourcePlanSha256': sha((HERE / 'source-plan.json').read_bytes()),
           'files': [{'path': name, 'inputSha256': sha(original) if original is not None else None,
                      'outputSha256': sha(result)} for name, (original, result) in sorted(files.items())],
           'overlapWithExistingSeries': overlap, 'exactReplayPassed': True,
           'reverseCheckPassed': True, 'unitFixtureRegistered': True,
           'nativeRootChanged': False, 'fullBrowserBuilt': False,
           'testsExecuted': False, 'productExecuted': False,
           'browserImporterIntegrated': False, 'runtimeAcceptance': False}
(HERE / 'actual-series-integration-a1.json').write_text(json.dumps(receipt, indent=2) + '\n')
print(json.dumps({key: value for key, value in receipt.items() if key != 'files'}))
