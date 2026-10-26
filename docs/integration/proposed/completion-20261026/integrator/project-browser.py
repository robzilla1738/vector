"""Compose counted browser successors, preserving every unowned native path."""
from pathlib import Path
import hashlib
import json
import os

HERE = Path(__file__).resolve().parent
BASE = HERE.parent
NATIVE = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
OUTPUT = Path('/private/tmp/aux-completion-browser-build-20261026-a1')
sha = lambda data: hashlib.sha256(data).hexdigest()
plans = [
    BASE / 'desktop/source-plan.json',
    BASE / 'desktop/pin-title-restore/source-plan.json',
    BASE / 'desktop/quick-window/source-plan.json',
    BASE / 'desktop/next-desktop/source-plan.json',
    BASE / 'desktop/next-desktop/routing-revalidation/source-plan.json',
    BASE / 'desktop/cli-readonly/source-plan.json',
    BASE / 'integration/chosen-file-lifetime/projection.json',
    HERE / 'native-host-counted.json',
    BASE / 'desktop/cli-readonly/root-integration.json',
    BASE / 'desktop/direct-launch/root-integration.json',
]
initial, current, modes, origins = {}, {}, {}, {}
for plan_path in plans:
    plan = json.loads(plan_path.read_text())
    root_join = plan.get('rootOwned', False)
    for row in plan['files']:
        name = row['path']
        if name.startswith('daemon/'):
            continue
        target = NATIVE / name
        if name not in initial:
            if target.is_symlink():
                raise ValueError('Native source link refused: ' + name)
            initial[name] = target.read_bytes() if target.exists() else None
            modes[name] = target.stat().st_mode & 0o777 if target.exists() else 0o644
            current[name] = initial[name]
            origins[name] = []
        before = row.get('inputSha256', row.get('before'))
        after = row.get('outputSha256', row.get('after'))
        data = current[name]
        if before != (sha(data) if data is not None else None):
            if not root_join or before != (sha(initial[name]) if initial[name] is not None else None):
                raise ValueError('Native source/predecessor changed: ' + name)
        text = data.decode() if data is not None else ''
        for anchor in row['anchors']:
            old = anchor.get('before', anchor.get('old', anchor.get('find')))
            new = anchor.get('after', anchor.get('new', anchor.get('replace')))
            count = anchor.get('expectedCount', anchor.get('count'))
            if text.count(old) != count:
                raise ValueError('Counted native anchor changed: ' + name)
            text = text.replace(old, new)
        if not root_join:
            successor = (Path(plan.get('overlayRoot', str(plan_path.parent / 'source'))) / name).read_bytes()
            if sha(successor) != after:
                raise ValueError('Native successor changed: ' + name)
            if before is not None and text.encode() != successor:
                raise ValueError('Native counted replay differs: ' + name)
            current[name] = successor
        else:
            current[name] = text.encode()
        origins[name].append(dict(plan=str(plan_path), planSha256=sha(plan_path.read_bytes()),
                                  expectedInputSha256=before, declaredOutputSha256=after,
                                  actualOutputSha256=sha(current[name])))

if OUTPUT.exists():
    raise ValueError('Fresh build output required: ' + str(OUTPUT))
OUTPUT.mkdir(mode=0o700)
records = []
# Validate the complete set before making any native source mutation.
for name, data in initial.items():
    target = NATIVE / name
    if (target.read_bytes() if target.exists() else None) != data:
        raise ValueError('Native source changed before projection: ' + name)
for name, data in current.items():
    original = initial[name]
    if original is not None:
        backup = OUTPUT / 'preimages' / name
        backup.parent.mkdir(parents=True, exist_ok=True)
        backup.write_bytes(original)
    frozen = OUTPUT / 'source' / name
    frozen.parent.mkdir(parents=True, exist_ok=True)
    frozen.write_bytes(data)
    frozen.chmod(modes[name])
    target = NATIVE / name
    target.parent.mkdir(parents=True, exist_ok=True)
    temporary = target.with_name(target.name + '.aux-completion-a1')
    with temporary.open('xb') as stream:
        stream.write(data)
    temporary.chmod(modes[name])
    os.replace(temporary, target)
    records.append(dict(path=name, inputSha256=sha(original) if original is not None else None,
                        outputSha256=sha(data), mode=modes[name], origins=origins[name]))
result = dict(format='aux.completion.browser-projection.v1', source=str(NATIVE), output=str(OUTPUT),
              files=records, unownedPathsChanged=False, productExecuted=False, signing=False)
(OUTPUT / 'projection.json').write_text(json.dumps(result, indent=2) + '\n')
(HERE / 'browser-projection.json').write_text(json.dumps(result, indent=2) + '\n')
print(json.dumps({'passed': True, 'nativeFiles': len(records), 'output': str(OUTPUT)}))
