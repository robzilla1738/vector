"""Pin/replay popup retirement state without native shortcut or window actions."""
import hashlib
import json
from pathlib import Path
import struct
import subprocess
import tempfile

root = Path(__file__).resolve().parent
manifest = json.loads((root / 'manifest.json').read_text())
evidence = json.loads((root / 'source-evidence.json').read_text())

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

for row in evidence['inputs']:
    assert sha(Path(row['path'])) == row['sha256'], row['path']
framework = Path(evidence['framework']['path'])
assert sha(framework) == evidence['framework']['sha256']
universal = framework.read_bytes()
for i in range(struct.unpack_from('>I', universal, 4)[0]):
    cpu, _, offset, size, _ = struct.unpack_from('>IIIII', universal, 8 + i * 20)
    if cpu == 0x100000c:
        arm = universal[offset:offset + size]
        break
else:
    raise AssertionError('Missing arm64 input')
assert hashlib.sha256(arm).hexdigest() == evidence['framework']['arm64Sha256']
sections = []
pos = 32
for _ in range(struct.unpack_from('<I', arm, 16)[0]):
    cmd, size = struct.unpack_from('<II', arm, pos)
    if cmd == 0x19:
        for i in range(struct.unpack_from('<I', arm, pos + 64)[0]):
            sections.append(struct.unpack_from('<QQI', arm, pos + 72 + i * 80 + 32))
    pos += size
for row in evidence['functions']:
    address = int(row['rva'], 16)
    start, _, offset = next(s for s in sections if s[0] <= address < s[0] + s[1])
    data = arm[offset + address - start:offset + address - start + row['bytes']]
    assert hashlib.sha256(data).hexdigest() == row['sha256']
with tempfile.TemporaryDirectory(prefix='aux-popup-reopen-') as directory:
    replay = Path(directory)
    subprocess.run(['git', 'init', '-q', directory], check=True)
    for row in manifest['files']:
        path = row['path']
        assert sha(root / 'baseline' / path) == row['baselineSha256']
        assert sha(root / 'source' / path) == row['outputSha256']
        out = replay / path
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_bytes((root / 'baseline' / path).read_bytes())
    subprocess.run(['git', 'apply', '--check', str(root / 'native.patch')], cwd=replay, check=True)
    subprocess.run(['git', 'apply', str(root / 'native.patch')], cwd=replay, check=True)
    for row in manifest['files']:
        assert sha(replay / row['path']) == row['outputSha256']

cc = (root / 'source/chrome/browser/extensions/api/aux_mini_popup/aux_mini_popup_api.cc').read_text()
browser = (root / 'source/chrome/browser/ui/views/frame/browser_view.cc').read_text()
main = (root / 'source/chrome/browser/chrome_browser_main.cc').read_text()
api = cc[cc.index('ExtensionFunction::ResponseAction AuxMiniPopupFunction::RunAux()'):]
getters = api[:api.index('  auto& manager = PopupManager::Get();')]
assert 'Configure(' not in getters and 'Initialize(' not in getters
assert 'getEnabled' in getters and 'getShortcut' in getters
assert cc.count('pref_registrar_.Add(') == 2
assert 'ProfileManager::GetLastUsedProfileIfLoaded()' in cc
assert 'ProfileManager::GetLastUsedProfile()' not in cc
hook = browser[browser.index('  LoadAccelerators();'):browser.index('  // ImmersiveModeController may depend')]
assert 'GetIsNormalType()' in hook and '!BrowserInitState::From(browser())->is_aux_profile_switch_cache()' in hook
assert hook.count('extensions::InitializeAuxMiniPopup(GetProfile());') == 1
assert browser.index('if (initialized_)') < browser.index('extensions::InitializeAuxMiniPopup(GetProfile());')
teardown = main[main.index('void ChromeBrowserMainParts::PostMainMessageLoopRun()'):]
assert teardown.index('extensions::ShutdownAuxMiniPopup();') < teardown.index('aux::ShutdownProfileGates();')
before = (root / 'baseline/chrome/browser/extensions/api/aux_mini_popup/aux_mini_popup_api.cc').read_text()
# No new lock/default/geometry/activation semantics in this startup correction.
for start, end in [('  void ShowFor(', '  void RequestHide()'), ('  void OnWidgetActivationChanged(', '  void OnProfileWillBeDestroyed(')]:
    assert before[before.index(start):before.index(end)] == cc[cc.index(start):cc.index(end)]
for line in ['  registry->RegisterBooleanPref(kEnabled, false);', '  registry->RegisterStringPref(kShortcut, "Command+Shift+Space");']:
    assert line in before and line in cc
assert len(manifest['files']) == 4
print('Verified original startup/cache/pref bytes, four exact native replays, pure getters with mandatory startup, teardown ordering and unchanged gates/defaults/activation. No native runtime acceptance.')
