"""Project the paired native-user startup and ordinary-profile/CLI cohort.

Run only through scripts/native-build.py. No product execution or signing.
"""
from pathlib import Path
import hashlib
import json

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[4]
FEATURE = HERE.parent
NATIVE = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
sha = lambda path: hashlib.sha256(path.read_bytes()).hexdigest()
pins = json.loads((FEATURE/'local-completion-integration-a27/full-native-input-pins.json').read_text())
composition = json.loads((FEATURE/'local-completion-integration-a27/source-composition.json').read_text())
for name, digest in pins['files'].items():
    if sha(NATIVE/name) != digest:
        raise ValueError('Current native input changed: '+name)

plans = [FEATURE/name/'source-plan.json' for name in (
    'ordinary-profile-selectors-a28', 'ordinary-cli-routing-a29',
    'native-current-user-browser-pair-a29b', 'native-user-startup-a30')]
changes = {}
for plan_path in plans:
    for row in json.loads(plan_path.read_text())['files']:
        name = row['path']
        if name.startswith('/'):
            # A29b pins two real prior Swift owners outside the proposal tree.
            # Their selected product names are explicit, not inferred authority.
            name = 'chrome/browser/aux/native_peer_policy/'+Path(name).name
        target = NATIVE/name
        source_text = row['source']
        source = ROOT/source_text[source_text.index('docs/'):]
        if name in changes or sha(target) != row['inputSha256'] or sha(source) != row['outputSha256']:
            raise ValueError('Exact projection lineage mismatch: '+name)
        text = target.read_text()
        for anchor in row.get('anchors', []):
            before = anchor.get('before', anchor.get('find'))
            after = anchor.get('after', anchor.get('replace'))
            count = anchor.get('expectedCount', anchor.get('count'))
            if text.count(before) != count:
                raise ValueError('Counted anchor mismatch: '+name)
            text = text.replace(before, after)
        if text != source.read_text():
            raise ValueError('Exact replay differs: '+name)
        changes[name] = (target.read_bytes(), source.read_bytes(), source)

gn_changes = {
    'chrome/browser/aux/BUILD.gn': (
        '    frameworks = [ "Foundation.framework" ]\n    libs = [ "bsm" ]\n    # The reviewed global unsigned product config',
        '    defines = [ "AUX_BROWSER_ONLY_NATIVE_STARTUP=1" ]\n    frameworks = [ "Foundation.framework", "AppKit.framework" ]\n    libs = [ "bsm" ]\n    # The reviewed global unsigned product config'),
    'chrome/common/BUILD.gn': (
        '  defines = []\n\n  configs += [',
        '  defines = []\n  if (enable_aux_browser && is_mac) {\n    defines += [ "AUX_BROWSER_ONLY_NATIVE_STARTUP=1" ]\n  }\n\n  configs += [')}
for name, (before, after) in gn_changes.items():
    target = NATIVE/name
    text = target.read_text()
    if text.count(before) != 1:
        raise ValueError('Shared GN owner changed: '+name)
    changes[name] = (target.read_bytes(), text.replace(before, after).encode(), HERE/'source'/name)

# Freeze every before-image before any source mutation. The preceding A66
# complete unsigned app is already frozen independently of this working tree.
for name, (before, after, source) in changes.items():
    backup = HERE/'before'/name
    backup.parent.mkdir(parents=True, exist_ok=True)
    with backup.open('xb') as handle:
        handle.write(before)
    if name in gn_changes:
        source.parent.mkdir(parents=True, exist_ok=True)
        with source.open('xb') as handle:
            handle.write(after)

for name, (before, after, source) in changes.items():
    target = NATIVE/name
    if target.read_bytes() != before:
        raise ValueError('Input changed before write: '+name)
    target.write_bytes(after)
    pins['files'][name] = sha(target)
    composition['selectedFiles'][name] = dict(path=str(source), sha256=sha(target),
        inputSha256=hashlib.sha256(before).hexdigest(), changed=True)

composition['localCompletionA31'] = [dict(path=str(path), sha256=sha(path)) for path in plans]
with (HERE/'source-composition.json').open('x') as handle:
    json.dump(composition, handle, indent=2); handle.write('\n')
pins['sourceCompositionSha256'] = sha(HERE/'source-composition.json')
with (HERE/'full-native-input-pins.json').open('x') as handle:
    json.dump(pins, handle, indent=2); handle.write('\n')
receipt = dict(passed=True, projected=True, compiled=False, changedFiles=list(changes),
    sourceCompositionSha256=pins['sourceCompositionSha256'], inputCount=len(pins['files']),
    uiChanged=False, appExecuted=False, signing=False)
(HERE/'actual-projection.json').write_text(json.dumps(receipt, indent=2)+'\n')
print(json.dumps(receipt))
