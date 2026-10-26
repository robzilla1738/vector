"""Compile and link the reviewed fixed-image daemon without running or signing it."""
from pathlib import Path
import hashlib
import json
import subprocess
import sys
import time

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[4]
FIXED = HERE.parent / 'runtime/fixed-builtins'
recipe_path = Path(sys.argv[1]).resolve(strict=True) if len(sys.argv) == 2 else FIXED / 'daemon-recipe.json'
recipe = json.loads(recipe_path.read_text())
OUT = Path(recipe['output'])


def sha(path):
    value = hashlib.sha256()
    with Path(path).open('rb') as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b''):
            value.update(chunk)
    return value.hexdigest()


pins = {}
for key in ['headerAndIncludePins', 'retainedObjectAndLibraryHashes', 'sourceInputHashes']:
    pins.update(recipe[key])
for row in recipe['sourceReplacements']:
    pins[row['rootOutput']] = row['outputSha256']
for row in recipe['newSources']:
    pins[row['path']] = row['sha256']
for row in json.loads((FIXED / 'source.anchors.json').read_text()):
    before = (FIXED / 'baseline' / row['name']).read_text()
    if hashlib.sha256(before.encode()).hexdigest() != row['inputSha256']:
        raise ValueError('Fixed-image source preimage changed: ' + row['name'])
    for anchor in row['anchors']:
        if before.count(anchor['before']) != anchor['count']:
            raise ValueError('Fixed-image source count changed: ' + row['name'])
        before = before.replace(anchor['before'], anchor['after'])
    if before.encode() != (FIXED / 'source' / row['name']).read_bytes():
        raise ValueError('Fixed-image source replay differs: ' + row['name'])
for name, expected in pins.items():
    if sha(name) != expected:
        raise ValueError('Frozen daemon input changed: ' + name)
if OUT.exists():
    raise ValueError('Fresh daemon output required; preserve all previous receipts')
OUT.mkdir(mode=0o700)
recipe_hash = sha(recipe_path)
(OUT / 'recipe.json').write_text(json.dumps(recipe, indent=2) + '\n')
results = []
started = time.monotonic()
for index, command in enumerate(recipe['commands']):
    with (OUT / f'step-{index}.stdout').open('xb') as stdout, (OUT / f'step-{index}.stderr').open('xb') as stderr:
        step_started = time.monotonic()
        done = subprocess.run(command, cwd=REPO, stdout=stdout, stderr=stderr)
    results.append(dict(command=command, exitCode=done.returncode, seconds=time.monotonic() - step_started,
                        stdout=str(OUT / f'step-{index}.stdout'), stderr=str(OUT / f'step-{index}.stderr')))
    print(json.dumps(dict(step=index, exitCode=done.returncode)), flush=True)
    if done.returncode:
        break
for name, expected in pins.items():
    if sha(name) != expected:
        raise ValueError('Frozen daemon input changed during build: ' + name)
if sha(recipe_path) != recipe_hash:
    raise ValueError('Daemon recipe changed during build')
passed = len(results) == len(recipe['commands']) and all(row['exitCode'] == 0 for row in results)
result = dict(format='aux.completion.daemon-build.v1', passed=passed, results=results,
              seconds=time.monotonic() - started, recipe=str(recipe_path), recipeSha256=recipe_hash,
              inputPins=pins, productSigned=False, productExecuted=False, policyActivated=False)
if passed:
    binary = OUT / 'Aux Daemon'
    loads = subprocess.run(['/usr/bin/otool', '-l', str(binary)], capture_output=True, check=True).stdout
    if b'LC_CODE_SIGNATURE' in loads:
        raise ValueError('Daemon must remain unsigned')
    result.update(binary=str(binary), binarySha256=sha(binary), unsigned=True)
(OUT / 'build-result.json').write_text(json.dumps(result, indent=2) + '\n')
(HERE / 'daemon-build.json').write_text(json.dumps(result, indent=2) + '\n')
raise SystemExit(0 if passed else results[-1]['exitCode'])
