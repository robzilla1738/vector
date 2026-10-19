#!/usr/bin/env python3
"""Compose a pinned follow-up atop an applied composition without editing source."""
import argparse
import hashlib
import json
from pathlib import Path
import re
import subprocess
import tempfile

repository = Path(__file__).resolve().parents[1]
sha = lambda raw: hashlib.sha256(raw).hexdigest()
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('base', type=Path)
parser.add_argument('--patch', type=Path, required=True)
parser.add_argument('--metadata', type=Path, required=True)
parser.add_argument('--output', type=Path, required=True)
options = parser.parse_args()
base_raw = (options.base.resolve() / 'manifest.json').read_bytes()
base = json.loads(base_raw)
native = Path(base['sourceRoot']).resolve()
output = options.output.resolve()
if output.exists() or output == native or native in output.parents or output in native.parents:
    raise ValueError('A fresh composition outside the native checkout is required')

def safe(path):
    path = Path(path)
    if path.is_absolute() or '..' in path.parts or not path.parts:
        raise ValueError('Unsafe native follow-up path')
    return path

before = {}
for item in base['files']:
    path = safe(item['path'])
    absolute = native / path
    if absolute.resolve() != absolute or not absolute.is_file():
        raise ValueError('Applied base file is not a regular canonical source')
    raw = absolute.read_bytes()
    if sha(raw) != item['outputSha256']:
        raise ValueError(f'Applied composition drift: {path}')
    before[path] = raw
for item in base['binaryAssets']:
    path = native / safe(item['target'])
    if path.resolve() != path or sha(path.read_bytes()) != item['replacementSha256']:
        raise ValueError('Applied artwork differs from base')
patch = options.patch.read_bytes()
metadata = json.loads(options.metadata.read_bytes())
items = metadata['files']
paths = {safe(value) for value in re.findall(r'^\+\+\+ b/(.+)$', patch.decode(), re.M)}
if paths != {safe(item['path']) for item in items}:
    raise ValueError('Follow-up patch and metadata coverage differ')
for item in items:
    path = safe(item['path'])
    if path not in before:
        absolute = native / path
        if absolute.resolve() != absolute:
            raise ValueError('Follow-up input traverses a symlink')
        before[path] = absolute.read_bytes() if absolute.exists() else None
    expected = item.get('baselineSha256', item.get('sourceSha256'))
    if (sha(before[path]) if before[path] is not None else None) != expected:
        raise ValueError(f'Pinned follow-up input differs: {path}')

with tempfile.TemporaryDirectory(prefix='aux-native-followup-') as directory:
    copy = Path(directory)
    for path, raw in before.items():
        if raw is not None:
            (copy / path).parent.mkdir(parents=True, exist_ok=True)
            (copy / path).write_bytes(raw)
    subprocess.run(['git', 'apply', '--check', '-'], input=patch, cwd=copy, check=True)
    subprocess.run(['git', 'apply', '-'], input=patch, cwd=copy, check=True)
    for item in items:
        expected = item.get('outputSha256', item.get('proposedSha256'))
        if not expected or sha((copy / safe(item['path'])).read_bytes()) != expected:
            raise ValueError('Follow-up output does not match its recorded implementation')
    result = dict(base)
    result.update(compiled=False, appliedToNative=False, combinedPatchSha256=sha(patch),
                  parentCompositionSha256=sha(base_raw), parentComposition=str(options.base.resolve()))
    result['steps'] = [*base['steps'], {'patch': str(options.patch.resolve()), 'sha256': sha(patch), 'application': 'incremental-after-verified-base', 'metadataSha256': sha(options.metadata.read_bytes())}]
    result['files'] = [{'path': str(path), 'sourceSha256': sha(raw) if raw is not None else None,
                        'outputSha256': sha((copy / path).read_bytes())} for path, raw in sorted(before.items())]
    result['binaryAssets'] = [dict(item, baselineSha256=item['replacementSha256'], parentBaselineSha256=item['baselineSha256']) for item in base['binaryAssets']]
    output.mkdir(parents=True)
    (output / 'combined.patch').write_bytes(patch)
    (output / 'manifest.json').write_text(json.dumps(result, indent=2) + '\n')
print(json.dumps({'output': str(output), 'changedSources': len(paths), 'verifiedSources': len(before), 'applied': False, 'compiled': False}))
