"""Pin and replay recovered palette/paint/geometry without executing target code."""
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

for row in evidence['inputs']:
    assert sha(Path(row['path'])) == row['sha256'], row['path']
framework = Path(evidence['framework']['path'])
assert sha(framework) == evidence['framework']['sha256']
universal = framework.read_bytes()
for i in range(struct.unpack_from('>I', universal, 4)[0]):
    cpu, _, offset, size, _ = struct.unpack_from('>IIIII', universal, 8 + i * 20)
    if cpu == 0x100000c:
        arm = universal[offset:offset + size]
        break
else:
    raise AssertionError('Missing arm64 input')
assert hashlib.sha256(arm).hexdigest() == evidence['framework']['arm64Sha256']
sections = []
pos = 32
for _ in range(struct.unpack_from('<I', arm, 16)[0]):
    cmd, size = struct.unpack_from('<II', arm, pos)
    if cmd == 0x19:
        for i in range(struct.unpack_from('<I', arm, pos + 64)[0]):
            sections.append(struct.unpack_from('<QQI', arm, pos + 72 + i * 80 + 32))
    pos += size
for row in evidence['functions']:
    address = int(row['rva'], 16)
    start, _, offset = next(s for s in sections if s[0] <= address < s[0] + s[1])
    data = arm[offset + address - start:offset + address - start + row['bytes']]
    assert hashlib.sha256(data).hexdigest() == row['sha256']
with tempfile.TemporaryDirectory(prefix='aux-agent-paint-') as directory:
    replay = Path(directory)
    subprocess.run(['git', 'init', '-q', directory], check=True)
    for row in manifest['files']:
        path = row['path']
        assert sha(root / 'baseline' / path) == row['baselineSha256']
        assert sha(root / 'source' / path) == row['outputSha256']
        out = replay / path
        out.parent.mkdir(parents=True, exist_ok=True)
        if not row.get('newFile'):
            out.write_bytes((root / 'baseline' / path).read_bytes())
    subprocess.run(['git', 'apply', '--check', str(root / 'native.patch')], cwd=replay, check=True)
    subprocess.run(['git', 'apply', str(root / 'native.patch')], cwd=replay, check=True)
    for row in manifest['files']:
        assert sha(replay / row['path']) == row['outputSha256']


# Decode only the pinned MOVZ/MOVK/CMP/CSEL/CSINV constant expressions.
# This performs arithmetic over original instruction words; no target execution.
def read(address, count):
    start, _, offset = next(s for s in sections if s[0] <= address < s[0]+s[1])
    return arm[offset+address-start:offset+address-start+count]
def constants(row, dark):
    registers = {1: int(dark), 20: int(dark), 31: 0}
    if row['seedRegister23']:
        registers[23] = int(row['seedRegister23'],16)
    equal = False
    data = read(int(row['rva'],16), row['bytes'])
    for (instruction,) in struct.iter_unpack('<I', data):
        dest = instruction & 31
        source = instruction >> 5 & 31
        other = instruction >> 16 & 31
        immediate = instruction >> 5 & 65535
        shift = (instruction >> 21 & 3) * 16
        operation = instruction & 0xff800000
        if operation == 0x52800000:
            registers[dest] = immediate << shift
        elif operation == 0x72800000:
            registers[dest] = ((registers[dest] & ~(65535 << shift)) |
                               immediate << shift) & 0xffffffff
        elif instruction & 0xffc0001f == 0x7100001f:
            equal = registers[source] == (instruction >> 10 & 4095)
        elif instruction & 0x7fe00c00 in (0x1a800000, 0x5a800000):
            condition = instruction >> 12 & 15
            assert condition in (0,1)
            take_first = equal if condition == 0 else not equal
            value = registers[source] if take_first else registers[other]
            if not take_first and instruction & 0x40000000:
                value = ~value
            registers[dest] = value & 0xffffffff
        else:
            raise AssertionError(hex(instruction))
    return registers[row['resultRegister']]
code = (root/'source/chrome/browser/ui/views/frame/aux_agent_tabs_bubble.cc').read_text()
for row in json.loads((root/'palette.json').read_text()):
    for dark, field in [(False,'light'), (True,'dark')]:
        assert constants(row,dark) == int(row[field],16), (row['role'],field)
    expected = 'return dark ? ' + row['dark'] + ' : ' + row['light'] + ';'
    assert expected in code, row['role']
for row in evidence['colorNames']:
    entry = read(int(row['entryRva'],16),16)
    assert struct.unpack_from('<I',entry)[0] == row['id']
    address = struct.unpack_from('<Q',entry,8)[0] & 0xfffffffff
    assert read(address,len(row['name'])+1) == row['name'].encode()+b'\0'
assert 'GetWidget()->GetColorMode()' in code
assert 'GetNativeTheme()' not in code
assert 'gfx::Size(126, 28)' in code
assert code.count('gfx::Size(217, 32)') == 2
assert 'set_fixed_width(225)' in code
assert 'SkColorSetA(' in code and '0x4d' in code
assert 'border.Inset(0.5f)' in code and 'setStrokeWidth(1)' in code
assert code.count('kMenuHover') >= 3
assert 'SetBackgroundColor(' not in code
assert 'SchedulePaint();' in code
assert 'kSidebarInactiveForeground' not in code
# Exact recovered size leaves, including same row and command primary-vtable slot.
assert read(0x4686480,12).hex() == 'c00f80d28003c0f2c0035fd6'
assert read(0x4688c04,12).hex() == '201b80d20004c0f2c0035fd6'
print('Verified original name map, decoded light/dark mixer constants, paint/size byte pins, window-key adaptation and one-file replay. No native compile or visual acceptance.')
