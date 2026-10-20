"""Verify original static pins and new-file replay. Never execute target code."""
import hashlib
import json
from pathlib import Path
import struct
import subprocess
import tempfile

root = Path(__file__).resolve().parent
evidence = json.loads((root / 'source-evidence.json').read_text())
manifest = json.loads((root / 'manifest.json').read_text())
arm = Path(evidence['artifact']).read_bytes()
def sha(data):
    return hashlib.sha256(data).hexdigest()
assert sha(arm) == evidence['sha256']
def read(address, count):
    # The pinned ranges in this thin __TEXT image have VA == file offset.
    return arm[address:address + count]
for row in evidence['extracts']:
    start, stop = int(row['start'],16), int(row['stop'],16)
    assert sha(read(start,stop-start)) == row['bytesSha256']
    assert sha((root/row['file']).read_bytes()) == row['extractSha256']
for row in evidence['colorNames']:
    entry = read(int(row['entryRva'],16),16)
    assert struct.unpack_from('<I',entry)[0] == row['id']
    address = struct.unpack_from('<Q',entry,8)[0] & 0xfffffffff
    assert read(address,len(row['name'])+1) == row['name'].encode()+b'\0'
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

for row in evidence['colorExpressions']:
    assert constants(row,False) == int(row['light'],16)
    assert constants(row,True) == int(row['dark'],16)
for row in [evidence['metadata'],evidence['icon']]:
    assert read(int(row['nameRva'],16),len(row['name'])+1) == row['name'].encode()+b'\0'
icon = evidence['icon']
assert sha(read(int(icon['pathRva'],16),icon['elements']*4)) == icon['sha256']
# Re-encode the C++ source PathElements, proving every supplied float32 bit.
import re
code = (root/'port/chrome/browser/ui/views/frame/aux_profile_search_button.cc').read_text()
path = code.split('kSearchPath[] = {',1)[1].split('};',1)[0]
names = ['NEW_PATH','FILL_RULE_NONZERO','PATH_COLOR_ALPHA','PATH_COLOR_ARGB','PATH_MODE_CLEAR','STROKE','CAP_SQUARE','MOVE_TO','R_MOVE_TO','ARC_TO','R_ARC_TO','LINE_TO','R_LINE_TO','H_LINE_TO','R_H_LINE_TO','V_LINE_TO','R_V_LINE_TO','CUBIC_TO','R_CUBIC_TO','CUBIC_TO_SHORTHAND','QUADRATIC_TO','R_QUADRATIC_TO','QUADRATIC_TO_SHORTHAND','R_QUADRATIC_TO_SHORTHAND','CIRCLE','OVAL','ROUND_RECT','CLOSE','CANVAS_DIMENSIONS','CLIP','DISABLE_AA','FLIPS_IN_RTL']
encoded = bytearray()
for token in path.split(','):
    token = token.strip()
    if not token:
        continue
    if token.startswith('gfx::'):
        encoded.extend(struct.pack('<I',names.index(token[5:])))
    else:
        assert token.endswith('f'),token
        encoded.extend(struct.pack('<f',float(token[:-1])))
assert bytes(encoded) == read(int(icon['pathRva'],16),icon['elements']*4)
with tempfile.TemporaryDirectory(prefix='aux-search-button-replay-') as directory:
    subprocess.run(['git','init','-q',directory],check=True)
    subprocess.run(['git','apply','--check',str(root/'native.patch')],cwd=directory,check=True)
    subprocess.run(['git','apply',str(root/'native.patch')],cwd=directory,check=True)
    for row in manifest['files']:
        assert row['baselineSha256'] is None
        assert sha((Path(directory)/row['path']).read_bytes()) == row['outputSha256']
        assert sha((root/'port'/row['path']).read_bytes()) == row['outputSha256']
print('Original ProfileSearchButton identity/body, palette arithmetic, exact93-element path and two-file replay PASS. Not compiled or UI-accepted.')
