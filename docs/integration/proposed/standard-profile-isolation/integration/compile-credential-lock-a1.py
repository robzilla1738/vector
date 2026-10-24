#!/usr/bin/env python3
"""Compile/relink exact private credential lease inputs; run under native-build.py."""
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
LANE = HERE.parent / 'native-credential-lock-a1'
REVIEW = LANE / 'compile-review.json'
BASE = HERE / 'daemon-link-a3-inputs.json'
LINK_OUT = Path('/private/tmp/aux-standard-daemon-link-20261024-a4')


def sha(path):
    with Path(path).open('rb') as stream:
        return hashlib.file_digest(stream, 'sha256').hexdigest()


review = json.loads(REVIEW.read_text())
overlay_path = LANE / 'overlay.json'
overlay = json.loads(overlay_path.read_text())
base = json.loads(BASE.read_text())
out = Path(review['output'])
assert not out.exists() and not LINK_OUT.exists(), 'Fresh output required'
assert sha(REVIEW) == overlay['compileReviewSha256']
assert sha(review['basePlan']) == review['basePlanSha256']
old_plan = json.loads(Path(review['basePlan']).read_text())
assert review['baseCommand'] == next(x['command'] for x in old_plan['commands'] if x['name'] == 'worker-host')
assert review['command'][0] == review['baseCommand'][0]
pins = dict(base['frozenFiles'])
pins.update({str(REVIEW): sha(REVIEW), str(overlay_path): sha(overlay_path),
             str(BASE): sha(BASE), str(Path(__file__).resolve()): sha(__file__)})
for item in overlay['sourceFiles'] + overlay['inputs']:
    path = Path(item['path'])
    if not path.is_absolute():
        path = ROOT / path
    assert sha(path) == item['sha256'], str(path)
    pins[str(path)] = item['sha256']


def verify():
    for name, digest in pins.items():
        assert sha(name) == digest, 'Changed native input: ' + name


verify()
out.mkdir(mode=0o700)
result = {'format': 'aux.chatgpt-credential-native.actual.v1', 'passed': False,
          'commands': [], 'compileReviewSha256': sha(REVIEW),
          'overlaySha256': sha(overlay_path), 'baseLinkInputsSha256': sha(BASE),
          'productExecuted': False, 'productSigned': False, 'runtimeAuthorityGranted': False}


def run(name, command):
    started = time.monotonic()
    with (out / (name + '.log')).open('x') as log:
        completed = subprocess.run(command, cwd=ROOT, stdout=log, stderr=subprocess.STDOUT)
    result['commands'].append({'name': name, 'command': command,
                              'exitCode': completed.returncode,
                              'seconds': time.monotonic() - started})
    print(name + ': ' + str(completed.returncode), flush=True)
    assert completed.returncode == 0, name + ' failed'


try:
    command = review['command']
    scan = []
    i = 0
    while i < len(command):
        if command[i] in ['-o', '-MF']:
            i += 2
            continue
        if command[i] in ['-c', '-MMD']:
            i += 1
            continue
        scan.append(command[i])
        i += 1
    dep = out / 'worker-host.scan.d'
    scan += ['-MM', '-MF', str(dep), '-MT', 'worker-host.o']
    run('dependencies', scan)
    raw = re.sub(r'\\\n', ' ', dep.read_text())
    dependencies = shlex.split(raw.split(':', 1)[1])
    assert str(LANE / 'source/AuxChatGPTCredentialLock.inc') in dependencies
    for name in dependencies:
        path = str(Path(name).resolve())
        digest = sha(path)
        assert path not in pins or pins[path] == digest, path
        pins[path] = digest
    verify()
    run('compile', command)
    verify()
    obj = out / 'worker-host.o'
    pins[str(obj)] = sha(obj)
    old_obj = '/private/tmp/aux-standard-daemon-objects-20261023-a2/worker-host.o'
    assert sum(c.count(old_obj) for c in base['commands']) == 1
    previous_out = base['output']
    commands = [[str(obj) if arg == old_obj else arg.replace(previous_out, str(LINK_OUT))
                 for arg in c] for c in base['commands']]
    base.update(output=str(LINK_OUT), commands=commands, frozenFiles=pins,
                credentialLockSourceOverlay={'path': str(overlay_path), 'sha256': sha(overlay_path)},
                credentialLockCompileReview={'path': str(REVIEW), 'sha256': sha(REVIEW)},
                predecessorLinkInputs={'path': str(BASE), 'sha256': sha(BASE)},
                nativeObjectClosureChanged=True, activated=False)
    manifest = out / 'daemon-inputs.json'
    manifest.write_text(json.dumps(base, indent=2) + '\n')
    result['linkManifest'] = str(manifest)
    result['linkManifestSha256'] = sha(manifest)
    checker = HERE.parent.parent / 'profile-isolation-continuation/build/link-daemon.py'
    run('link', [sys.executable, str(checker), str(manifest)])
    verify()
    link = LINK_OUT / 'results.json'
    assert json.loads(link.read_text())['passed'] is True
    result.update(passed=True, dependencyCount=len(dependencies),
                  objectSha256=sha(obj), linkReceipt=str(link), linkReceiptSha256=sha(link))
except Exception as error:
    result['error'] = str(error)
finally:
    (out / 'results.json').write_text(json.dumps(result, indent=2) + '\n')
print(json.dumps({k: result.get(k) for k in ['passed', 'error', 'dependencyCount', 'linkReceipt']}))
raise SystemExit(0 if result['passed'] else 1)
