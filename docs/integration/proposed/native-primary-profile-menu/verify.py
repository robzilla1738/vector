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


assert word(0x4573fa0) == 0x528000c8  # Primary More: kind6, not pager kind7.
assert 0x4574474 + struct.unpack('<i', read(0xd6e3084 + 5 * 4, 4))[0] == 0x45771a8
assert word(0x45771c0) == 0x52801e00  # Kind6 width240.
assert branch(0x45773c0) == 0x40ff0cc  # Real target-specific removal predicate.
assert word(0x40fe6d8) == 0x52800341  # Actual avatar index26.
assert branch(0x4583950) == 0x4572824  # Created profile dispatches through same owner.
assert branch(0x4571fcc + 8) == 0x40feffc  # Accepted edit invokes real rename helper.
assert branch(0x40ff05c) == 0x8dfdec  # CollapseWhitespace with true, not a trim-only approximation.
assert word(0x40ff058) == 0x52800022
assert word(0x40ff0b8) == 0x52800002  # Explicit local name, not generated/default.
for address, text in [(0xdf86e4a, 'Edit profile'),
                      (0xdf86e64, 'Choose a short, recognizable name.'),
                      (0xdf86ec2, 'Profile name'), (0xceea4ca, 'Profile'),
                      (0xdf87136, 'Profile actions')]:
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
assert 'kPrimaryDeleteIconReps, 2,' in code  # Both original size representations retained.

path = 'chrome/browser/ui/views/frame/aux_sidebar_view.cc'
intermediate = (root / 'baseline' / path).read_text()
for anchor in json.loads((root / 'anchors.json').read_text()):
    assert intermediate.count(anchor['before']) == anchor['count'] == 1
    intermediate = intermediate.replace(anchor['before'], anchor['after'])
output = (root / 'source' / path).read_text()
assert 'ShowAuxProfileActions(BrowserWindowInterface* browser,' in output  # Pager entry untouched.
assert 'PrimaryProfileRoster()' in output and 'aux::ProfileDisplayLabel(' in output
assert 'model->GetTextfieldByUniqueId' not in output
assert '.SetSubtitle(u"Choose a short, recognizable name.")' in output
primary = output[output.index('class AuxProfileMenu :'):output.index('// Supplied456bb40/')]
assert 'ShowAuxIconPicker(' not in primary and 'ShowQuestionMessageBoxAsync(' not in primary
assert re.search(r'base::Unretained\(row\),\s*path\)', primary)
assert 'profile_actions_->CloseNow()' in primary and 'PreventCloseOnDeactivate()' in primary
assert 'PrimaryProfileRoster().size() >= 2' in primary

native = Path('/Users/rcourson/Documents/Code/aux-chromium-security-155/chromium/src')
for row in proof['platformSources']:
    assert sha((native / row['path']).read_bytes()) == row['sha256']
with tempfile.TemporaryDirectory(prefix='aux-primary-profile-menu-') as directory:
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
print('PASS: original kind6/edit/create branches, three exact icon representations,17 counted anchors and2-file disposable replay; not compiled or runtime observed')
