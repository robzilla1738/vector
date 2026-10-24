"""Project the counted physical-cache, control, and controller successors."""
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import sys

HERE = Path(__file__).resolve().parent
ROOT = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
OUT = ROOT.parent / 'native-completion-integration-20261024-a23'
OVERLAY = Path('/private/tmp/aux-native-completion-overlay-20261024-a23')
BASE = HERE.parents[1] / 'standard-profile-isolation'
sha = lambda p: hashlib.sha256(Path(p).read_bytes()).hexdigest()
digest = lambda b: hashlib.sha256(b).hexdigest()
prior_path = HERE.parent / 'native-recovery-integration-a22/source-composition.json'
prior = json.loads(prior_path.read_text())
selected = dict(prior['selectedFiles'])
for name, row in selected.items():
    assert sha(row['path']) == row['sha256'] == sha(ROOT / name), name
names = ['native-recovery-phase-fence-a20', 'native-recovery-allocation-proof-a20b',
    'native-dom-control-recovery-a21', 'native-live-target-controller-a18',
    'native-ui-completion-fact-a19', 'native-live-rollback-source-a22',
    'native-selected-ui-completion-a21']
data, originals, manifests = {}, {}, []
for folder in names:
    path = BASE / folder / 'source-plan.json'
    manifests.append({'path': str(path), 'sha256': sha(path)})
    for row in json.loads(path.read_text())['files']:
        name = row['path']
        target = ROOT / name
        if name not in data:
            data[name] = target.read_bytes() if target.exists() else None
            originals[name] = digest(data[name]) if data[name] is not None else None
        before = data[name]
        assert (digest(before) if before is not None else None) == row['inputSha256'], (folder, name)
        after = (BASE / folder / 'source' / name).read_bytes()
        assert digest(after) == row['outputSha256'], (folder, name)
        if before is not None:
            text = before.decode()
            for anchor in row['anchors']:
                assert text.count(anchor['find']) == anchor['count'], (folder, name)
                text = text.replace(anchor['find'], anchor['replace'], anchor['count'])
            assert text.encode() == after, (folder, name)
        data[name] = after
assert len(data) == 11
OUT.mkdir(mode=0o700)
OVERLAY.mkdir(mode=0o700)
for name, content in data.items():
    target = OVERLAY / name
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(content)
    selected[name] = {'path': str(target), 'sha256': digest(content),
        'inputSha256': originals[name], 'changed': True}
for name, row in list(selected.items()):
    if row['changed'] and name not in data:
        target = OVERLAY / name
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(row['path'], target)
        selected[name] = {**row, 'path': str(target)}
sources = [name for name in data if name.endswith(('.cc', '.mm'))]
assert len(sources) == 5
composition = {'format': 'aux.integration-completion.native-composition.v1',
    'passed': True, 'priorComposition': str(prior_path), 'priorCompositionSha256': sha(prior_path),
    'manifests': manifests, 'laneFiles': sources, 'selectedFiles': selected,
    'overlay': str(OVERLAY), 'changedFileCount': sum(row['changed'] for row in selected.values()),
    'selectedFileCount': len(selected), 'nativeCheckoutChanged': False,
    'productExecuted': False, 'runtimeAcceptance': False, 'authorityWireVersion': 6}
(HERE / 'source-composition.json').write_text(json.dumps(composition, indent=2) + '\n')
record = {'format': 'aux.native-cohort.projection.actual.v1', 'passed': False,
    'originals': originals, 'projected': [], 'beforeImages': str(OUT / 'before'),
    'sourceCompositionSha256': sha(HERE / 'source-composition.json'),
    'ownerChangesReset': False, 'acceptedAppReplaced': False, 'productExecuted': False}
try:
    for name, expected in originals.items():
        target = ROOT / name
        assert not target.is_symlink()
        assert (sha(target) if target.exists() else None) == expected, name
        if target.exists():
            backup = OUT / 'before' / name
            backup.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(target, backup)
        else:
            target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(selected[name]['path'], target)
        assert sha(target) == selected[name]['sha256']
        record['projected'].append(name)
    for name, row in selected.items():
        assert sha(ROOT / name) == row['sha256'], name
    record['passed'] = True
finally:
    (HERE / 'actual-native-projection-a1.json').write_text(json.dumps(record, indent=2) + '\n')
print(json.dumps({'projectionPassed': record['passed'], 'files': len(data),
    'selected': len(selected), 'changed': composition['changedFileCount']}), flush=True)
for index, command in enumerate([
    [str(ROOT / 'buildtools/mac/gn'), 'gen', str(ROOT / 'out/AuxFast')],
    [str(ROOT / 'third_party/ninja/ninja'), '-C', str(ROOT / 'out/AuxFast'), '-j4',
     *['gen/components/services/storage/public/mojom/' + name + '.mojom' + suffix
       for name in ['local_storage_control', 'session_storage_control']
       for suffix in ['.h', '-shared.h', '-shared-internal.h']],
     *['gen/third_party/blink/public/mojom/dom_storage/storage_area.mojom' + suffix
       for suffix in ['.h', '-blink.h', '-shared.h', '-shared-internal.h']]]]):
    run = subprocess.run(command, cwd=ROOT, capture_output=True)
    (OUT / f'generate-{index}.stdout').write_bytes(run.stdout)
    (OUT / f'generate-{index}.stderr').write_bytes(run.stderr)
    (HERE / f'actual-generation-{index}.json').write_text(json.dumps({
        'passed': run.returncode == 0, 'command': command, 'exitCode': run.returncode,
        'productExecuted': False}, indent=2) + '\n')
    if run.returncode:
        print(run.stdout.decode(errors='replace')[-4000:] + run.stderr.decode(errors='replace')[-4000:])
        raise SystemExit(run.returncode)
raise SystemExit(subprocess.call([sys.executable, str(HERE / 'compile.py')]))
