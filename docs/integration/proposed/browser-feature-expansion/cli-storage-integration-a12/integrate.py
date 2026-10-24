"""Project complete native CLI open wiring plus the exact DOM pointer fix."""
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys

HERE = Path(__file__).resolve().parent
ROOT = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
OUT = ROOT.parent / 'native-cli-storage-integration-20261024-a12'
OVERLAY = Path('/private/tmp/aux-cli-storage-integration-overlay-20261024-a12')
sha = lambda p: hashlib.sha256(Path(p).read_bytes()).hexdigest()
OUT.mkdir(mode=0o700)
OVERLAY.mkdir(mode=0o700)
prior_path = HERE.parent / 'storage-restore-integration-a10/source-composition.json'
prior = json.loads(prior_path.read_text())
selected = dict(prior['selectedFiles'])
for name, row in selected.items():
    assert sha(row['path']) == row['sha256'] == sha(ROOT / name), name
scope = HERE.parents[1] / 'standard-profile-isolation'
flat_path = scope / 'cli-native-open-flat-projection-a1/projection.json'
flat = json.loads(flat_path.read_text())
assert flat['priorActualCompositionSha256'] == sha(prior_path)
flat_folder = flat_path.parent
rows = []
for row in flat['files']:
    rows.append({**row, 'resolvedSource': str(flat_folder / 'source' / row['path'])})
fix_path = scope / 'native-dom-existing-controls-compile-fix-a9b/source-plan.json'
for row in json.loads(fix_path.read_text())['files']:
    rows.append({**row, 'appendBlocks': [],
                 'resolvedSource': str(fix_path.parent / 'source' / row['path'])})
assert len(rows) == 32 and len({r['path'] for r in rows}) == 32
for row in rows:
    name, source, expected = row['path'], Path(row['resolvedSource']), row['inputSha256']
    target = ROOT / name
    assert not target.is_symlink()
    assert (sha(target) if os.path.lexists(target) else None) == expected, name
    assert sha(source) == row['outputSha256'], name
    if expected is not None:
        data = target.read_text()
        for anchor in row['anchors']:
            assert data.count(anchor['find']) == anchor['count'], name
            data = data.replace(anchor['find'], anchor['replace'], anchor['count'])
        for block in row['appendBlocks']:
            assert not data.endswith(block['bytes'])
            data += block['bytes']
        assert data.encode() == source.read_bytes(), name
    selected[name] = {'path': str(source), 'sha256': row['outputSha256'],
                      'inputSha256': expected, 'changed': True}
for name, row in selected.items():
    if row['changed']:
        target = OVERLAY / name
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(row['path'], target)
        selected[name] = {**row, 'path': str(target)}
sources = [r['path'] for r in rows if r['path'].endswith(('.cc', '.mm'))]
sources += ['content/browser/dom_storage/dom_storage_context_wrapper.cc',
            'chrome/browser/aux/ui_storage_migration_controller.cc']
assert len(sources) == 17
composition = {'format': 'aux.integration-completion.native-composition.v1', 'passed': True,
    'priorComposition': str(prior_path), 'priorCompositionSha256': sha(prior_path),
    'manifests': [{'path': str(p), 'sha256': sha(p)} for p in [flat_path, fix_path]],
    'laneFiles': sources, 'selectedFiles': selected, 'overlay': str(OVERLAY),
    'changedFileCount': sum(row['changed'] for row in selected.values()),
    'selectedFileCount': len(selected), 'nativeCheckoutChanged': False,
    'productExecuted': False, 'runtimeAcceptance': False, 'authorityWireVersion': 6}
(HERE / 'source-composition.json').write_text(json.dumps(composition, indent=2) + '\n')
record = {'format': 'aux.cli-storage.native-projection.actual.v1', 'passed': False,
          'originals': {r['path']: r['inputSha256'] for r in rows}, 'projected': [],
          'beforeImages': str(OUT / 'before'), 'ownerChangesReset': False,
          'acceptedAppReplaced': False, 'productExecuted': False,
          'sourceCompositionSha256': sha(HERE / 'source-composition.json')}
try:
    for row in rows:
        name, expected = row['path'], row['inputSha256']
        target = ROOT / name
        assert not target.is_symlink()
        assert (sha(target) if os.path.lexists(target) else None) == expected, name
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
command = [str(ROOT / 'buildtools/mac/gn'), 'gen', str(ROOT / 'out/AuxFast')]
run = subprocess.run(command, cwd=ROOT, capture_output=True)
(OUT / 'generation.stdout').write_bytes(run.stdout)
(OUT / 'generation.stderr').write_bytes(run.stderr)
generation = {'passed': not run.returncode, 'command': command, 'cwd': str(ROOT),
              'exitCode': run.returncode, 'productExecuted': False, 'fullBrowserBuilt': False}
(HERE / 'actual-native-generation-a1.json').write_text(json.dumps(generation, indent=2) + '\n')
if run.returncode:
    print((run.stdout + run.stderr).decode(errors='replace')[-5000:])
    raise SystemExit(run.returncode)
raise SystemExit(subprocess.call([sys.executable, str(HERE / 'compile.py')]))
