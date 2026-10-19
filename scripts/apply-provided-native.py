#!/usr/bin/env python3
"""Check, or explicitly apply, a pinned composed proposal under the native build lock."""
import argparse
import fcntl
import hashlib
import json
from pathlib import Path
import re
import shutil
import subprocess
import tempfile

repository = Path(__file__).resolve().parents[1]
sha = lambda raw: hashlib.sha256(raw).hexdigest()
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('composition', type=Path)
parser.add_argument('--apply', action='store_true')
options = parser.parse_args()
composition = options.composition.resolve()
report = json.loads((composition / 'manifest.json').read_text())
if report.get('version') != 1 or report.get('compiled') is not False or report.get('appliedToNative') is not False:
    raise ValueError('A checked, unapplied source composition is required')
native = Path(report['sourceRoot']).resolve()
patch = (composition / 'combined.patch').read_bytes()
if sha(patch) != report['combinedPatchSha256']:
    raise ValueError('Combined patch changed after composition')

def checked(path, root):
    relative = Path(path)
    if relative.is_absolute() or '..' in relative.parts or not relative.parts:
        raise ValueError('Unsafe composed target path')
    target = root / relative
    if target.resolve() != target:
        raise ValueError('Composed target traverses a symlink')
    return target

text_paths = set(re.findall(r'^\+\+\+ b/(.+)$', patch.decode(), re.M))
if text_paths != {item['path'] for item in report['files']}:
    raise ValueError('Combined patch coverage differs from pinned targets')
if not set(re.findall(r'^--- a/(.+)$', patch.decode(), re.M)).issubset(text_paths):
    raise ValueError('Combined patch attempts an unreported removal')
changes = [(item['path'], item['sourceSha256'], item['outputSha256'], None) for item in report['files']]
changes.extend((item['target'], item['baselineSha256'], item['replacementSha256'], item['replacement']) for item in report['binaryAssets'])
if len({item[0] for item in changes}) != len(changes):
    raise ValueError('Duplicate composed source target')

def validate():
    for path, before, after, replacement in changes:
        target = checked(path, native)
        if target.exists() and not target.is_file():
            raise ValueError('Native target is not a regular file')
        actual = sha(target.read_bytes()) if target.exists() else None
        if actual != before:
            raise ValueError(f'Native source changed: {path}')
        if replacement and sha(checked(replacement, repository).read_bytes()) != after:
            raise ValueError('Native artwork replacement changed')
    subprocess.run(['git', 'apply', '--check', '-'], input=patch, cwd=native, check=True)

if not options.apply:
    validate()
    print(json.dumps({'checked': len(changes), 'applied': False, 'compiled': False}))
    raise SystemExit(0)

# Never edit sources while any build is live; do not wait or reclaim its lock.
with open('/tmp/aux-build.lock', 'a') as lock:
    try:
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
    except BlockingIOError:
        raise SystemExit('Native build lock is active; proposal was not applied')
    validate()
    backup = Path(tempfile.mkdtemp(prefix='native-before-apply-', dir=composition))
    for path, before, _, _ in changes:
        if before is not None:
            target = backup / path
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(native / path, target)
    # All preexisting target bytes are backed up before any source mutation.
    journal = {'version': 1, 'compiled': False, 'applied': False, 'backup': str(backup),
               'compositionSha256': sha((composition / 'manifest.json').read_bytes()), 'targets': [item[0] for item in changes]}
    receipt = backup / 'apply-receipt.json'
    receipt.write_text(json.dumps(journal, indent=2) + '\n')
    subprocess.run(['git', 'apply', '-'], input=patch, cwd=native, check=True)
    for path, _, _, replacement in changes:
        if replacement:
            shutil.copyfile(repository / replacement, native / path)
    for path, _, after, _ in changes:
        if sha((native / path).read_bytes()) != after:
            raise ValueError(f'Applied source hash mismatch; inspect backup: {path}')
    journal['applied'] = True
    receipt.write_text(json.dumps(journal, indent=2) + '\n')
    print(json.dumps({'applied': len(changes), 'compiled': False, 'backup': str(backup), 'receipt': str(receipt)}))
