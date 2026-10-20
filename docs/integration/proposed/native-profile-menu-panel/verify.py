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
# Actual transaction/model suffix is unchanged; only the caption Build prefix differs.
assert before[before.index('    const base::FilePath current ='):]==after[after.index('    const base::FilePath current ='):]
assert before[before.index('  ~AuxProfileMenu()'):before.index(' private:\n  void Build()')]==after[after.index('  ~AuxProfileMenu()'):after.index(' private:\n  void Build()')]
assert after.count('kProfileMenuWidth') == 2
assert 'constexpr int kProfileMenuWidth = 240;' in after
assert 'set_margins(gfx::Insets::VH(4, 4));' in after
assert 'StyleProfileMenuLabel(this, 12, gfx::Font::Weight::MEDIUM)' in after
assert 'SetPreferredSize(gfx::Size(0, 24))' in after
assert 'gfx::Insets::TLBR(0, 6, 0, 6)' in after
assert 'GetWidget()->GetColorMode()' in after
assert read(0x4573250,4).hex() == '001e8052'  # literal width240 passed to ctor
assert struct.unpack('<Q',read(0xe6d6dd0+0x58,8))[0]&0xfffffffff == 0x4579508
assert struct.unpack('<Q',read(0xe6d6dd0+0x2e8,8))[0]&0xfffffffff == 0x4579608
assert read(0xdf86fb4,18).decode('utf-16le') == 'Profiles\0'
for color in json.loads((root/'palette.json').read_text()):
    for dark,field in [(False,'light'),(True,'dark')]:
        assert constants(color,dark) == int(color[field],16)
    assert 'return dark ? '+color['dark']+' : '+color['light']+';' in after
print('Verified original panel240/caption byte pins, private palette226, transaction preservation and exact replay. Native compile/visual acceptance pending.')
