"""Join the finite browser file adapter only after its frozen predecessor builds."""
from pathlib import Path
import hashlib
import json
import os

HERE = Path(__file__).resolve().parent
PRIOR = Path('/private/tmp/aux-completion-browser-build-20261026-a6')
OUT = Path('/private/tmp/aux-completion-browser-build-20261026-a7')
sha = lambda value: hashlib.sha256(value).hexdigest()
prior_receipt = PRIOR / 'build-result.json'
if json.loads(prior_receipt.read_text()).get('passed') is not True:
    raise ValueError('Successful frozen predecessor build required')
plan = json.loads((PRIOR / 'projection.json').read_text())
native = Path(plan['source'])
rows = {row['path']: row for row in plan['files']}
contents = {}
for name, row in rows.items():
    data = (native / name).read_bytes()
    if sha(data) != row['outputSha256']:
        raise ValueError('Frozen browser input changed: ' + name)
    contents[name] = data
originals = dict(contents)
overlay_path = HERE.parent / 'desktop/browser-files/native-final-projection.json'
overlay = json.loads(overlay_path.read_text())
for row in overlay['files']:
    name = row['path']
    before = contents[name]
    if sha(before) != row['inputSha256']:
        raise ValueError('Browser file adapter predecessor changed: ' + name)
    text = before.decode()
    for anchor in row['anchors']:
        if text.count(anchor['before']) != anchor['count']:
            raise ValueError('Browser file adapter count changed: ' + name)
        text = text.replace(anchor['before'], anchor['after'])
    after = text.encode()
    if sha(after) != row['outputSha256']:
        raise ValueError('Browser file adapter replay changed: ' + name)
    contents[name] = after
    rows[name]['outputSha256'] = sha(after)
    rows[name]['origins'].append({'plan': str(overlay_path), 'anchors': row['anchors']})
if OUT.exists():
    raise ValueError('Fresh browser composition output required')
for name, before in originals.items():
    if (native / name).read_bytes() != before:
        raise ValueError('Browser source changed during preparation: ' + name)
OUT.mkdir(mode=0o700)
for name, after in contents.items():
    target = OUT / 'source' / name
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(after)
    target.chmod(rows[name]['mode'])
    if after == originals[name]:
        continue
    backup = OUT / 'preimages' / name
    backup.parent.mkdir(parents=True, exist_ok=True)
    backup.write_bytes(originals[name])
    live = native / name
    temporary = live.with_name(live.name + '.aux-completion-a7')
    with temporary.open('xb') as stream:
        stream.write(after)
    temporary.chmod(rows[name]['mode'])
    os.replace(temporary, live)
plan.update(files=list(rows.values()), output=str(OUT),
            parentProjectionSha256=sha((PRIOR / 'projection.json').read_bytes()),
            passedPredecessorReceipt=str(prior_receipt),
            passedPredecessorReceiptSha256=sha(prior_receipt.read_bytes()),
            overlaySha256=sha(overlay_path.read_bytes()))
encoded = json.dumps(plan, indent=2) + '\n'
(OUT / 'projection.json').write_text(encoded)
(HERE / 'browser-files-projection.json').write_text(encoded)
print(json.dumps({'passed': True, 'files': len(rows), 'changedFiles': len(overlay['files']), 'output': str(OUT)}))
