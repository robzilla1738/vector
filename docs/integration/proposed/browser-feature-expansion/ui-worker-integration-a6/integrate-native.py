"""Project one coherent worker/cache/API batch with exact predecessor custody."""
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import sys

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[4]
ROOT = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
OUT = ROOT.parent / 'native-ui-worker-integration-20261024-a6'
OVERLAY = Path('/private/tmp/aux-ui-worker-integration-overlay-20261024-a6')
sha = lambda p: hashlib.sha256(Path(p).read_bytes()).hexdigest()

OUT.mkdir(mode=0o700)
OVERLAY.mkdir(mode=0o700)
prior_path = HERE.parent / 'backend-lease-integration-a7/source-composition-a2.json'
prior = json.loads(prior_path.read_text())
selected = dict(prior['selectedFiles'])
for name, row in selected.items():
    assert sha(row['path']) == row['sha256'] == sha(ROOT / name), name
folders = [HERE.parents[1] / 'standard-profile-isolation' / name for name in [
    'native-dom-type-include-fix-a7c', 'ui-worker-api-binding-a1',
    'ui-worker-native-control-a1', 'native-renderer-cache-lease-a8']]
originals, manifests = {}, []
for folder in folders:
    manifest = folder / 'source-plan.json'
    manifests.append({'path': str(manifest), 'sha256': sha(manifest)})
    for row in json.loads(manifest.read_text())['files']:
        name = row['path']
        assert name not in originals
        source, target = folder / 'source' / name, ROOT / name
        expected = row.get('inputSha256')
        assert (sha(target) if target.exists() else None) == expected, name
        assert sha(source) == row['outputSha256'], name
        if expected is not None:
            text = target.read_text()
            for anchor in row['anchors']:
                assert text.count(anchor['find']) == anchor['count'], name
                text = text.replace(anchor['find'], anchor['replace'], anchor['count'])
            assert text.encode() == source.read_bytes(), name
        originals[name] = expected
        selected[name] = {'path': str(source), 'sha256': row['outputSha256'],
                          'inputSha256': expected, 'changed': True}
assert len(originals) == 18
for name, row in selected.items():
    if row['changed']:
        target = OVERLAY / name
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(row['path'], target)
        selected[name] = {**row, 'path': str(target)}
sources = ['chrome/browser/aux/ui_storage_migration_worker.cc',
           'chrome/browser/extensions/api/aux_browser_preferences/aux_browser_preferences_api.cc',
           'third_party/blink/renderer/modules/storage/cached_storage_area.cc',
           'third_party/blink/renderer/modules/storage/storage_area.cc',
           'components/services/storage/dom_storage/session_storage_impl.cc',
           'gen/chrome/browser/extensions/api/generated_api_registration.cc']
composition = {'format': 'aux.integration-completion.native-composition.v1', 'passed': True,
    'priorComposition': str(prior_path), 'priorCompositionSha256': sha(prior_path),
    'manifests': manifests, 'laneFiles': sources, 'selectedFiles': selected,
    'overlay': str(OVERLAY), 'changedFileCount': sum(row['changed'] for row in selected.values()),
    'selectedFileCount': len(selected), 'nativeCheckoutChanged': False,
    'productExecuted': False, 'runtimeAcceptance': False, 'authorityWireVersion': 6}
(HERE / 'source-composition.json').write_text(json.dumps(composition, indent=2) + '\n')
record = {'format': 'aux.ui-worker.native-projection.actual.v1', 'passed': False,
          'originals': originals, 'projected': [], 'beforeImages': str(OUT / 'before'),
          'sourceCompositionSha256': sha(HERE / 'source-composition.json'),
          'ownerChangesReset': False, 'acceptedAppReplaced': False, 'productExecuted': False}
try:
    for name, expected in originals.items():
        target = ROOT / name
        assert not target.is_symlink()
        assert (sha(target) if target.exists() else None) == expected, name
        if expected is not None:
            backup = OUT / 'before' / name
            backup.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(target, backup)
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(selected[name]['path'], target)
        assert sha(target) == selected[name]['sha256']
        record['projected'].append(name)
    for name, row in selected.items():
        assert sha(ROOT / name) == row['sha256'], name
    record['passed'] = True
finally:
    (HERE / 'actual-native-projection-a1.json').write_text(json.dumps(record, indent=2) + '\n')
print(json.dumps({'projectionPassed': record['passed'], 'files': len(record['projected']),
                  'selected': len(selected), 'changed': composition['changedFileCount']}), flush=True)
commands = [
    [str(ROOT / 'buildtools/mac/gn'), 'gen', str(ROOT / 'out/AuxFast')],
    [str(ROOT / 'third_party/ninja/ninja'), '-C', str(ROOT / 'out/AuxFast'), '-j4',
     'gen/chrome/browser/extensions/api/generated_api_registration.cc',
     'gen/chrome/common/extensions/api/generated_schemas.cc',
     *['gen/third_party/blink/public/mojom/dom_storage/storage_area.mojom' + suffix
       for suffix in ['.h', '-blink.h', '-shared.h', '-shared-internal.h']]]]
results = []
for index, command in enumerate(commands):
    result = subprocess.run(command, cwd=ROOT, capture_output=True)
    (OUT / f'generation-{index}.stdout').write_bytes(result.stdout)
    (OUT / f'generation-{index}.stderr').write_bytes(result.stderr)
    results.append({'command': command, 'cwd': str(ROOT), 'exitCode': result.returncode})
    receipt = {'passed': all(not r['exitCode'] for r in results), 'results': results,
               'sourceCompositionSha256': sha(HERE / 'source-composition.json'),
               'productExecuted': False, 'fullBrowserBuilt': False}
    (HERE / 'actual-native-generation-a1.json').write_text(json.dumps(receipt, indent=2) + '\n')
    if result.returncode:
        print((result.stdout + result.stderr).decode(errors='replace')[-5000:])
        raise SystemExit(result.returncode)
raise SystemExit(subprocess.call([sys.executable, str(HERE / 'compile-native.py')], cwd=REPO))
