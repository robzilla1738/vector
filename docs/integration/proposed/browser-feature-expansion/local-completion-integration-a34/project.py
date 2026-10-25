"""Compose the reviewed popup ownership and native-close ordering fixes."""
from pathlib import Path
import hashlib
import json

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[4]
FEATURE = HERE.parent
PREVIOUS = FEATURE/'local-completion-integration-a32'
NATIVE = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
sha = lambda p: hashlib.sha256(Path(p).read_bytes()).hexdigest()
pins = json.loads((PREVIOUS/'full-native-input-pins.json').read_text())
composition = json.loads((PREVIOUS/'source-composition.json').read_text())
for name, digest in pins['files'].items():
    if sha(NATIVE/name) != digest:
        raise ValueError('Native input changed: '+name)
name = 'chrome/browser/ui/views/frame/aux_sidebar_view.cc'
before = (NATIVE/name).read_text()
text = before
plans = [FEATURE/folder/'source-plan.json' for folder in (
    'organization-popup-lifetime-a32', 'organization-popup-lifetime-a32b')]
for path in plans:
    plan = json.loads(path.read_text())
    assert len(plan['files']) == 1
    row = plan['files'][0]
    assert row['path'] == name
    assert hashlib.sha256(text.encode()).hexdigest() == row['inputSha256']
    for anchor in row['anchors']:
        assert text.count(anchor['find']) == anchor['count']
        text = text.replace(anchor['find'], anchor['replace'])
    source = ROOT/row['source'][row['source'].index('docs/'):]
    assert text == source.read_text()
    assert hashlib.sha256(text.encode()).hexdigest() == row['outputSha256']

(NATIVE/name).write_text(text)
pins['files'][name] = sha(NATIVE/name)
composition['selectedFiles'][name] = dict(path=str(source),sha256=sha(source),
    inputSha256=hashlib.sha256(before.encode()).hexdigest(), changed=True)
composition['popupNativeCloseOwnershipA34'] = [dict(path=str(path),sha256=sha(path)) for path in plans]
with (HERE/'source-composition.json').open('x') as handle:
    json.dump(composition,handle,indent=2);handle.write('\n')
pins['sourceCompositionSha256'] = sha(HERE/'source-composition.json')
with (HERE/'full-native-input-pins.json').open('x') as handle:
    json.dump(pins,handle,indent=2);handle.write('\n')
print(json.dumps(dict(projected=True,changedFiles=[name],styleValuesChanged=False,
    appExecuted=False,signing=False)))
