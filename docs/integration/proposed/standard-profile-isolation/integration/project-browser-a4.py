#!/usr/bin/env python3
"""Project the reviewed snapshot-race correction into only the isolated build tree."""
from pathlib import Path
import hashlib
import json
import os

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[4]
SOURCE = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
LANE = HERE.parent / 'browser-descendant-snapshot-race-a1'


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def write_new(path, value):
    with path.open('x') as stream:
        stream.write(json.dumps(value, indent=2) + '\n')


manifest = json.loads((LANE / 'manifest.json').read_text())
edits = json.loads((LANE / 'replacements.json').read_text())
pins = json.loads((HERE / 'full-native-input-pins-a3.json').read_text())
feature = json.loads((HERE / 'browser-composition-a3.json').read_text())
outputs = [HERE / name for name in [
    'browser-composition-a4.json', 'full-native-input-pins-a4.json',
    'browser-projection-a4.json']]
assert all(not path.exists() for path in outputs), 'Fresh evidence paths required'
assert len(manifest['files']) == 2 and len(edits) == 2
assert sha(LANE / 'change.patch') == manifest['patchSha256']
previous_receipt = SOURCE.parent / 'unsigned-standard-profile-browser-build-20261024-a3/receipt.json'
assert json.loads(previous_receipt.read_text())['passed'] is True, 'Finish prior frozen build before source mutation'
for name, digest in pins['files'].items():
    actual = SOURCE / name
    assert actual.is_file() and not actual.is_symlink() and sha(actual) == digest, name

prepared = {}
for row in manifest['files']:
    name = row['path']
    actual, baseline, successor = SOURCE / name, LANE / 'baseline' / name, LANE / 'source' / name
    assert pins['files'][name] == feature['inputPins'][name] == row['beforeSha256']
    assert sha(actual) == sha(baseline) == row['beforeSha256']
    text = baseline.read_text()
    for edit in [item for item in edits if item['path'] == name]:
        assert edit['count'] == 1 and text.count(edit['old']) == 1, name
        text = text.replace(edit['old'], edit['new'])
    assert text.encode() == successor.read_bytes() and sha(successor) == row['afterSha256']
    prepared[name] = successor.read_bytes()

# All source baselines and complete prior pins are checked before any mutation.
for name, data in prepared.items():
    actual = SOURCE / name
    temporary = actual.with_name(actual.name + '.aux-uncertainty-projection')
    with temporary.open('xb') as stream:
        stream.write(data)
    os.replace(temporary, actual)

feature['files'] = [dict(row, source=str(LANE / 'source' / row['path'])) for row in manifest['files']]
feature['predecessorComposition'] = {
    'path': str(HERE / 'browser-composition-a3.json'),
    'sha256': sha(HERE / 'browser-composition-a3.json')}
for row in manifest['files']:
    feature['inputPins'][row['path']] = pins['files'][row['path']] = row['afterSha256']
    assert sha(SOURCE / row['path']) == row['afterSha256']
write_new(outputs[0], feature)
pins['featureCompositionSha256'] = sha(outputs[0])
write_new(outputs[1], pins)
write_new(outputs[2], {
    'format': 'aux.standard-browser-source-projection.v3',
    'source': str(SOURCE), 'filesProjected': 2, 'countedEdits': 2,
    'previousInputPinsSha256': sha(HERE / 'full-native-input-pins-a3.json'),
    'inputPinsSha256': sha(outputs[1]), 'compositionSha256': sha(outputs[0]),
    'manifestSha256': sha(LANE / 'manifest.json'),
    'replacementsSha256': sha(LANE / 'replacements.json'),
    'nativeInputCount': len(pins['files']), 'featurePins': len(feature['inputPins']),
    'ownerCheckoutChanged': False, 'uiChanged': False, 'appExecuted': False,
    'productSigned': False, 'cleanRecoveryProven': False})
print('Projected two reviewed snapshot-race leaves; UI unchanged; recovery uncertainty retained')
