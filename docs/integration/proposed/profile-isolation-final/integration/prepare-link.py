#!/usr/bin/env python3
"""Freeze explicit checked replacements into the preceding unsigned link graph."""
import hashlib
import json
import sys
from pathlib import Path

def sha(path):
    with open(path, 'rb') as stream:
        return hashlib.file_digest(stream, 'sha256').hexdigest()

recipe_path = Path(sys.argv[1]).resolve()
recipe = json.loads(recipe_path.read_text())
base_path = Path(recipe['baseManifest']).resolve()
base = json.loads(base_path.read_text())
previous = json.loads(Path(recipe['baseReceipt']).read_text())
assert previous['passed'] and previous['inputsUnchanged']
assert previous['manifestSha256'] == sha(base_path)
out = Path(recipe['output'])
assert out.is_absolute() and not out.exists()
command = list(base['commands'][-1])
frozen = dict(base['frozenFiles'])
for replacement in recipe['replacements']:
    before, after = replacement['before'], replacement['after']
    assert command.count(before) == 1, before
    assert base['frozenFiles'][before] == replacement['beforeSha256']
    assert sha(after) == replacement['afterSha256'], after
    command[command.index(before)] = after
    frozen[after] = replacement['afterSha256']
for addition in recipe['additions']:
    path = addition['path']
    assert path not in command and sha(path) == addition['sha256'], path
    command.append(path)
    frozen[path] = addition['sha256']
for path, digest in recipe['checkedInputs'].items():
    assert sha(path) == digest, path
    frozen[path] = digest
for path in [recipe_path, base_path, Path(recipe['baseReceipt']), Path(__file__).resolve()]:
    frozen[str(path)] = sha(path)
command = [value.replace(base['output'], str(out)) for value in command]
assert command.count('-no_adhoc_codesign') == 1
assert command[command.index('-o') + 1] == str(out / 'Aux Daemon')
assert '-typecheck' not in command
sources = [Path(v).name for v in command if v.endswith('.swift')]
assert len(sources) == len(set(sources))
pins = {**base, 'format': 'aux.profile-isolation.final.link-inputs.v1',
        'output': str(out), 'commands': [command], 'frozenFiles': frozen,
        'swiftSourceCount': len(sources),
        'nativeObjectCount': sum(v.endswith('.o') for v in command),
        'policyFormat': recipe['policyFormat'],
        'privateDefinitions': sorted(set(base['privateDefinitions'] + recipe['additionalPrivateDefinitions'])),
        'acceptedAppChanged': False, 'activated': False}
target = Path(recipe['manifestOutput'])
with target.open('x') as stream:
    stream.write(json.dumps(pins, indent=2) + '\n')
print('Prepared exact successor link inputs; no activation, signing or execution')
