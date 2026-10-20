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


assert word(0x37e40f0) == 0xf9037a74  # Actual BottomContainer→region6f0.
assert branch(0x37e40a4) == 0x3621b00
assert branch(0x37e4180) == 0x136f140  # Bare View constructor.
assert word(0x37e41d0) == 0xf9037e74  # Bare View→region6f8.
assert branch(0x37e41f4) == 0x2f98600  # Following ResizeArea.
assert struct.unpack('<Q',read(0xe68bad0+0x58,8))[0] & 0xfffffffff == 0x2db8d48
assert read(0xdb10d9f,32) == b'VerticalTabStripBottomContainer\0'
assert branch(0x464b270) == 0x424544c
assert word(0x4245498) == 0x394fe261  # Real compact presentation argument.
assert word(0x42454a0) == 0xf9405108  # Actual View SetVisible vtable slot a0.
for row in manifest['files']:
    text = (root / 'baseline' / row['path']).read_text()
    for anchor in row['anchors']:
        assert text.count(anchor['before']) == anchor['count'] == 1
        text = text.replace(anchor['before'],anchor['after'])
    assert text == (root / 'source' / row['path']).read_text()
    assert 'aux_footer_' not in text and 'AuxSidebarFooter' not in text
region = (root / 'source/chrome/browser/ui/views/frame/vertical_tab_strip_region_view.cc').read_text()
assert 'bottom_button_container_->SetVisible(collapsed);' in region
assert 'bottom_button_container_->SetVisible(compact);' in region
assert 'gemini_button_ = AddChildView(std::make_unique<views::View>());' in region
assert 'resize_area_ = AddChildView(std::make_unique<views::ResizeArea>(this));' in region
assert 'top_button_container_->SetAgentActive(active);' in region
with tempfile.TemporaryDirectory(prefix='aux-original-footer-') as directory:
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
print('PASS: original bottom/metadata/topology/visibility pins,8 exact deletions and2-file disposable replay; not compiled or runtime observed')
