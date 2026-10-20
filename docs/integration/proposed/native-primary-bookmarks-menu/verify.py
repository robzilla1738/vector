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


assert word(0x4574630) == 0x52802580  # Actual kind1 width300.
assert 0x4574474 + struct.unpack('<i', read(0xd6e3084, 4))[0] == 0x4574630
assert word(0x45746f0) == 0x52938968  # All bookmarks40011.
assert word(0x45747e0) == 0x52911708  # Bookmark this tab35000.
assert branch(0x4570f0c) == 0x456e1c8  # Retire before command.
assert word(0x457b4b8) == 0xf9401108  # Controller slot20: OnMouseMoved.
assert word(0x457b5c4) == 0xf9401508  # Controller slot28: OnMouseEntered.
assert word(0x457b6cc) == 0xf9401908  # Controller slot30: OnMouseExited.
for address, text in [(0xdf87172, 'All bookmarks'), (0xdf8718e, 'Bookmark this tab')]:
    assert read(address, len(text) * 2) == text.encode('utf-16le')
names = ['NEW_PATH', 'FILL_RULE_NONZERO', 'PATH_COLOR_ALPHA', 'PATH_COLOR_ARGB',
         'PATH_MODE_CLEAR', 'STROKE', 'CAP_SQUARE', 'MOVE_TO', 'R_MOVE_TO',
         'ARC_TO', 'R_ARC_TO', 'LINE_TO', 'R_LINE_TO', 'H_LINE_TO', 'R_H_LINE_TO',
         'V_LINE_TO', 'R_V_LINE_TO', 'CUBIC_TO', 'R_CUBIC_TO', 'CUBIC_TO_SHORTHAND',
         'QUADRATIC_TO', 'R_QUADRATIC_TO', 'QUADRATIC_TO_SHORTHAND',
         'R_QUADRATIC_TO_SHORTHAND', 'CIRCLE', 'OVAL', 'ROUND_RECT', 'CLOSE',
         'CANVAS_DIMENSIONS', 'CLIP', 'DISABLE_AA', 'FLIPS_IN_RTL']
icons = json.loads((root / 'icons-source.json').read_text())
code = (root / 'source/chrome/browser/ui/views/frame/aux_primary_profile_menu_icons.inc').read_text()
arrays = re.findall(r'constexpr gfx::PathElement (k\w+)Path\[\] = \{(.*?)\};', code, re.S)
arrays = arrays[3:]  # Existing kind6 icons are preserved byte-for-byte.
assert len(arrays) == len(icons) == 11
for (identifier, body), icon in zip(arrays, icons):
    assert identifier == icon['identifier']
    encoded = bytearray()
    for token in body.split(','):
        token = token.strip()
        if token:
            encoded.extend(struct.pack('<I', names.index(token[5:])) if token.startswith('gfx::')
                           else struct.pack('<f', float(token[:-1])))
    assert len(encoded) == icon['elements'] * 4
    assert encoded == read(int(icon['pathRva'], 16), len(encoded))
    assert sha(encoded) == icon['sha256']
path = 'chrome/browser/ui/views/frame/aux_sidebar_view.cc'
intermediate = (root / 'baseline' / path).read_text()
for anchor in json.loads((root / 'anchors.json').read_text()):
    assert intermediate.count(anchor['before']) == anchor['count'] == 1
    intermediate = intermediate.replace(anchor['before'], anchor['after'])
output = (root / 'source' / path).read_text()
assert 'ShowAuxProfileActions(BrowserWindowInterface* browser,' in output
assert 'SetSubmenuCallback(show)' in output
assert 'set_fixed_width(300)' in output
primary = output[output.index('class AuxProfileMenu :'):output.index('// Supplied456bb40/')]
bookmarks = primary[primary.index('void ShowBookmarksSubmenu('):primary.index('void ShowProfileActions(')]
assert bookmarks.count('std::make_unique<AuxMenuRow>') == 2
assert 'IDC_BOOKMARK_ALL_TABS' not in primary
assert 'submenu_anchor_ == anchor' in bookmarks  # Repeated movement retains actual widget.
old_icons = (root / 'baseline/chrome/browser/ui/views/frame/aux_primary_profile_menu_icons.inc').read_text()
assert code.startswith(old_icons.removesuffix('// clang-format on\n'))
native = Path('/Users/rcourson/Documents/Code/aux-chromium-security-155/chromium/src')
for row in proof['platformSources']:
    assert sha((native / row['path']).read_bytes()) == row['sha256']
with tempfile.TemporaryDirectory(prefix='aux-primary-bookmarks-menu-') as directory:
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
print('PASS: original kind1/command/input branches,11 new exact glyph representations,19 counted anchors and2-file disposable replay; not compiled or runtime observed')
