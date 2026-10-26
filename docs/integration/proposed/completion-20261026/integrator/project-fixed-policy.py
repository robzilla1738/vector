"""Join the v10 policy schema/reader while preserving the browser-only variant."""
from pathlib import Path
import hashlib
import json
import os

HERE = Path(__file__).resolve().parent
FIXED = HERE.parent / 'runtime/fixed-builtins'
PRIOR = Path('/private/tmp/aux-completion-browser-build-20261026-a3')
OUT = Path('/private/tmp/aux-completion-browser-build-20261026-a4')
sha = lambda data: hashlib.sha256(data).hexdigest()
plan = json.loads((PRIOR / 'projection.json').read_text())
native = Path(plan['source'])
for row in plan['files']:
    if sha((native / row['path']).read_bytes()) != row['outputSha256']:
        raise ValueError('Frozen browser source changed: ' + row['path'])
anchors = json.loads((FIXED / 'source.anchors.json').read_text())
changes = []
for name in ['AuxFreshBootstrapPolicy.swift', 'AuxAuthenticatedChildParentPolicyReader.swift']:
    relative = 'chrome/browser/aux/native_peer_policy/' + name
    target = native / relative
    original = target.read_bytes()
    row = next(item for item in anchors if item['name'] == name)
    text = original.decode()
    for anchor in row['anchors']:
        if text.count(anchor['before']) != anchor['count']:
            raise ValueError('Policy join count drift: ' + name)
        text = text.replace(anchor['before'], anchor['after'])
    # This browser copy intentionally retains its existing image-path validator.
    # The daemon's separate lexical-validator repair is outside these v10 edits.
    changes.append(dict(path=relative, original=original, output=text.encode(),
                        anchors=row['anchors'], mode=target.stat().st_mode & 0o777))
if OUT.exists():
    raise ValueError('Fresh policy projection required')
OUT.mkdir(mode=0o700)
for row in changes:
    target = native / row['path']
    backup = OUT / 'preimages' / row['path']
    backup.parent.mkdir(parents=True, exist_ok=True)
    backup.write_bytes(row['original'])
    temporary = target.with_name(target.name + '.aux-policy-a4')
    with temporary.open('xb') as stream:
        stream.write(row['output'])
    temporary.chmod(row['mode'])
    os.replace(temporary, target)
    plan['files'].append(dict(path=row['path'], inputSha256=sha(row['original']),
                             outputSha256=sha(row['output']), mode=row['mode'],
                             origins=[dict(plan=str(FIXED / 'source.anchors.json'), anchors=row['anchors'])]))
for row in plan['files']:
    target = OUT / 'source' / row['path']
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes((native / row['path']).read_bytes())
    target.chmod(row['mode'])
plan.update(output=str(OUT), parentProjectionSha256=sha((PRIOR / 'projection.json').read_bytes()),
            passedPredecessorReceipt=str(PRIOR / 'build-result.json'))
(OUT / 'projection.json').write_text(json.dumps(plan, indent=2) + '\n')
(HERE / 'browser-fixed-policy-projection.json').write_text(json.dumps(plan, indent=2) + '\n')
print(json.dumps(dict(passed=True, nativeFiles=len(plan['files']), output=str(OUT))))
