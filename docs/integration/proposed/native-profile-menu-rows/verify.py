"""Verify pinned source expressions and exact replay without native execution."""
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

platform = Path('/Users/rcourson/Documents/Code/aux-chromium-security-155/chromium/src')
for row in evidence['platformSources']:
    assert sha(platform / row['path']) == row['sha256']

arm = Path(evidence['arm64']['path']).read_bytes()
assert hashlib.sha256(arm).hexdigest() == evidence['arm64']['sha256']
sections = []
pos = 32
for _ in range(struct.unpack_from('<I', arm, 16)[0]):
    command, size = struct.unpack_from('<II', arm, pos)
    if command == 0x19:
        for i in range(struct.unpack_from('<I', arm, pos + 64)[0]):
            sections.append(struct.unpack_from('<QQI', arm, pos + 72 + i*80 + 32))
    pos += size

def read(address, count):
    start, _, offset = next(s for s in sections if s[0] <= address < s[0] + s[1])
    return arm[offset + address - start:offset + address - start + count]

for row in evidence['functions']:
    assert hashlib.sha256(read(int(row['rva'],16),row['bytes'])).hexdigest() == row['sha256']
for row in evidence['colorNames']:
    entry = read(int(row['entryRva'],16),16)
    assert struct.unpack_from('<I',entry)[0] == row['id']
    address = struct.unpack_from('<Q',entry,8)[0] & 0xfffffffff
    assert read(address,len(row['name'])+1) == row['name'].encode()+b'\0'

# Evaluate only the original pinned constant-expression instruction subset.
def constants(row, dark):
    registers = {1:int(dark),20:int(dark),31:0}
    equal = False
    for (instruction,) in struct.iter_unpack('<I', read(int(row['rva'],16),row['bytes'])):
        dest, source, other = instruction&31, instruction>>5&31, instruction>>16&31
        immediate, shift = instruction>>5&65535, (instruction>>21&3)*16
        operation = instruction & 0xff800000
        if operation == 0x52800000:
            registers[dest] = immediate << shift
        elif operation == 0x72800000:
            registers[dest] = ((registers[dest] & ~(65535 << shift)) | immediate << shift) & 0xffffffff
        elif instruction & 0xffc0001f == 0x7100001f:
            equal = registers[source] == (instruction>>10&4095)
        elif instruction & 0x7fe00c00 in (0x1a800000,0x5a800000):
            condition = instruction>>12&15
            assert condition in (0,1)
            first = equal if condition == 0 else not equal
            value = registers[source] if first else registers[other]
            if not first and instruction & 0x40000000:
                value = ~value
            registers[dest] = value & 0xffffffff
        else:
            raise AssertionError(hex(instruction))
    return registers[row['resultRegister']]

with tempfile.TemporaryDirectory(prefix='aux-profile-menu-') as directory:
    replay = Path(directory)
    subprocess.run(['git','init','-q',directory],check=True)
    for row in manifest['files']:
        path = row['path']
        assert sha(root/'baseline'/path) == row['baselineSha256']
        assert sha(root/'source'/path) == row['outputSha256']
        target = replay/path
        target.parent.mkdir(parents=True,exist_ok=True)
        target.write_bytes((root/'baseline'/path).read_bytes())
    subprocess.run(['git','apply','--check',str(root/'native.patch')],cwd=replay,check=True)
    subprocess.run(['git','apply',str(root/'native.patch')],cwd=replay,check=True)
    for row in manifest['files']:
        assert sha(replay/row['path']) == row['outputSha256']

row = manifest['files'][0]
before = (root/'baseline'/row['path']).read_text()
after = (root/'source'/row['path']).read_text()
# All dispatch, teardown, menu models, avatars and other sidebar code stay exact.
assert before[before.index('gfx::ImageSkia ProfileAvatar'):] == after[after.index('gfx::ImageSkia ProfileAvatar'):]
prefix = after[:after.index('// Supplied private roles221/222/248')]
for header in ['ui/color/color_provider_key.h','ui/gfx/font.h','ui/views/layout/flex_layout.h']:
    prefix = prefix.replace('#include "'+header+'"\n','')
assert prefix == before[:before.index('// A full width row of the profile menu.')]
assert 'SetPreferredSize(gfx::Size(0, 32))' in after
assert 'SetMinimumSize(' not in after
assert 'SetProperty(views::kMarginsKey, gfx::Insets::TLBR(0, 4, 0, 4))' in after
assert 'SetBorder(views::CreateEmptyBorder(gfx::Insets::TLBR(0, 8, 0, 8)))' in after
assert 'SetLineHeight(size == 12 ? 16 : 20)' in after
assert 'GetWidget()->GetColorMode()' in after
assert 'GetNativeTheme()' not in after
assert 'ProfileMenuColor::kHover), 6)' in after
# Optional preferred size descriptor is zero width +32 height at both callers.
assert read(0x4573d4c,4) == read(0x4579114,4)
assert read(0x4579ae8,4).hex() == '017d60d3'  # height -> upper32
for color in json.loads((root/'palette.json').read_text()):
    for dark,field in [(False,'light'),(True,'dark')]:
        assert constants(color,dark) == int(color[field],16)
    assert 'return dark ? '+color['dark']+' : '+color['light']+';' in after
print('Verified original row/font/paint byte pins, decoded palette, dispatch preservation and exact one-file replay. Native compile/visual acceptance remain pending.')
