"""Replay the pinned material adaptation without executing native code or preferences."""
import hashlib
import json
from pathlib import Path
import struct
import subprocess
import tempfile

root = Path(__file__).resolve().parent
manifest = json.loads((root / 'manifest.json').read_text())
evidence = json.loads((root / 'source-evidence.json').read_text())

def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

for row in evidence['inputs']:
    assert digest(Path(row['path'])) == row['sha256'], row['path']
framework = Path(evidence['framework']['path'])
assert digest(framework) == evidence['framework']['sha256']
universal = framework.read_bytes()
assert universal[:4] == bytes.fromhex('cafebabe')
for index in range(struct.unpack_from('>I', universal, 4)[0]):
    cpu, _, offset, length, _ = struct.unpack_from('>IIIII', universal, 8 + index * 20)
    if cpu == 0x100000c:
        arm = universal[offset:offset + length]
        break
else:
    raise AssertionError('Missing arm64 slice')
assert hashlib.sha256(arm).hexdigest() == evidence['framework']['arm64Sha256']
sections = []
pos = 32
for _ in range(struct.unpack_from('<I', arm, 16)[0]):
    cmd, length = struct.unpack_from('<II', arm, pos)
    if cmd == 0x19:
        for index in range(struct.unpack_from('<I', arm, pos + 64)[0]):
            sections.append(struct.unpack_from('<QQI', arm, pos + 72 + index * 80 + 32))
    pos += length

def original_bytes(address, length):
    start, _, offset = next(s for s in sections if s[0] <= address < s[0] + s[1])
    return arm[offset + address - start:offset + address - start + length]

for row in evidence['functions']:
    data = original_bytes(int(row['rva'], 16), row['rawSliceBytes'])
    assert hashlib.sha256(data).hexdigest() == row['rawSliceSha256'], row['name']
assert original_bytes(0xd6e3dfc, 31) == b'DesktopMediaPickerVisualEffect\0'
assert original_bytes(0xd4c996c, 35) == b'PermissionPromptNotificationBubble\0'

with tempfile.TemporaryDirectory(prefix='aux-popup-material-') as directory:
    replay = Path(directory)
    subprocess.run(['git', 'init', '-q', directory], check=True)
    for row in manifest['files']:
        path = row['path']
        assert digest(root / 'baseline' / path) == row['baselineSha256'], path
        assert digest(root / 'source' / path) == row['outputSha256'], path
        target = replay / path
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes((root / 'baseline' / path).read_bytes())
    subprocess.run(['git', 'apply', '--check', str(root / 'native.patch')], cwd=replay, check=True)
    subprocess.run(['git', 'apply', str(root / 'native.patch')], cwd=replay, check=True)
    for row in manifest['files']:
        assert digest(replay / row['path']) == row['outputSha256'], row['path']

bridge_path = 'components/remote_cocoa/app_shim/native_widget_ns_window_bridge.mm'
before = (root / 'baseline' / bridge_path).read_text()
after = (root / 'source' / bridge_path).read_text()
# The existing browser material factory and compositor hosting helper are exact.
start = 'NSView* CreateBrowserWindowBackgroundEffectView('
end = '}  // namespace'
assert before[before.index(start):before.index(end, before.index(start))] == after[after.index(start):after.index(end, after.index(start))]
# Browser preferences, Darwin observer, update timer and lifecycle remain exact.
start = 'void NativeWidgetNSWindowBridge::StartWindowEffectPreferencesObserver('
end = 'void NativeWidgetNSWindowBridge::CreateContentView('
assert before[before.index(start):before.index(end)] == after[after.index(start):after.index(end)]
material = after[after.index('NSView* CreatePermissionPromptBackgroundEffectView('):after.index('NSView* CreateBrowserWindowBackgroundEffectView(')]
for text in ['@available(macOS 27, *)', 'NSGlassEffectViewStyleRegular',
             'glass.contentView = [[NSView alloc] initWithFrame:glass.bounds]',
             'NSVisualEffectMaterialPopover', 'NSVisualEffectBlendingModeBehindWindow',
             'NSVisualEffectStateActive', 'respondsToSelector:selector']:
    assert text in material, text
assert '!browser_window && window_.usePermissionPromptVisualEffect' in after
popup = (root / 'source/chrome/browser/extensions/api/aux_mini_popup/aux_mini_popup_api.cc').read_text()
assert popup.count('params.name = "DesktopMediaPickerVisualEffect";') == 2
assert popup.count('gfx::RoundedCornersF(16)') == 1
assert popup.count('gfx::RoundedCornersF(12)') == 1
assert 'ApplyAuxPopupMaterial' not in popup
mac_before = (root / 'baseline/chrome/browser/extensions/api/aux_mini_popup/aux_mini_popup_api_mac.mm').read_text()
mac_after = (root / 'source/chrome/browser/extensions/api/aux_mini_popup/aux_mini_popup_api_mac.mm').read_text()
activation = mac_before[mac_before.index('namespace extensions {'):mac_before.index('void ApplyAuxPopupMaterial')]
assert mac_after == '// Copyright 2026 Aux Authors. All rights reserved.\n#import <AppKit/AppKit.h>\n\n' + activation + '}  // namespace extensions\n'
params = (root / 'source/ui/views/widget/native_widget_mac.mm').read_text()
for name in ['DesktopMediaPickerDialogView', 'DesktopMediaPickerVisualEffect', 'PermissionPromptNotificationBubble']:
    assert params.count('widget_params.name == "' + name + '"') == 1
assert len(manifest['files']) == 8
print('Verified original input/function/literal pins, exact eight-file replay, material branch/settings and unchanged browser/focus lifecycle. No native execution or visual acceptance.')
