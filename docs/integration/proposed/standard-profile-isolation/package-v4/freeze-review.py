#!/usr/bin/env python3
"""Freeze the actual successful source/native checkpoint; no assembly or execution."""
from pathlib import Path
import hashlib
import json

HERE = Path(__file__).resolve().parent
SCOPE = HERE.parent


def read(path):
    return json.loads(Path(path).read_text())


def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def ref(path):
    path = Path(path).resolve()
    assert path.is_file() and not path.is_symlink(), str(path)
    return {'path': str(path), 'sha256': sha(path)}


def write_new(path, value):
    with path.open('x') as stream:
        stream.write(json.dumps(value, indent=2) + '\n')


review = read(HERE / 'review.template.json')
assert all(not (HERE / name).exists() for name in [
    'review.json', 'standard-review.json', 'runtime-helper-overlay.json']), 'Fresh review outputs required'
assert not Path(review['expectedApp']).exists(), 'Reserved output app already exists'
browser_ref = ref(review['inputs']['browserReceipt']['path'])
browser = read(browser_ref['path'])
assert browser['passed'] is True and browser['prepared'] is True
assert browser['appExecuted'] is False and browser['signed'] is False
assert browser['allInspectedMachoUnsigned'] is True and browser['appStableDuringInventory'] is True
projection_ref = ref(review['inputs']['projection']['path'])
projection = read(projection_ref['path'])
assert projection['format'] == 'aux.standard-daemon-projection.actual.v3'
assert projection['passed'] is True and projection['totalAnchorCountPerLeaf'] == 166
assert projection['productExecuted'] is False and projection['runtimeAuthorityGranted'] is False
output = Path(projection['output'])
composition = read(output / 'composition.json')
assert sha(output / 'composition.json') == projection['compositionSha256']
assert composition['passed'] is True and len(composition['helpers']) == 2

standard = read(SCOPE / 'package-review/review.json')
standard['purpose'] = 'Exact actual source/native integration review; not runtime acceptance'
standard['sourceProjection'] = projection
standard['exactSourceStages'] += ['refresh-and-skill', 'managed-producers', 'interactive-oauth']
standard['newStageAnchorCounts'].update({'refresh-and-skill': 15, 'managed-producers': 20, 'interactive-oauth': 13})
for helper in standard['runtimeHelpers']:
    actual = next(row for row in composition['helpers'] if row['kind'] == helper['kind'])
    for key in helper:
        if key != 'output':
            assert helper[key] == actual[key], 'Unrelated publisher helper change'
    helper['output'] = actual['output']
    assert sha(helper['output']) == helper['outputSha256']
standard['browser']['reservedReceipt'] = browser_ref['path']
standard['browser']['composition'] = ref(review['inputs']['standardNativeComposition']['path'])
standard['browser']['fullInputPins'] = ref(browser['nativeInputPinsPath'])
assert standard['browser']['fullInputPins']['sha256'] == browser['nativeInputPinsSha256']
# Preserve historical source/native inputs; append exact successor dependencies.
for path in [projection_ref['path'], output / 'composition.json', output / 'source-receipt.json',
             output / 'projected-entry/results.json', browser_ref['path'],
             standard['browser']['composition']['path'], browser['nativeInputPinsPath'],
             HERE / 'standard_verify.py', HERE / 'freeze-review.py']:
    row = ref(path)
    if row not in standard['reviewedInputs']:
        standard['reviewedInputs'].append(row)
write_new(HERE / 'standard-review.json', standard)

overlay = read(HERE / 'runtime-helper-overlay.template.json')
for helper in overlay['files']:
    actual = next(row for row in composition['helpers'] if row['kind'] == helper['kind'])
    assert all(actual[key] == value for key, value in helper.items())
write_new(HERE / 'runtime-helper-overlay.json', overlay)
for name, row in review['inputs'].items():
    actual = ref(row['path'])
    assert row['sha256'] is None or row == actual, 'Previously frozen input changed: ' + name
    review['inputs'][name] = actual
review['pendingInputs'] = []
review['preparationOnly'] = True
review['assembled'] = False
review['nativeLinkPending'] = False
assert review['expectedProjectionOutput'] == str(output)
write_new(HERE / 'review.json', review)
print('Frozen actual successful inputs; no assembly, runtime authority or app execution')
