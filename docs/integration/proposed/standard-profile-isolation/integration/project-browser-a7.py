#!/usr/bin/env python3
"""Project the finite, counted custody/compiler batch into the isolated tree only."""
from pathlib import Path
import hashlib
import json
import os

HERE = Path(__file__).resolve().parent
LANES = HERE.parent
TREE = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
HEADER = 'content/browser/aux_child_lifetime.h'
STAGES = [
    ('browser-native-host-custody-a1', [HEADER]),
    ('browser-custody-content-a5', []),
    ('browser-native-host-reservation-refusal-a1', [HEADER]),
    ('browser-crashpad-close-a1', []),
    ('browser-crashpad-system-handler-a1', []),
    ('browser-custody-gn-a1', []),
    ('content-policy-ack-v4', [HEADER]),
    ('content-policy-ack-v4-custody', []),
    ('meta-connection-lifetime-a3', []),
]


def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def digest(data):
    return hashlib.sha256(data).hexdigest()


def read(path):
    return json.loads(Path(path).read_text())


def fresh(path, value):
    with path.open('x') as stream:
        stream.write(json.dumps(value, indent=2) + '\n')


pin_path, comp_path = [HERE / name for name in ['full-native-input-pins-a6.json', 'browser-composition-a6.json']]
pins, comp = read(pin_path), read(comp_path)
outputs = [HERE / name for name in ['browser-composition-a7.json', 'full-native-input-pins-a7.json', 'browser-projection-a7.json']]
assert all(not path.exists() for path in outputs)
for name, expected in pins['files'].items():
    target = TREE / name
    assert target.is_file() and not target.is_symlink() and sha(target) == expected, name
prepared, initial, final_sources, stages = {}, {}, {}, []
for label, skipped in STAGES:
    lane = LANES / label
    manifest_path, anchors_path = lane / 'manifest.json', lane / 'replacements.json'
    manifest, anchors = read(manifest_path), read(anchors_path)
    assert set(skipped) <= {row['path'] for row in manifest['files']}
    count = 0
    applied = []
    for row in manifest['files']:
        name = row['path']
        if name in skipped:
            continue
        assert not Path(name).is_absolute() and '..' not in Path(name).parts
        if name not in prepared:
            target = TREE / name
            assert target.is_file() and not target.is_symlink() and sha(target) == row['beforeSha256'], (label, name)
            if name in pins['files']:
                assert pins['files'][name] == row['beforeSha256'], name
            initial[name] = row['beforeSha256']
            text = target.read_text()
        else:
            text = prepared[name].decode()
        assert digest(text.encode()) == row['beforeSha256'], (label, name)
        edits = [edit for edit in anchors if edit['path'] == name]
        assert edits, name
        for edit in edits:
            assert edit['count'] == 1 and text.count(edit['old']) == 1, (label, name, edit['old'][:80])
            text = text.replace(edit['old'], edit['new'])
            count += 1
        source = lane / 'source' / name
        assert text.encode() == source.read_bytes() and sha(source) == row['afterSha256'], (label, name)
        prepared[name], final_sources[name] = text.encode(), str(source)
        applied.append(name)
    for row in manifest.get('newFiles', []):
        name = row['path']
        assert not Path(name).is_absolute() and '..' not in Path(name).parts
        target, source = TREE / name, lane / 'source' / name
        assert name not in prepared and not target.exists() and not target.is_symlink(), name
        assert sha(source) == row['sha256'], name
        initial[name], prepared[name], final_sources[name] = None, source.read_bytes(), str(source)
        applied.append(name)
    assert count == sum(edit['count'] for edit in anchors if edit['path'] not in skipped)
    assert manifest['countedAdaptations'] == sum(edit['count'] for edit in anchors)
    stages.append({'name': label, 'path': str(manifest_path), 'sha256': sha(manifest_path),
                   'anchorsPath': str(anchors_path), 'anchorsSha256': sha(anchors_path),
                   'appliedFiles': applied, 'skippedFiles': skipped, 'countedEdits': count,
                   'newFileCount': len(manifest.get('newFiles', []))})
additional = []
for row in read(LANES / 'browser-custody-gn-a1/manifest.json')['graphEvidence']:
    path = Path(row['path'])
    assert sha(path) == row['sha256'], str(path)
    if path.is_relative_to(TREE):
        name = str(path.relative_to(TREE))
        assert name not in pins['files'] or pins['files'][name] == row['sha256']
        pins['files'][name] = row['sha256']
    additional.append(row)
# All preconditions are checked before any mutation; no owner tree/app writes.
for name, data in prepared.items():
    target = TREE / name
    target.parent.mkdir(parents=True, exist_ok=True)
    temporary = target.with_name(target.name + '.aux-a7-projection')
    with temporary.open('xb') as stream:
        stream.write(data)
    os.replace(temporary, target)
    assert sha(target) == digest(data)
comp['predecessorComposition'] = {'path': str(comp_path), 'sha256': sha(comp_path)}
comp['files'] = [{'path': name, 'beforeSha256': initial[name], 'afterSha256': digest(data),
                  'source': final_sources[name]} for name, data in prepared.items()]
comp['custodyIntegrationStages'] = stages
comp['graphEvidence'] = additional
for name, data in prepared.items():
    comp['inputPins'][name] = pins['files'][name] = digest(data)
fresh(outputs[0], comp)
pins.update(predecessorInputPinsSha256=sha(pin_path), featureCompositionSha256=sha(outputs[0]))
fresh(outputs[1], pins)
fresh(outputs[2], {'format': 'aux.standard-browser-source-projection.v6',
    'previousInputPinsSha256': sha(pin_path), 'compositionSha256': sha(outputs[0]),
    'inputPinsSha256': sha(outputs[1]), 'filesProjected': len(prepared),
    'nativeInputCount': len(pins['files']), 'stages': stages,
    'ownerCheckoutChanged': False, 'uiChanged': False, 'appExecuted': False,
    'productSigned': False, 'cleanRecoveryProven': False})
print(json.dumps({'projectedFiles': len(prepared), 'nativeInputs': len(pins['files']), 'compositionSha256': sha(outputs[0])}))
