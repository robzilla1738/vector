#!/usr/bin/env python3
"""Compile one corrected observer and relink the successful credential tuple."""
from pathlib import Path
import hashlib
import json
import re
import shlex
import subprocess
import sys
import time

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[4]
LANE = HERE.parent / 'daemon-observer-reverse-coverage-a1'
BASE = HERE / 'daemon-link-a4-inputs.json'
REVIEW = LANE / 'compile-review.json'
LINK_OUT = Path('/private/tmp/aux-standard-daemon-link-20261024-a5')


def sha(path):
    with Path(path).open('rb') as stream:
        return hashlib.file_digest(stream, 'sha256').hexdigest()


review = json.loads(REVIEW.read_text())
overlay_path = LANE / 'overlay.json'
overlay = json.loads(overlay_path.read_text())
base = json.loads(BASE.read_text())
out = Path(review['outputDirectory'])
assert not out.exists() and not LINK_OUT.exists()
assert sha(REVIEW) == overlay['compileReviewSha256']
bp = review['baselinePlan']
assert sha(bp['path']) == bp['sha256']
plan = json.loads(Path(bp['path']).read_text())
assert review['baselineRow'] == next(x for x in plan['commands'] if x['name'] == 'observer')
command = review['successorRow']['command']
old_command = review['baselineRow']['command']
assert len(command) == len(old_command)
assert sum(a != b for a, b in zip(command, old_command)) == 3
pins = dict(base['frozenFiles'])
pins.update({str(REVIEW): sha(REVIEW), str(overlay_path): sha(overlay_path),
             str(BASE): sha(BASE), str(Path(__file__).resolve()): sha(__file__)})
for item in overlay['inputs']:
    assert sha(item['path']) == item['sha256']
    pins[item['path']] = item['sha256']
source = LANE / overlay['source']['path']
assert sha(source) == overlay['source']['afterSha256']
pins[str(source)] = sha(source)


def verify():
    for name, digest in pins.items():
        assert sha(name) == digest, 'Changed observer input: ' + name


verify()
out.mkdir(mode=0o700)
result = {'format': 'aux.daemon-observer-reverse.actual.v1', 'passed': False,
          'commands': [], 'compileReviewSha256': sha(REVIEW),
          'overlaySha256': sha(overlay_path), 'baseLinkInputsSha256': sha(BASE),
          'productExecuted': False, 'productSigned': False, 'runtimeAuthorityGranted': False}


def run(name, arguments):
    start = time.monotonic()
    with (out / (name + '.log')).open('x') as log:
        completed = subprocess.run(arguments, cwd=ROOT, stdout=log, stderr=subprocess.STDOUT)
    result['commands'].append({'name': name, 'command': arguments,
                              'exitCode': completed.returncode, 'seconds': time.monotonic() - start})
    print(name + ': ' + str(completed.returncode), flush=True)
    assert completed.returncode == 0, name + ' failed'


try:
    scan, index = [], 0
    while index < len(command):
        if command[index] in ['-o', '-MF']:
            index += 2
            continue
        if command[index] in ['-c', '-MMD']:
            index += 1
            continue
        scan.append(command[index])
        index += 1
    dep = out / 'observer.scan.d'
    run('dependencies', scan + ['-MM', '-MF', str(dep), '-MT', 'observer.o'])
    dependencies = shlex.split(re.sub(r'\\\n', ' ', dep.read_text()).split(':', 1)[1])
    for name in dependencies:
        path, digest = str(Path(name).resolve()), sha(name)
        assert path not in pins or pins[path] == digest
        pins[path] = digest
    verify()
    run('compile', command)
    verify()
    obj = Path(command[command.index('-o') + 1])
    pins[str(obj)] = sha(obj)
    old_obj = '/private/tmp/aux-standard-daemon-objects-20261023-a2/observer.o'
    assert sum(c.count(old_obj) for c in base['commands']) == 1
    old_out = base['output']
    commands = [[str(obj) if arg == old_obj else arg.replace(old_out, str(LINK_OUT))
                 for arg in c] for c in base['commands']]
    base.update(output=str(LINK_OUT), commands=commands, frozenFiles=pins,
                observerReverseSourceOverlay={'path': str(overlay_path), 'sha256': sha(overlay_path)},
                observerReverseCompileReview={'path': str(REVIEW), 'sha256': sha(REVIEW)},
                predecessorCredentialLinkInputs={'path': str(BASE), 'sha256': sha(BASE)},
                nativeObjectClosureChanged=True, activated=False)
    manifest = out / 'daemon-inputs.json'
    manifest.write_text(json.dumps(base, indent=2) + '\n')
    checker = HERE.parent.parent / 'profile-isolation-continuation/build/link-daemon.py'
    result.update(linkManifest=str(manifest), linkManifestSha256=sha(manifest))
    run('link', [sys.executable, str(checker), str(manifest)])
    verify()
    receipt = LINK_OUT / 'results.json'
    assert json.loads(receipt.read_text())['passed'] is True
    result.update(passed=True, dependencyCount=len(dependencies), objectSha256=sha(obj),
                  linkReceipt=str(receipt), linkReceiptSha256=sha(receipt))
except Exception as error:
    result['error'] = str(error)
finally:
    (out / 'results.json').write_text(json.dumps(result, indent=2) + '\n')
print(json.dumps({k: result.get(k) for k in ['passed', 'error', 'dependencyCount', 'linkReceipt']}))
raise SystemExit(0 if result['passed'] else 1)
