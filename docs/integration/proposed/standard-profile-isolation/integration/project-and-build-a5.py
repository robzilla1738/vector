#!/usr/bin/env python3
"""Project one counted browser batch then run the original unsigned builder."""
from pathlib import Path
import hashlib
import json
import os
import subprocess
import sys

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[4]
PROPOSALS = HERE.parent
TREE = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')


def digest(data):
    return hashlib.sha256(data).hexdigest()


def sha(path):
    return digest(Path(path).read_bytes())


def read(path):
    return json.loads(Path(path).read_text())


def fresh_json(path, value):
    with path.open('x') as stream:
        stream.write(json.dumps(value, indent=2) + '\n')


previous = TREE.parent / 'unsigned-standard-profile-browser-build-20261024-a4/receipt.json'
assert read(previous)['passed'] is True
pin_path = HERE / 'full-native-input-pins-a4.json'
composition_path = HERE / 'browser-composition-a4.json'
pins = read(pin_path)
composition = read(composition_path)
outputs = [HERE / name for name in ['browser-composition-a5.json',
           'full-native-input-pins-a5.json', 'browser-projection-a5.json']]
assert all(not path.exists() for path in outputs)
for name, expected in pins['files'].items():
    path = TREE / name
    assert path.is_file() and not path.is_symlink() and sha(path) == expected, name

prepared, initial, final_sources, stage_evidence = {}, {}, {}, []


def stage(label, manifest_name, source_directory, anchor_name=None):
    lane = PROPOSALS / label
    manifest_path = lane / manifest_name
    manifest = read(manifest_path)
    rows = manifest['files']
    anchors = read(lane / anchor_name) if anchor_name else None
    count = 0
    for row in rows:
        name = row['path']
        assert not Path(name).is_absolute() and '..' not in Path(name).parts
        expected = row['beforeSha256']
        if name not in prepared:
            actual = TREE / name
            if expected is None:
                assert not actual.exists() and not actual.is_symlink(), name
                initial[name] = None
                text = ''
            else:
                assert actual.is_file() and not actual.is_symlink() and sha(actual) == expected, name
                if name in pins['files']:
                    assert pins['files'][name] == expected, name
                initial[name] = expected
                text = actual.read_text()
        else:
            text = prepared[name].decode()
        assert (digest(text.encode()) if expected is not None else None) == expected, name
        if expected is None:
            text = (lane / source_directory / name).read_text()
        else:
            edits = row['changes'] if anchors is None else [x for x in anchors if x['path'] == name]
            assert edits, name
            for edit in edits:
                old, new = edit.get('find', edit.get('old')), edit.get('replace', edit.get('new'))
                assert edit['count'] == 1 and text.count(old) == 1, name
                text = text.replace(old, new)
                count += 1
        successor = lane / source_directory / name
        assert text.encode() == successor.read_bytes() and sha(successor) == row['afterSha256'], name
        prepared[name] = text.encode()
        final_sources[name] = str(successor)
    stage_evidence.append({'path': str(manifest_path), 'sha256': sha(manifest_path),
                           'files': len(rows), 'countedEdits': count,
                           'anchorsSha256': sha(lane / anchor_name) if anchor_name else sha(manifest_path)})


stage('content-policy-ack-v1', 'manifest.json', 'source', 'anchors.json')
stage('content-policy-ack-v2', 'manifest.json', 'source', 'anchors.json')
stage('meta-connection-lifetime-a1', 'native-replacements.json', 'native-source')
stage('meta-connection-lifetime-a2', 'native-replacements.json', 'native-source')
stage('native-host-stderr-a1', 'manifest.json', 'source', 'replacements.json')
stage('content-policy-ack-gn-a1', 'manifest.json', 'source', 'replacements.json')

additional = []
for name, entries in [
    ('content-policy-ack-v1/policy-inputs.json', None),
    ('meta-connection-lifetime-a1/scope-inputs.json', 'inputs'),
    ('meta-connection-lifetime-a2/manifest.json', 'gnInputs')]:
    path = PROPOSALS / name
    values = read(path)
    if entries:
        values = values[entries]
    for item in values:
        source = Path(item['path'])
        assert sha(source) == item['sha256'], str(source)
        if source.is_relative_to(TREE):
            relative = str(source.relative_to(TREE))
            assert relative not in pins['files'] or pins['files'][relative] == item['sha256']
            pins['files'][relative] = item['sha256']
    additional.append({'path': str(path), 'sha256': sha(path)})

# All old leaves, new-leaf absence, literal stages and policy evidence pass
# before any mutation of this isolated tree. The owner tree is never written.
for name, data in prepared.items():
    target = TREE / name
    target.parent.mkdir(parents=True, exist_ok=True)
    temporary = target.with_name(target.name + '.aux-a5-projection')
    with temporary.open('xb') as stream:
        stream.write(data)
    os.replace(temporary, target)
    assert sha(target) == digest(data)

composition['predecessorComposition'] = {'path': str(composition_path), 'sha256': sha(composition_path)}
composition['files'] = [{'path': name, 'beforeSha256': initial[name],
                         'afterSha256': digest(data), 'source': final_sources[name]}
                        for name, data in prepared.items()]
composition['nativeLifetimeStages'] = stage_evidence
for name, data in prepared.items():
    composition['inputPins'][name] = pins['files'][name] = digest(data)
fresh_json(outputs[0], composition)
pins.update(predecessorNativeReceipt=str(previous), predecessorNativeReceiptSha256=sha(previous),
            predecessorInputPinsSha256=sha(pin_path), featureCompositionSha256=sha(outputs[0]))
fresh_json(outputs[1], pins)
fresh_json(outputs[2], {'format': 'aux.standard-browser-source-projection.v4',
    'source': str(TREE), 'previousInputPinsSha256': sha(pin_path),
    'inputPinsSha256': sha(outputs[1]), 'compositionSha256': sha(outputs[0]),
    'filesProjected': len(prepared), 'stages': stage_evidence, 'additionalEvidence': additional,
    'nativeInputCount': len(pins['files']), 'featurePins': len(composition['inputPins']),
    'ownerCheckoutChanged': False, 'uiChanged': False, 'appExecuted': False,
    'productSigned': False, 'cleanRecoveryProven': False})
print('Projected exact native lifetime batch; accepted app/UI unchanged', flush=True)
raise SystemExit(subprocess.call([sys.executable,
    str(ROOT / 'docs/integration/proposed/browser-feature-expansion/integration/full-build.py'),
    '--snapshot', str(TREE.parent), '--input-pins', str(outputs[1]),
    '--require-input-pins', '--build', '--jobs', '8',
    '--receipt-name', 'unsigned-standard-profile-browser-build-20261024-a5'], cwd=ROOT))
