"""Verify all supplied profile indicator paths and the isolated native proposal."""
from pathlib import Path
import hashlib
import json
import re
import struct
import subprocess
import tempfile

root = Path(__file__).resolve().parent
proof = json.loads((root / 'source-evidence.json').read_text())
manifest = json.loads((root / 'manifest.json').read_text())
sha = lambda data: hashlib.sha256(data).hexdigest()
arm = Path(proof['arm64']['path']).read_bytes()
assert sha(arm) == proof['arm64']['sha256']
sections = []
position = 32
for _ in range(struct.unpack_from('<I', arm, 16)[0]):
    command, size = struct.unpack_from('<II', arm, position)
    if command == 0x19:
        for index in range(struct.unpack_from('<I', arm, position + 64)[0]):
            sections.append(struct.unpack_from('<QQI', arm, position + 72 + index * 80 + 32))
    position += size


def read(address, count):
    start, length, offset = next(row for row in sections
                                 if row[0] <= address < row[0] + row[1])
    return arm[offset + address - start:offset + address - start + count]


def pointer(address):
    return struct.unpack('<Q', read(address, 8))[0] & 0xfffffffff


for row in proof['functions']:
    start = int(row['rva'], 16)
    assert sha(arm[start:start + row['bytes']]) == row['sha256']
    assert sha((root / 'evidence' / (row['name'] + '.asm')).read_bytes()) == row['assemblySha256']
table = proof['table']
assert sha(read(int(table['rva'], 16), table['bytes'])) == table['sha256']
assert read(0xcefb492, 29) == b'aside_profile_indicator_icon\0'
assert struct.unpack_from('<I', arm, 0x456d9c8)[0] == 0x5280f016  #48rows*40.
assert struct.unpack_from('<I', arm, 0x456da00)[0] == 0xf9400ab3  #Actual icon+16.

names = ['NEW_PATH', 'FILL_RULE_NONZERO', 'PATH_COLOR_ALPHA', 'PATH_COLOR_ARGB',
         'PATH_MODE_CLEAR', 'STROKE', 'CAP_SQUARE', 'MOVE_TO', 'R_MOVE_TO',
         'ARC_TO', 'R_ARC_TO', 'LINE_TO', 'R_LINE_TO', 'H_LINE_TO', 'R_H_LINE_TO',
         'V_LINE_TO', 'R_V_LINE_TO', 'CUBIC_TO', 'R_CUBIC_TO', 'CUBIC_TO_SHORTHAND',
         'QUADRATIC_TO', 'R_QUADRATIC_TO', 'QUADRATIC_TO_SHORTHAND',
         'R_QUADRATIC_TO_SHORTHAND', 'CIRCLE', 'OVAL', 'ROUND_RECT', 'CLOSE',
         'CANVAS_DIMENSIONS', 'CLIP', 'DISABLE_AA', 'FLIPS_IN_RTL']
code = (root / 'source/chrome/browser/ui/views/profiles/aux_profile_indicator_icons.inc').read_text()
arrays = re.findall(r'constexpr gfx::PathElement (k\w+)Path\[\] = \{(.*?)\};', code, re.S)
assert len(arrays) == len(proof['icons']) == 48
assert json.loads((root / 'icons-source.json').read_text()) == proof['icons']
selector = (root / 'source/chrome/browser/ui/views/profiles/aux_profile_indicator_icon.cc').read_text()
for (identifier, body), icon in zip(arrays, proof['icons']):
    assert identifier == icon['identifier']
    row = int(icon['tableRva'], 16)
    key_length = struct.unpack('<Q', read(row + 8, 8))[0]
    assert read(pointer(row), key_length).decode() == icon['key']
    assert pointer(row + 16) == int(icon['descriptorRva'], 16)
    assert pointer(int(icon['descriptorRva'], 16)) == int(icon['representationRva'], 16)
    assert pointer(int(icon['representationRva'], 16)) == int(icon['pathRva'], 16)
    encoded = bytearray()
    for token in body.split(','):
        token = token.strip()
        if not token:
            continue
        encoded.extend(struct.pack('<I', names.index(token[5:])) if token.startswith('gfx::')
                       else struct.pack('<f', float(token[:-1])))
    assert len(encoded) == icon['elements'] * 4
    assert encoded == read(int(icon['pathRva'], 16), len(encoded))
    assert sha(encoded) == icon['sha256']
    assert selector.count('{"' + icon['key'] + '", &' + identifier + 'Icon}') == 1

with tempfile.TemporaryDirectory(prefix='aux-profile-indicator-icons-') as directory:
    target = Path(directory)
    for row in manifest['files']:
        if row['newFile']:
            assert row['baselineSha256'] is None
            continue
        baseline = root / 'baseline' / row['path']
        assert sha(baseline.read_bytes()) == row['baselineSha256']
        output = target / row['path']
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_bytes(baseline.read_bytes())
    subprocess.run(['git', 'apply', str(root / 'native.patch')], cwd=directory,
                   check=True, capture_output=True)
    for row in manifest['files']:
        assert sha((target / row['path']).read_bytes()) == row['outputSha256']
        assert (target / row['path']).read_bytes() == (root / 'source' / row['path']).read_bytes()
print('PASS:48 supplied icon bindings,6530 exact PathElements, attribute key and disposable5-file replay; uncompiled')
