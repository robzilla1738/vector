"""Compose reviewed profile, frame and file deltas over the successful A1 build."""
import hashlib
import json
import shutil
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
OUT = Path('/private/tmp/aux-feature-completion-native-overlay-20261024-a2')
OUT.mkdir(mode=0o700)
sha = lambda path: hashlib.sha256(Path(path).read_bytes()).hexdigest()
prior_path = HERE.parent / 'completion-batch-a1/source-composition.json'
prior = json.loads(prior_path.read_text())
assert prior['passed'] and prior['combinedChangedFileCount'] == 63
selected = dict(prior['selectedFiles'])
changed = {name for name, row in selected.items() if row['changed']}
for name, row in selected.items():
    assert sha(row['path']) == row['sha256'], name
    assert sha(ROOT / name) == row['sha256'], name
sources, manifests = {}, []
for lane in ['profile-window', 'navigation-frame', 'productivity']:
    folder = HERE.parent / (lane + '-completion-batch-a2')
    path = folder / 'source-plan.json'
    plan = json.loads(path.read_text())
    manifests.append({'path': str(path), 'sha256': sha(path), 'files': len(plan['files'])})
    for row in plan['files']:
        relative = row['path']
        assert relative not in sources, relative
        assert sha(ROOT / relative) == row['inputSha256'], relative
        if relative in selected:
            assert selected[relative]['sha256'] == row['inputSha256'], relative
        output = folder / 'source' / relative
        assert sha(output) == row['outputSha256'], relative
        actual = (ROOT / relative).read_text()
        for anchor in row['anchors']:
            assert actual.count(anchor['find']) == anchor['count'], relative
            actual = actual.replace(anchor['find'], anchor['replace'], anchor['count'])
        assert actual.encode() == output.read_bytes(), relative
        sources[relative] = {'path': str(output), 'sha256': row['outputSha256'],
                             'inputSha256': row['inputSha256'], 'changed': True}
assert len(sources) == 23
overlaps = sorted(set(sources) & changed)
selected.update(sources)
changed.update(sources)
for name in changed:
    row = selected[name]
    target = OUT / name
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(row['path'], target)
    assert sha(target) == row['sha256']
    selected[name] = {**row, 'path': str(target)}
receipt = {'format': 'aux.feature-completion.native-source-composition.v2', 'passed': True,
           'priorComposition': str(prior_path), 'priorCompositionSha256': sha(prior_path),
           'laneManifests': manifests, 'laneFiles': list(sources),
           'laneFileCount': len(sources), 'overlapWithPriorChangedFiles': overlaps,
           'combinedChangedFileCount': len(changed), 'selectedFileCount': len(selected),
           'selectedFiles': selected, 'overlay': str(OUT), 'authorityWireVersion': 6,
           'requiresPairedWireVersion6Daemon': True, 'nativeCheckoutChanged': False,
           'browserFullyBuilt': False, 'productExecuted': False, 'runtimeAcceptance': False}
(HERE / 'source-composition.json').write_text(json.dumps(receipt, indent=2) + '\n')
print(json.dumps({key: value for key, value in receipt.items()
                  if key not in ['selectedFiles', 'laneFiles', 'laneManifests']}))
