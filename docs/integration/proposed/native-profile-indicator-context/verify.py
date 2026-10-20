"""Replay the real targeted menu, verify original behavior anchors and glyph bits."""
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
    start = int(row['rva'], 16)
    assert sha(binary[start:start + row['bytes']]) == row['sha256']
    assert sha((root / 'evidence' / (row['name'] + '.asm')).read_bytes()) == row['assemblySha256']
assert sha((root / 'evidence/settings-action.c').read_bytes()) == proof['suppliedSettings']['sha256']
sections = []
position = 32
for _ in range(struct.unpack_from('<I', binary, 16)[0]):
    command, size = struct.unpack_from('<II', binary, position)
    if command == 0x19:
        for index in range(struct.unpack_from('<I', binary, position + 64)[0]):
            sections.append(struct.unpack_from('<QQI', binary, position + 72 + index * 80 + 32))
    position += size


def read(address, count):
    start, length, offset = next(row for row in sections if row[0] <= address < row[0] + row[1])
    assert address + count <= start + length
    return binary[offset + address - start:offset + address - start + count]


def word(address):
    return struct.unpack_from('<I', binary, address)[0]


def branch(address):
    instruction = word(address)
    assert instruction & 0x7c000000 == 0x14000000
    delta = instruction & 0x3ffffff
    if delta & 0x2000000:
        delta -= 0x4000000
    return address + 4 * delta


assert word(0x456c160) == 0xd2801fc0  #Preferred width254.
assert word(0x456c164) == 0xf2c01840  #Preferred height194.
assert word(0x456c33c) == 0x528003d8  #30px pitch.
assert word(0x456c344) == 0x5280039a  #28px buttons.
assert struct.unpack('<4i', read(0xdf47880, 16)) == (-1, -8, 1, 8)
assert word(0x40ff1f8) == 0xf100095f  #At least two non-omitted entries.
assert branch(0x40ff334) == 0x7ac93d8  #Real deletion helper.
assert word(0x40ff324) == 0x52800023  #Deletion-source enum1.
assert branch(0x4572690) == 0x40ff250  #Actual accepted confirmation action.
assert branch(0x7accf44) == 0x25b28fc  #Storage avatar observer notification.
for address, text in [(0xdf86f86, 'Delete profile?'), (0xdf86fa6, 'Delete'),
                      (0xdf86eb4, 'Cancel'), (0xdf86edc, 'This profile will be removed from this device.')]:
    assert read(address, (len(text) + 1) * 2) == (text + '\0').encode('utf-16le')

names = ['NEW_PATH', 'FILL_RULE_NONZERO', 'PATH_COLOR_ALPHA', 'PATH_COLOR_ARGB',
         'PATH_MODE_CLEAR', 'STROKE', 'CAP_SQUARE', 'MOVE_TO', 'R_MOVE_TO',
         'ARC_TO', 'R_ARC_TO', 'LINE_TO', 'R_LINE_TO', 'H_LINE_TO', 'R_H_LINE_TO',
         'V_LINE_TO', 'R_V_LINE_TO', 'CUBIC_TO', 'R_CUBIC_TO', 'CUBIC_TO_SHORTHAND',
         'QUADRATIC_TO', 'R_QUADRATIC_TO', 'QUADRATIC_TO_SHORTHAND',
         'R_QUADRATIC_TO_SHORTHAND', 'CIRCLE', 'OVAL', 'ROUND_RECT', 'CLOSE',
         'CANVAS_DIMENSIONS', 'CLIP', 'DISABLE_AA', 'FLIPS_IN_RTL']
icons = json.loads((root / 'icons-source.json').read_text())
code = (root / 'source/chrome/browser/ui/views/frame/aux_profile_indicator_context_icons.inc').read_text()
arrays = re.findall(r'constexpr gfx::PathElement (k\w+)Path\[\] = \{(.*?)\};', code, re.S)
assert len(arrays) == len(icons) == 3
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
catalog = (root / 'source/chrome/browser/ui/views/profiles/aux_profile_indicator_icon.cc').read_text()
old_icons = json.loads((root.parent / 'native-profile-indicator-icons/icons-source.json').read_text())
assert len(old_icons) == 48
for icon in old_icons:
    assert catalog.count('{"' + icon['key'] + '", u"' + icon['label'] + '", &' + icon['identifier'] + 'Icon}') == 1

native = Path('/Users/rcourson/Documents/Code/aux-chromium-security-155/chromium/src')
for row in proof['platformSources']:
    assert sha((native / row['path']).read_bytes()) == row['sha256']
with tempfile.TemporaryDirectory(prefix='aux-indicator-context-') as directory:
    for row in manifest['files']:
        if row['newFile']:
            assert row['baselineSha256'] is None
            continue
        data = (root / 'baseline' / row['path']).read_bytes()
        assert sha(data) == row['baselineSha256']
        path = Path(directory) / row['path']
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(data)
    subprocess.run(['git', 'apply', str(root / 'native.patch')], cwd=directory,
                   check=True, capture_output=True)
    for row in manifest['files']:
        result = (Path(directory) / row['path']).read_bytes()
        assert sha(result) == row['outputSha256']
        assert result == (root / 'source' / row['path']).read_bytes()
print('PASS: supplied context/grid/action/confirmation anchors,48 catalog rows,1113 exact glyph elements and7-file replay; uncompiled')
