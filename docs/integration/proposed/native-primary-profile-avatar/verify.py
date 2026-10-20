"""Verify supplied primary-menu branches, glyph bytes and a disposable patch replay."""
from pathlib import Path
import hashlib
import json
import re
import struct
import subprocess
import tempfile

root = Path(__file__).resolve().parent
sha = lambda data: hashlib.sha256(data).hexdigest()
proof = json.loads((root / 'source-evidence.json').read_text())
manifest = json.loads((root / 'manifest.json').read_text())
binary = Path(proof['arm64']['path']).read_bytes()
assert sha(binary) == proof['arm64']['sha256']
for row in proof['functions']:
    address = int(row['rva'], 16)
    assert sha(binary[address:address + row['bytes']]) == row['sha256']
    assert sha((root / 'evidence' / (row['name'] + '.asm')).read_bytes()) == row['assemblySha256']
sections = []
position = 32
for _ in range(struct.unpack_from('<I', binary, 16)[0]):
    command, size = struct.unpack_from('<II', binary, position)
    if command == 0x19:
        for index in range(struct.unpack_from('<I', binary, position + 64)[0]):
            sections.append(struct.unpack_from('<QQI', binary, position + 72 + index * 80 + 32))
    position += size


def read(address, size):
    start, length, offset = next(row for row in sections if row[0] <= address < row[0] + row[1])
    assert address + size <= start + length
    return binary[offset + address - start:offset + address - start + size]


def word(address):
    return struct.unpack('<I', read(address, 4))[0]


def branch(address):
    instruction = word(address)
    assert instruction & 0x7c000000 == 0x14000000
    delta = instruction & 0x3ffffff
    return address + 4 * (delta - 0x4000000 if delta & 0x2000000 else delta)


assert word(0x465d8c4) == 0x39472116  # Actual monogram own-visible flag.
assert branch(0x465d8fc) == 0x6bed8c  # Exact rendered ImageModel copied.
assert word(0x465d8f8) == 0x910d2101  # Source ImageView+348 model, not profile substitute.
assert branch(0x457415c) == 0x27433f4  # Real entry image helper.
assert word(0x457414c) == 0x52800281  # Size20.
assert word(0x4574150) == 0x52800022  # High-res true.
assert word(0x4574170) == 0x52800281 and word(0x4574174) == 0x52800282
assert word(0x4574178) == 0x52800003  # Circle shape0.
assert read(0xd6e30ac, 12) == bytes.fromhex('000100000000000000000000')
assert read(0xd6e30b8, 12) == read(0xd6e30ac, 12)  # No padding, background, no visibility override.
assert word(0x4573d54) == 0x52800208  # Original row icon diameter16.
assert word(0x4579e84) == 0x52800188  # Original monogram font12.
assert struct.unpack('<4I', read(0xdf478b0, 16)) == (262,0,222,0)
anchors = json.loads((root / 'anchors.json').read_text())
for path, edits in anchors.items():
    intermediate = (root / 'baseline' / path).read_text()
    for edit in edits:
        assert intermediate.count(edit['before']) == edit['count'] == 1
        intermediate = intermediate.replace(edit['before'], edit['after'])
sidebar = (root / 'source/chrome/browser/ui/views/frame/aux_sidebar_view.cc').read_text()
primary = sidebar[sidebar.index('class AuxProfileMenu :'):sidebar.index('// Supplied456bb40/')]
assert 'CaptureMenuAvatarPresentation()' in primary
assert 'path == current && presentation.show_monogram' in primary
assert 'AuxProfileIconImage' not in primary
assert 'params.has_padding = false;' in sidebar
assert 'preserve_source_image_ && source_icon_.IsVectorIcon()' in sidebar
renderer = (root / 'source/chrome/browser/ui/views/frame/aux_vertical_sidebar_profile_button.cc').read_text()
capture = renderer[renderer.index('CaptureMenuAvatarPresentation()'):renderer.index('void VerticalTabSidebarProfileButton::SetAvatarImage')]
assert 'monogram_->GetVisible()' in capture and 'image_->GetImageModel()' in capture
assert 'GetAvatarIcon' not in capture and 'GetProfile' not in capture
native = Path('/Users/rcourson/Documents/Code/aux-chromium-security-155/chromium/src')
for row in proof['platformSources']:
    assert sha((native / row['path']).read_bytes()) == row['sha256']
with tempfile.TemporaryDirectory(prefix='aux-primary-profile-avatar-') as directory:
    for row in manifest['files']:
        if row['newFile']:
            assert row['baselineSha256'] is None
            continue
        data = (root / 'baseline' / row['path']).read_bytes()
        assert sha(data) == row['baselineSha256']
        destination = Path(directory) / row['path']
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_bytes(data)
    subprocess.run(['git', 'apply', str(root / 'native.patch')], cwd=directory,
                   check=True, capture_output=True)
    for row in manifest['files']:
        result = (Path(directory) / row['path']).read_bytes()
        assert sha(result) == row['outputSha256']
        assert result == (root / 'source' / row['path']).read_bytes()
print('PASS: original press/model/visibility/monogram/avatar pins,9 counted anchors and3-file disposable replay; not compiled or runtime observed')
