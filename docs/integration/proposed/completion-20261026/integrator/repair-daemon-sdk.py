"""Preserve successful objects; add the missing SDK to two consumer commands."""
from pathlib import Path
import hashlib
import json

HERE = Path(__file__).resolve().parent
FIXED = HERE.parent / 'runtime/fixed-builtins'
original = json.loads((FIXED / 'daemon-recipe.json').read_text())
prior = Path(original['output'])
receipt = json.loads((prior / 'build-result.json').read_text())
if receipt['passed'] or [row['exitCode'] for row in receipt['results']] != [0, 0, 0, 0, 1]:
    raise ValueError('Exact four-object successful predecessor required')
def sha(path):
    value = hashlib.sha256()
    with Path(path).open('rb') as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b''):
            value.update(chunk)
    return value.hexdigest()
if sha(FIXED / 'daemon-recipe.json') != receipt['recipeSha256']:
    raise ValueError('Predecessor recipe changed')
output = Path('/private/tmp/aux-completion-daemon-fixed-builtins-20261026-a2')
if output.exists():
    raise ValueError('Fresh repaired daemon directory required')
sdk = original['commands'][0][original['commands'][0].index('-isysroot') + 1]
retained = {}
for row in receipt['results'][:4]:
    command = row['command']
    name = command[command.index('-o') + 1]
    retained[name] = sha(name)
commands = []
for command in original['commands'][4:]:
    command = list(command)
    if any(item.endswith('AuxLoadedPdfLifetime.cc') or item.endswith('AuxLoadedUtilityLifetime.cc') for item in command):
        command[1:1] = ['-isysroot', sdk]
    command = [item if item in retained else item.replace(str(prior), str(output)) for item in command]
    commands.append(command)
original.update(output=str(output), commands=commands,
                predecessorFailedBuild=str(prior / 'build-result.json'), predecessorFailedBuildSha256=sha(prior / 'build-result.json'),
                retainedSuccessfulObjects=retained)
original['retainedObjectAndLibraryHashes'].update(retained)
(HERE / 'daemon-sdk-repair-recipe.json').write_text(json.dumps(original, indent=2) + '\n')
(HERE / 'daemon-build-a1.json').write_text(json.dumps(receipt, indent=2) + '\n')
print(json.dumps(dict(commands=len(commands), retainedSuccessfulObjects=len(retained), sdk=sdk)))
