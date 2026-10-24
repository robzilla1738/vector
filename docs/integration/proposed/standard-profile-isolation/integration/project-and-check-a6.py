#!/usr/bin/env python3
"""Project only the real compiler correction, then compile changed boundary units."""
from pathlib import Path
import hashlib
import json
import os
import re
import subprocess
import time

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[4]
TREE = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
LANE = HERE.parent / 'content-policy-ack-v3'
OUT = TREE.parent / 'unsigned-standard-profile-browser-focused-20261024-a6'


def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def read(path):
    return json.loads(Path(path).read_text())


def fresh(path, value):
    with path.open('x') as stream:
        stream.write(json.dumps(value, indent=2) + '\n')


pin_path = HERE / 'full-native-input-pins-a5.json'
comp_path = HERE / 'browser-composition-a5.json'
pins, comp = read(pin_path), read(comp_path)
paths = [HERE / name for name in ['browser-composition-a6.json',
         'full-native-input-pins-a6.json', 'browser-projection-a6.json']]
assert not OUT.exists() and all(not p.exists() for p in paths)
for name, value in pins['files'].items():
    assert sha(TREE / name) == value, name
manifest = read(LANE / 'manifest.json')
rows = manifest['files']
assert len(rows) == 1
row = rows[0]
name = row['path']
assert pins['files'][name] == row['beforeSha256']
text = (TREE / name).read_text()
edits = read(LANE / 'anchors.json')
assert len(edits) == 1
for edit in edits:
    assert edit['path'] == name and edit['count'] == 1 and text.count(edit['old']) == 1
    text = text.replace(edit['old'], edit['new'])
source = LANE / 'source' / name
assert text.encode() == source.read_bytes() and sha(source) == row['afterSha256']
temporary = (TREE / name).with_name(Path(name).name + '.aux-a6-projection')
with temporary.open('xb') as stream:
    stream.write(text.encode())
os.replace(temporary, TREE / name)
comp.update(predecessorComposition={'path': str(comp_path), 'sha256': sha(comp_path)},
            files=[dict(row, source=str(source))],
            compilerCorrection={'path': str(LANE / 'manifest.json'), 'sha256': sha(LANE / 'manifest.json')})
comp['inputPins'][name] = pins['files'][name] = sha(source)
fresh(paths[0], comp)
pins.update(predecessorInputPinsSha256=sha(pin_path), featureCompositionSha256=sha(paths[0]))
fresh(paths[1], pins)
fresh(paths[2], {'format': 'aux.standard-browser-source-projection.v5',
    'inputPinsSha256': sha(paths[1]), 'compositionSha256': sha(paths[0]),
    'previousInputPinsSha256': sha(pin_path), 'filesProjected': 1, 'countedEdits': 1,
    'ownerCheckoutChanged': False, 'uiChanged': False, 'productSigned': False})
OUT.mkdir()
targets = [
    'obj/sandbox/mac/seatbelt/seatbelt_exec.o',
    'obj/chrome/browser/aux/platform/AuxContentPolicyBinding.o',
    'obj/chrome/browser/core/chrome_content_browser_client.o',
    'obj/content/public/browser/browser_sources/content_browser_client.o',
    'obj/content/browser/browser/child_process_launcher_helper_mac.o',
    'obj/chrome/browser/profiles/misc/profile_impl.o',
    'obj/chrome/browser/profiles/profile/profile.o',
    'obj/chrome/browser/devtools/devtools/devtools_browser_context_manager.o',
    'obj/chrome/browser/devtools/devtools/chrome_devtools_manager_delegate.o',
    'obj/content/public/browser/browser_sources/devtools_manager_delegate.o',
    'obj/content/browser/browser/storage_partition_impl.o',
    'obj/content/browser/browser/target_handler.o',
]
result = {'format': 'aux.standard-browser-focused.actual.v1', 'passed': False,
          'source': str(TREE), 'targets': targets, 'runs': [],
          'nativeInputPinsPath': str(paths[1]), 'nativeInputPinsSha256': sha(paths[1]),
          'appExecuted': False, 'productSigned': False, 'fullBrowserBuilt': False}


def verify():
    assert sha(paths[1]) == result['nativeInputPinsSha256']
    for name, value in pins['files'].items():
        assert sha(TREE / name) == value, name


def run(name, command):
    started = time.monotonic()
    with (OUT / (name + '.log')).open('x') as log:
        value = subprocess.run(command, cwd=TREE, stdout=log, stderr=subprocess.STDOUT)
    result['runs'].append({'name': name, 'command': command, 'exitCode': value.returncode,
                           'seconds': time.monotonic() - started})
    assert value.returncode == 0, name + ' failed'


try:
    verify()
    ninja = str(TREE / 'third_party/ninja/ninja')
    build = str(TREE / 'out/AuxFast')
    run('commands', [ninja, '-C', build, '-t', 'commands', *targets])
    commands = (OUT / 'commands.log').read_text()
    assert not re.search(r'(^|[ /])(?:codesign|productsign|notarytool)(?:\s|$)', commands, re.M)
    run('compile', [ninja, '-C', build, '-j8', *targets])
    verify()
    result.update(passed=True, objects={name: sha(TREE / 'out/AuxFast' / name) for name in targets})
except Exception as error:
    result['error'] = str(error)
finally:
    fresh(OUT / 'receipt.json', result)
print(json.dumps({k: result.get(k) for k in ['passed', 'error', 'fullBrowserBuilt']}))
raise SystemExit(0 if result['passed'] else 1)
