"""Compose reviewed browser fixes atomically; preserve every changed preimage."""
from pathlib import Path
import hashlib
import json
import os
from counted_projection import counted_anchors

HERE = Path(__file__).resolve().parent
BATCH = HERE.parent
PRIOR = Path('/private/tmp/aux-completion-browser-build-20261026-a4')
OUT = Path('/private/tmp/aux-completion-browser-build-20261026-a5')
sha = lambda value: hashlib.sha256(value).hexdigest()
plan = json.loads((PRIOR / 'projection.json').read_text())
native = Path(plan['source'])
rows = {row['path']: row for row in plan['files']}
originals, contents = {}, {}


def capture(name):
    if name not in contents:
        originals[name] = (native / name).read_bytes()
        contents[name] = originals[name]
    return contents[name]


def apply(name, expected, successor, output_hash, origin, anchors):
    before = capture(name)
    if sha(before) != expected or sha(successor) != output_hash:
        raise ValueError('Browser stage pin changed: ' + name)
    replay = before.decode()
    for rule in anchors:
        find, replacement = rule['before'], rule['after']
        count = rule.get('count', rule.get('expectedCount'))
        if replay.count(find) != count:
            raise ValueError('Browser stage count changed: ' + name)
        replay = replay.replace(find, replacement)
    if replay.encode() != successor:
        raise ValueError('Browser stage replay differs: ' + name)
    contents[name] = successor
    if name not in rows:
        rows[name] = dict(path=name, inputSha256=sha(originals[name]), mode=(native / name).stat().st_mode & 0o777, origins=[])
    rows[name]['outputSha256'] = output_hash
    rows[name]['origins'].append(dict(plan=str(origin), anchors=anchors))


for row in plan['files']:
    if sha(capture(row['path'])) != row['outputSha256']:
        raise ValueError('Frozen browser input changed: ' + row['path'])
selected = BATCH / 'desktop/browser-selected-document'
for row in json.loads((selected / 'source-plan.json').read_text())['files']:
    apply(row['path'], row['inputSha256'], (selected / 'source' / row['path']).read_bytes(),
          row['outputSha256'], selected / 'source-plan.json', row['anchors'])
component = BATCH / 'desktop/browser-selected-component'
row = json.loads((component / 'source-plan.json').read_text())
after = (component / 'source' / row['path']).read_bytes()
apply(row['path'], row['inputSha256'], after, row['outputSha256'], component / 'source-plan.json',
      counted_anchors(capture(row['path']).decode(), after.decode()))
split = BATCH / 'integration/split-accessibility/source-plan.json'
for row in json.loads(split.read_text())['files']:
    text = capture(row['path']).decode()
    rules = [dict(before=rule['find'], after=rule['replace'], count=rule['count']) for rule in row['rules']]
    for rule in rules:
        if text.count(rule['before']) != rule['count']:
            raise ValueError('Split source drift: ' + row['path'])
        text = text.replace(rule['before'], rule['after'])
    apply(row['path'], row['inputSha256'], text.encode(), row['outputSha256'], split, rules)
fresh = HERE / 'fresh-successor-scope/source-plan.json'
for row in json.loads(fresh.read_text())['files']:
    if row['path'].startswith('daemon/'):
        continue
    before = capture(row['path']).decode()
    after = Path(row['output']).read_bytes()
    if before.count(row['oldNamespace']) != row['count']:
        raise ValueError('Fresh namespace count changed: ' + row['path'])
    apply(row['path'], row['inputSha256'], after, row['outputSha256'], fresh,
          [dict(before=row['oldNamespace'], after=row['newNamespace'], count=row['count'])])
name = 'chrome/browser/extensions/api/debugger/BUILD.gn'
before = capture(name)
find = '  deps = [\n    "//chrome/app:generated_resources",'
replacement = '  deps = [\n    "//chrome/browser/aux:platform",\n    "//chrome/app:generated_resources",'
if before.decode().count(find) != 1:
    raise ValueError('Debugger dependency anchor changed')
after = before.decode().replace(find, replacement).encode()
apply(name, sha(before), after, sha(after), Path(__file__), [dict(before=find, after=replacement, count=1)])
if OUT.exists():
    raise ValueError('Fresh combined browser output required')
for name, before in originals.items():
    if (native / name).read_bytes() != before:
        raise ValueError('Native source changed during preparation: ' + name)
OUT.mkdir(mode=0o700)
for name, after in contents.items():
    target = OUT / 'source' / name
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(after)
    target.chmod(rows[name]['mode'])
    if after != originals[name]:
        backup = OUT / 'preimages' / name
        backup.parent.mkdir(parents=True, exist_ok=True)
        backup.write_bytes(originals[name])
        live = native / name
        temporary = live.with_name(live.name + '.aux-completion-a5')
        with temporary.open('xb') as stream:
            stream.write(after)
        temporary.chmod(rows[name]['mode'])
        os.replace(temporary, live)
plan.update(files=list(rows.values()), output=str(OUT),
            parentProjectionSha256=sha((PRIOR / 'projection.json').read_bytes()),
            passedPredecessorReceipt=str(PRIOR / 'build-result.json'))
(OUT / 'projection.json').write_text(json.dumps(plan, indent=2) + '\n')
(HERE / 'browser-final-projection.json').write_text(json.dumps(plan, indent=2) + '\n')
print(json.dumps(dict(passed=True, nativeFiles=len(rows), changedFiles=sum(contents[name] != originals[name] for name in contents), output=str(OUT))))
