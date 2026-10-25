"""Install the parent's explicit private paths without reopening them after seatbelt."""
import difflib
import hashlib
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
NATIVE = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
sha = lambda data: hashlib.sha256(data).hexdigest()
pins = json.loads((HERE / 'full-native-input-pins-a7.json').read_text())
for name, digest in pins['files'].items():
    assert sha((NATIVE / name).read_bytes()) == digest, name
name = 'chrome/app/chrome_main_delegate.cc'
before = (NATIVE / name).read_text()
text = before
old = '''      path.value() == "/" || base::MakeAbsoluteFilePath(path) != path) return false;
'''
new = '''      path.value() == "/") return false;
'''
assert text.count(old) == 1
text = text.replace(old, new)
old = '''  auto policy_path = path;
  policy::path_parser::CheckUserDataDirPolicy(&policy_path);
'''
new = '''  if (!command_line->GetSwitchValueASCII(switches::kProcessType).empty()) {
    // Helpers apply seatbelt in their executable before entering this framework.
    // Reopening the primary's private roots here is both unnecessary and denied
    // by that sandbox. Use only its explicit, lexically bounded paths; never
    // resolve a default, consult policy, create a directory or widen seatbelt.
    const auto app_data = path.DirName();
    const auto home = app_data.DirName().DirName();
    const auto cache = home.AppendASCII("Library/Caches");
    return base::PathService::OverrideAndCreateIfNeeded(base::DIR_HOME, home, true, false) &&
        base::PathService::OverrideAndCreateIfNeeded(base::DIR_APP_DATA, app_data, true, false) &&
        base::PathService::OverrideAndCreateIfNeeded(base::DIR_CACHE, cache, true, false) &&
        base::PathService::OverrideAndCreateIfNeeded(chrome::DIR_USER_DATA, path, true, false);
  }
  if (base::MakeAbsoluteFilePath(path) != path) return false;
  auto policy_path = path;
  policy::path_parser::CheckUserDataDirPolicy(&policy_path);
'''
assert text.count(old) == 1
text = text.replace(old, new)
output = HERE / 'sandboxed-profile-path-source' / name
output.parent.mkdir(parents=True, exist_ok=True)
with output.open('x') as f:
    f.write(text)
(NATIVE / name).write_text(text)
patch = ''.join(difflib.unified_diff(before.splitlines(True), text.splitlines(True), fromfile='a/' + name, tofile='b/' + name))
with (HERE / 'sandboxed-profile-path-a8.patch').open('x') as f:
    f.write(patch)
projection = dict(passed=True, changes=[dict(path=name, beforeSha256=sha(before.encode()), afterSha256=sha(text.encode()))], primaryNativeAdmissionAndFilesystemChecksPreserved=True, helpersUseOnlyExplicitPrivatePaths=True, helperFilesystemCreation=False, sandboxPermissionsChanged=False, uiChanged=False, signed=False, productExecuted=False)
with (HERE / 'actual-sandboxed-profile-path-projection-a8.json').open('x') as f:
    json.dump(projection, f, indent=2)
    f.write('\n')
composition = json.loads((HERE / 'source-composition-a7.json').read_text())
composition['selectedFiles'][name] = dict(path=str(output.resolve()), sha256=sha(text.encode()), inputSha256=sha(before.encode()), changed=True)
composition['sandboxedProfilePathFix'] = dict(path=str((HERE / 'actual-sandboxed-profile-path-projection-a8.json').resolve()), sha256=sha((HERE / 'actual-sandboxed-profile-path-projection-a8.json').read_bytes()))
with (HERE / 'source-composition-a8.json').open('x') as f:
    json.dump(composition, f, indent=2)
    f.write('\n')
pins['files'][name] = sha(text.encode())
pins['sourceCompositionSha256'] = sha((HERE / 'source-composition-a8.json').read_bytes())
with (HERE / 'full-native-input-pins-a8.json').open('x') as f:
    json.dump(pins, f, indent=2)
    f.write('\n')
print(json.dumps(dict(passed=True, changedFiles=1, primaryAdmissionUnchanged=True, uiChanged=False)))
