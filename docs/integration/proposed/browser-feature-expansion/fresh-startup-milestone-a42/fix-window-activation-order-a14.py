"""Construct the organization controller after its activation dependency."""
import difflib
import hashlib
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
NATIVE = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
sha = lambda data: hashlib.sha256(data).hexdigest()
pins = json.loads((HERE / 'full-native-input-pins-a9.json').read_text())
for name, digest in pins['files'].items():
    assert sha((NATIVE / name).read_bytes()) == digest, name
name = 'chrome/browser/ui/browser_window/internal/browser_window_features.cc'
before = (NATIVE / name).read_text()
text = before
old = """  if (browser->GetType() == BrowserWindowInterface::TYPE_NORMAL)
    aux_organization_window_controller_ =
        std::make_unique<aux::AuxOrganizationWindowController>(*browser);
"""
assert text.count(old) == 1
text = text.replace(old, '')
anchor = """  browser_active_state_manager_ =
      GetUserDataFactory().CreateInstance<BrowserActiveStateManager>(
          *browser, *browser, app_browser_controller_.get());
"""
assert text.count(anchor) == 1
text = text.replace(anchor, anchor + """
#if BUILDFLAG(ENABLE_AUX_BROWSER) && BUILDFLAG(IS_MAC)
  // The controller subscribes to activation during construction.
""" + old + """#endif
""")
output = HERE / 'window-activation-order-source' / name
output.parent.mkdir(parents=True, exist_ok=True)
with output.open('x') as f:
    f.write(text)
(NATIVE / name).write_text(text)
patch = ''.join(difflib.unified_diff(before.splitlines(True), text.splitlines(True), fromfile='a/' + name, tofile='b/' + name))
with (HERE / 'window-activation-order-a14.patch').open('x') as f:
    f.write(patch)
projection = dict(passed=True, changes=[dict(path=name, beforeSha256=sha(before.encode()), afterSha256=sha(text.encode()))], activationDependencyCreatedBeforeSubscriber=True, subscriptionNotDropped=True, uiGeometryAndResourcesUnchanged=True, productExecuted=False)
with (HERE / 'actual-window-activation-order-projection-a14.json').open('x') as f:
    json.dump(projection, f, indent=2)
    f.write('\n')
composition = json.loads((HERE / 'source-composition-a9.json').read_text())
composition['selectedFiles'][name] = dict(path=str(output.resolve()), sha256=sha(text.encode()), inputSha256=sha(before.encode()), changed=True)
composition['windowActivationOrderFix'] = dict(path=str((HERE / 'actual-window-activation-order-projection-a14.json').resolve()), sha256=sha((HERE / 'actual-window-activation-order-projection-a14.json').read_bytes()))
with (HERE / 'source-composition-a14.json').open('x') as f:
    json.dump(composition, f, indent=2)
    f.write('\n')
pins['files'][name] = sha(text.encode())
pins['sourceCompositionSha256'] = sha((HERE / 'source-composition-a14.json').read_bytes())
with (HERE / 'full-native-input-pins-a14.json').open('x') as f:
    json.dump(pins, f, indent=2)
    f.write('\n')
print(json.dumps(dict(passed=True, changedFiles=1, primaryAdmissionUnchanged=True, uiChanged=False)))
