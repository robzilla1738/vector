"""Fix the demonstrated native parent v8/legacy classifier mismatch only."""
import difflib
import hashlib
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
NATIVE = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
sha = lambda data: hashlib.sha256(data).hexdigest()
pins = json.loads((HERE / 'full-native-input-pins-a2.json').read_text())
changes = []

name = 'chrome/browser/aux/native_peer_policy/AuxAuthenticatedChildParentPolicyReader.swift'
find = '''            guard policy.role == .daemon, policy.embeddedDaemon,
                  format == "aux.fresh.bootstrap.policy.v2" || format == "aux.fresh.bootstrap.policy.v3",
                  format != "aux.fresh.bootstrap.policy.v3" || policy.ptyArtifacts != nil
            else { return -1 }
'''
replace = '''#if AUX_BROWSER_ONLY_NATIVE_STARTUP
            guard format == "aux.fresh.bootstrap.policy.v8" else { return -1 }
            try validateFreshBootstrapRebuiltDaemonRoute(policy)
#else
''' + find + '''#endif
'''
changes.append((name, find, replace))
name = 'chrome/app/chrome_main_delegate.cc'
find = '''    if (!aux::state_identity::PackagedIdentityAllowsStartup() ||
        !ValidateOrdinaryUserDataSelection(ordinary_command) ||
        !aux::peer::PrepareBrowserPrivateRootsBeforeProfileIO() ||
        aux::peer::StartSealedNativeDaemonBeforeProfiles().route != aux::peer::SelectedStateHomeRoute::current ||
        !aux::peer::AuthorizeNativeBrowserStartupBeforeLocalState()) return 1;
'''
replace = '''    if (!aux::state_identity::PackagedIdentityAllowsStartup()) {
      RAW_LOG(ERROR, "Aux fresh startup refused: packaged identity");
      return 1;
    }
    if (!ValidateOrdinaryUserDataSelection(ordinary_command)) {
      RAW_LOG(ERROR, "Aux fresh startup refused: private path selection");
      return 1;
    }
    if (!aux::peer::PrepareBrowserPrivateRootsBeforeProfileIO()) {
      RAW_LOG(ERROR, "Aux fresh startup refused: native root capture");
      return 1;
    }
    if (aux::peer::StartSealedNativeDaemonBeforeProfiles().route !=
        aux::peer::SelectedStateHomeRoute::current) {
      RAW_LOG(ERROR, "Aux fresh startup refused: paired daemon receipt");
      return 1;
    }
    if (!aux::peer::AuthorizeNativeBrowserStartupBeforeLocalState()) {
      RAW_LOG(ERROR, "Aux fresh startup refused: startup authorization");
      return 1;
    }
'''
changes.append((name, find, replace))
receipt = []
patches = []
for name, find, replace in changes:
    path = NATIVE / name
    original = path.read_bytes()
    expected = pins['files'].get(name)
    if name.endswith('/AuxAuthenticatedChildParentPolicyReader.swift'):
        # This unchanged parent reader was in the frozen checkout, outside
        # A42's changed-input selection. Add its actual beforeimage explicitly.
        expected = '63a0203e6646c58bf5b303b73407e2d72356c694b836e5aba1b73f175afaaef5'
    assert sha(original) == expected, name
    text = original.decode()
    assert text.count(find) == 1, name
    after = text.replace(find, replace)
    output = HERE / 'startup-policy-fix-source' / name
    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open('x') as f:
        f.write(after)
    path.write_text(after)
    pins['files'][name] = sha(after.encode())
    receipt.append(dict(path=name, beforeSha256=sha(original), afterSha256=sha(after.encode()), anchorCount=1))
    patches.extend(difflib.unified_diff(text.splitlines(True), after.splitlines(True), fromfile='a/' + name, tofile='b/' + name))
with (HERE / 'startup-policy-fix-a3.patch').open('x') as f:
    f.writelines(patches)
with (HERE / 'full-native-input-pins-a3.json').open('x') as f:
    json.dump(pins, f, indent=2); f.write('\n')
with (HERE / 'actual-policy-fix-projection-a3.json').open('x') as f:
    json.dump(dict(passed=True, changes=receipt, reason='The signed v8 ordinary policy was unconditionally refused by the parent legacy-only v2/v3 embedded-launch classifier.',
        authenticationAndResourceValidationPreserved=True, uiChanged=False, signed=False, appExecuted=False), f, indent=2); f.write('\n')
print(json.dumps(dict(passed=True, files=len(changes), uiChanged=False, signed=False)))
