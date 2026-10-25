"""Retain fdopendir ownership transfer while acknowledging ScopedFD::release."""
from pathlib import Path
import hashlib
import json

HERE = Path(__file__).resolve().parent
PREVIOUS = HERE.parent/'local-completion-integration-a31'
NATIVE = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
pins = json.loads((PREVIOUS/'full-native-input-pins.json').read_text())
composition = json.loads((PREVIOUS/'source-composition.json').read_text())
for name, digest in pins['files'].items():
    if sha(NATIVE/name) != digest:
        raise ValueError('Native input changed: '+name)
name = 'chrome/browser/aux/AuxNativeParentColdLaunch.cc'
target = NATIVE/name
before = target.read_text()
needle = '  duplicate.release();\n'
assert before.count(needle) == 1
after = before.replace(needle, '  static_cast<void>(duplicate.release());\n')
source = HERE/'source'/name
source.parent.mkdir(parents=True)
source.write_text(after)
target.write_text(after)
pins['files'][name] = sha(target)
composition['selectedFiles'][name] = dict(path=str(source), sha256=sha(target),
    inputSha256=hashlib.sha256(before.encode()).hexdigest(), changed=True)
composition['nativeDirectoryHandleTransferCompileFix'] = dict(path=name,
    beforeSha256=hashlib.sha256(before.encode()).hexdigest(), afterSha256=sha(target),
    behaviorChanged=False, rejectedBuild='unsigned-native-user-browser-build-20261025-a67')
with (HERE/'source-composition.json').open('x') as handle:
    json.dump(composition, handle, indent=2); handle.write('\n')
pins['sourceCompositionSha256'] = sha(HERE/'source-composition.json')
with (HERE/'full-native-input-pins.json').open('x') as handle:
    json.dump(pins, handle, indent=2); handle.write('\n')
print(json.dumps(dict(projected=True, changedFiles=[name], uiChanged=False, signed=False)))
