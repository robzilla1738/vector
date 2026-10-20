"""Pin supplied state ownership and replay the isolated155 controller proposal."""
from pathlib import Path
import hashlib
import json
import struct
import subprocess
import tempfile

root = Path(__file__).resolve().parent
manifest = json.loads((root / 'manifest.json').read_text())
evidence = json.loads((root / 'source-evidence.json').read_text())
sha = lambda data: hashlib.sha256(data).hexdigest()
arm = Path(evidence['arm64']['path']).read_bytes()
assert sha(arm) == evidence['arm64']['sha256']
for row in evidence['functions']:
    start = int(row['rva'], 16)
    assert sha(arm[start:start + row['bytes']]) == row['sha256']

def word(address):
    return struct.unpack_from('<I', arm, address)[0]

def branch(address):
    instruction = word(address)
    assert instruction & 0xfc000000 in (0x94000000, 0x14000000)
    delta = instruction & 0x3ffffff
    if delta & 0x2000000:
        delta -= 0x4000000
    return address + 4 * delta

sections = []
position = 32
for _ in range(struct.unpack_from('<I', arm, 16)[0]):
    command, size = struct.unpack_from('<II', arm, position)
    if command == 0x19:
        for index in range(struct.unpack_from('<I', arm, position + 64)[0]):
            section = position + 72 + index * 80
            address, length, offset = struct.unpack_from('<QQI', arm, section + 32)
            sections.append((address, length, offset))
    position += size

def read(address, count):
    start, length, offset = next(row for row in sections
                                 if row[0] <= address < row[0] + row[1])
    return arm[offset + address - start:offset + address - start + count]

def pointer(address):
    return struct.unpack('<Q', read(address, 8))[0] & 0xfffffffff

assert word(0x465f038) == 0xd63f0100  # actual avatar GetWidget call
assert word(0x465f03c) & 0xff00001f == 0xb4000000  # checks return x0
assert word(0x465f130) == 0xf9027e74  # stores x20, not Widget return x0
assert read(0xdecbfaa, 35).split(b'\0')[0] == b'ScheduleSyncFromAvatarToolbarButton'
assert read(0xcedc0bf, len(b'aside.account_auth_paused\0')) == b'aside.account_auth_paused\0'
assert read(0xdf87eb2, 16).decode('utf-16le') == ', Paused'
assert pointer(0xe724658 + 0x10) == 0x465ee6c
assert pointer(0xe724658 + 0x30) == 0x465ef10
assert pointer(0xe724658 + 0x38) == 0x465ef10
assert pointer(0xe508e10 + 0x58) == pointer(0xe508e10 + 0x70) == 0x465f4a8
assert [pointer(0xe7246b0 + offset) for offset in (0x28, 0x30, 0x38, 0x40)] == [0x465ef68] * 4
for call, slot in ((0x2fdc604, 0x10), (0x423f6e0, 0x10),
                   (0x423fab0, 0x30), (0x3613c14, 0x38)):
    assert branch(call) == 0x25b1780
    assert word(call - 8) == 0x52800001 | (slot << 5)
assert word(0x7ad311c) == 0x52800041  # original RESIZE_BEST enum2
native = Path('/Users/rcourson/Documents/Code/aux-chromium-security-155/chromium/src')
for row in evidence['platformSources']:
    assert sha((native / row['path']).read_bytes()) == row['sha256']
renderer = evidence['rootRenderer']
assert sha(Path(renderer['path']).read_bytes()) == renderer['sha256']
with tempfile.TemporaryDirectory(prefix='aux-sidebar-controller-') as directory:
    replay = Path(directory)
    subprocess.run(['git', 'init', '-q', directory], check=True)
    for row in manifest['files']:
        path = row['path']
        assert sha((root / 'source' / path).read_bytes()) == row['outputSha256']
        if row['baselineSha256'] is not None:
            before = (root / 'baseline' / path).read_bytes()
            assert sha(before) == row['baselineSha256']
            target = replay / path
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(before)
    subprocess.run(['git', 'apply', '--check', str(root / 'native.patch')], cwd=replay, check=True)
    subprocess.run(['git', 'apply', str(root / 'native.patch')], cwd=replay, check=True)
    for row in manifest['files']:
        assert sha((replay / row['path']).read_bytes()) == row['outputSha256']
controller = (root / 'source/chrome/browser/ui/views/frame/aux_vertical_sidebar_profile_button_controller.cc').read_text()
for expression in ('GetImageModel(views::Button::STATE_NORMAL)',
                   'toolbar->avatar_toolbar_button()', 'weak_factory_.GetWeakPtr()',
                   'entry->GetAvatarIconIndex() == 26', 'entry->GetGAIAPicture()',
                   'profile->GetOriginalProfile()->GetPath()', 'prefs->FindPreference(kAuthPaused)',
                   'skia::ImageOperations::RESIZE_BEST', 'SidebarProfileVectorIcon(glyph)'):
    assert expression in controller
for forbidden in ('GetWindowIcon', 'GetAvatarIcon(', 'SetBoolean(', 'LoadProfile', 'GetDefaultProfile'):
    assert forbidden not in controller
producer = (root / 'source/chrome/browser/ui/views/profiles/avatar_toolbar_button.cc').read_text()
assert producer.count('state_manager_.NotifyAuxSourceInvalidated();') == 2
assert producer.count('state_manager_.NotifyAuxTextUpdated();') == 1
prepare = producer[producer.index('void AvatarToolbarButton::PrepareForAuxProfileSwitch()'):]
assert prepare.index('NotifyAuxSourceInvalidated') < prepare.index('state_manager_.PrepareForAuxProfileSwitch')
print('Supplied avatar producer/lifetime/state pins and6-file replay PASS; no native build or runtime acceptance.')
