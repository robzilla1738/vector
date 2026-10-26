"""Preserve the failed build and project only its proven CLI output repair."""
from pathlib import Path
import hashlib
import json
import os
from counted_projection import counted_anchors

HERE = Path(__file__).resolve().parent
PRIOR = Path('/private/tmp/aux-completion-browser-build-20261026-a2')
OUT = Path('/private/tmp/aux-completion-browser-build-20261026-a3')
REPAIR = HERE.parent / 'desktop/cli-safe-output'
sha = lambda data: hashlib.sha256(data).hexdigest()
plan = json.loads((PRIOR / 'projection.json').read_text())
native = Path(plan['source'])
for row in plan['files']:
    if sha((native / row['path']).read_bytes()) != row['outputSha256']:
        raise ValueError('Frozen browser source changed: ' + row['path'])
repair = json.loads((REPAIR / 'source-plan.json').read_text())
original = (native / repair['path']).read_bytes()
successor = (REPAIR / 'source' / repair['path']).read_bytes()
repair = {'files': [dict(repair, anchors=counted_anchors(original.decode(), successor.decode()))]}
for row in repair['files']:
    original = (native / row['path']).read_bytes()
    if sha(original) != row['inputSha256']:
        raise ValueError('CLI repair predecessor changed')
    text = original.decode()
    for anchor in row['anchors']:
        if text.count(anchor['before']) != anchor['expectedCount']:
            raise ValueError('CLI repair count drift')
        text = text.replace(anchor['before'], anchor['after'])
    successor = (REPAIR / 'source' / row['path']).read_bytes()
    if text.encode() != successor or sha(successor) != row['outputSha256']:
        raise ValueError('CLI repair output changed')
if OUT.exists():
    raise ValueError('Fresh CLI repair build output required')
OUT.mkdir(mode=0o700)
for row in repair['files']:
    name = row['path']
    target = native / name
    backup = OUT / 'preimages' / name
    backup.parent.mkdir(parents=True, exist_ok=True)
    backup.write_bytes(target.read_bytes())
    temporary = target.with_name(target.name + '.aux-cli-a3')
    with temporary.open('xb') as stream:
        stream.write((REPAIR / 'source' / name).read_bytes())
    temporary.chmod(target.stat().st_mode & 0o777)
    os.replace(temporary, target)
    record = next(item for item in plan['files'] if item['path'] == name)
    record['outputSha256'] = row['outputSha256']
    record['origins'].append(dict(plan=str(REPAIR / 'source-plan.json'), anchors=row['anchors']))
for row in plan['files']:
    target = OUT / 'source' / row['path']
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes((native / row['path']).read_bytes())
    target.chmod(row['mode'])
plan.update(output=str(OUT), parentProjectionSha256=sha((PRIOR / 'projection.json').read_bytes()),
            failedPredecessorReceipt=str(PRIOR / 'build-result.json'))
(OUT / 'projection.json').write_text(json.dumps(plan, indent=2) + '\n')
(HERE / 'browser-cli-repair-projection.json').write_text(json.dumps(plan, indent=2) + '\n')
print(json.dumps({'passed': True, 'nativeFiles': len(plan['files']), 'output': str(OUT)}))
