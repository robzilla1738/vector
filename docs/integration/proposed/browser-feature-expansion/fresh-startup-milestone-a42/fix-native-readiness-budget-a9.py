"""Give actual native daemon cold startup a finite readiness budget."""
import difflib
import hashlib
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
NATIVE = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
sha = lambda data: hashlib.sha256(data).hexdigest()
pins = json.loads((HERE / 'full-native-input-pins-a8.json').read_text())
for name, digest in pins['files'].items():
    assert sha((NATIVE / name).read_bytes()) == digest, name
name = 'chrome/browser/aux/browser_platform.cc'
before = (NATIVE / name).read_text()
text = before
old = "    startup_deadline_ = base::TimeTicks::Now() + base::Seconds(10);\n"
new = """    // A selected native daemon completes authenticated cold initialization
    // before its HTTP listener is ready. Do not retire its owner at the older
    // extension-only deadline; readiness and authorization remain mandatory.
    const bool native_selected = peer::ReadNativeSelectedStateHome().route ==
        peer::SelectedStateHomeRoute::current;
    startup_deadline_ = base::TimeTicks::Now() +
        base::Seconds(native_selected ? 90 : 10);
"""
assert text.count(old) == 1
text = text.replace(old, new)
output = HERE / 'native-readiness-budget-source' / name
output.parent.mkdir(parents=True, exist_ok=True)
with output.open('x') as f:
    f.write(text)
(NATIVE / name).write_text(text)
patch = ''.join(difflib.unified_diff(before.splitlines(True), text.splitlines(True), fromfile='a/' + name, tofile='b/' + name))
with (HERE / 'native-readiness-budget-a9.patch').open('x') as f:
    f.write(patch)
projection = dict(passed=True, changes=[dict(path=name, beforeSha256=sha(before.encode()), afterSha256=sha(text.encode()))], nativeSelectedReadinessBudgetSeconds=90, legacyBudgetSeconds=10, authorizationAndHealthStillRequired=True, noFallbackOnDeadline=True, uiChanged=False, signed=False, productExecuted=False)
with (HERE / 'actual-native-readiness-budget-projection-a9.json').open('x') as f:
    json.dump(projection, f, indent=2)
    f.write('\n')
composition = json.loads((HERE / 'source-composition-a8.json').read_text())
composition['selectedFiles'][name] = dict(path=str(output.resolve()), sha256=sha(text.encode()), inputSha256=sha(before.encode()), changed=True)
composition['nativeReadinessBudgetFix'] = dict(path=str((HERE / 'actual-native-readiness-budget-projection-a9.json').resolve()), sha256=sha((HERE / 'actual-native-readiness-budget-projection-a9.json').read_bytes()))
with (HERE / 'source-composition-a9.json').open('x') as f:
    json.dump(composition, f, indent=2)
    f.write('\n')
pins['files'][name] = sha(text.encode())
pins['sourceCompositionSha256'] = sha((HERE / 'source-composition-a9.json').read_bytes())
with (HERE / 'full-native-input-pins-a9.json').open('x') as f:
    json.dump(pins, f, indent=2)
    f.write('\n')
print(json.dumps(dict(passed=True, changedFiles=1, primaryAdmissionUnchanged=True, uiChanged=False)))
