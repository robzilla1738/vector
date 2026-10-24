"""Project exact live preference restoration and existing DOM control adapters."""
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import sys

HERE = Path(__file__).resolve().parent
ROOT = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
OUT = ROOT.parent / 'native-document-cli-integration-20261024-a13'
OVERLAY = Path('/private/tmp/aux-document-cli-integration-overlay-20261024-a13')
sha = lambda p: hashlib.sha256(Path(p).read_bytes()).hexdigest()
OUT.mkdir(mode=0o700)
OVERLAY.mkdir(mode=0o700)
prior_path = HERE.parent / 'cli-storage-integration-a12/source-composition-a2.json'
prior = json.loads(prior_path.read_text())
selected = dict(prior['selectedFiles'])
for name, row in selected.items():
    assert sha(row['path']) == row['sha256'] == sha(ROOT / name), name
manifests, originals = [], {}
folder = HERE
manifest = HERE / 'source-plan.json'
manifests.append({'path': str(manifest), 'sha256': sha(manifest)})
for row in json.loads(manifest.read_text())['files']:
    name, expected = row['path'], row['inputSha256']
    source, target = folder / 'source' / name, ROOT / name
    assert name not in originals and (sha(target) if target.exists() else None) == expected
    assert sha(source) == row['outputSha256']
    if expected is not None:
        data = target.read_text()
        for anchor in row['anchors']:
            assert data.count(anchor['find']) == anchor['count'], name
            data = data.replace(anchor['find'], anchor['replace'], anchor['count'])
        assert data.encode() == source.read_bytes(), name
    originals[name] = expected
    selected[name] = {'path': str(source), 'sha256': row['outputSha256'],
                      'inputSha256': expected, 'changed': True}
assert len(originals) == 9
for name, row in selected.items():
    if row['changed']:
        target = OVERLAY / name
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(row['path'], target)
        selected[name] = {**row, 'path': str(target)}
sources = ['base/process/mac/aux_browser_descendant_engine.cc',
    'base/process/mac/aux_browser_descendant_bridge.cc',
    'chrome/browser/aux/cli/AuxCliIngress.cc',
    'chrome/browser/aux/cli/AuxCliSealedImages.cc',
    'chrome/browser/aux/cli/AuxCliOpenCommand.mm',
    'content/browser/renderer_host/aux_ui_migration_document.cc',
    'chrome/browser/aux/ui_storage_migration_controller.cc']
composition = {'format': 'aux.integration-completion.native-composition.v1', 'passed': True,
    'priorComposition': str(prior_path), 'priorCompositionSha256': sha(prior_path),
    'manifests': manifests, 'laneFiles': sources, 'selectedFiles': selected,
    'overlay': str(OVERLAY), 'changedFileCount': sum(row['changed'] for row in selected.values()),
    'selectedFileCount': len(selected), 'nativeCheckoutChanged': False,
    'productExecuted': False, 'runtimeAcceptance': False, 'authorityWireVersion': 6}
(HERE / 'source-composition.json').write_text(json.dumps(composition, indent=2) + '\n')
record = {'format': 'aux.storage-restore.native-projection.actual.v1', 'passed': False,
          'originals': originals, 'projected': [], 'beforeImages': str(OUT / 'before'),
          'sourceCompositionSha256': sha(HERE / 'source-composition.json'),
          'ownerChangesReset': False, 'acceptedAppReplaced': False, 'productExecuted': False}
try:
    for name, expected in originals.items():
        target = ROOT / name
        assert not target.is_symlink() and (sha(target) if target.exists() else None) == expected, name
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
(HERE / 'actual-generation-a1.json').write_text(json.dumps({'passed':not run.returncode,'command':command,'cwd':str(ROOT),'exitCode':run.returncode,'productExecuted':False},indent=2)+'\n')
if run.returncode:
    print((run.stdout+run.stderr).decode(errors='replace')[-5000:])
    raise SystemExit(run.returncode)
raise SystemExit(subprocess.call([sys.executable, str(HERE / 'compile.py')]))
