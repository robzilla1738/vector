"""Replay the one-case adaptation and evaluate original dispatch instructions."""
import hashlib
import json
from pathlib import Path
import struct
import subprocess
import tempfile

root = Path(__file__).resolve().parent
manifest = json.loads((root/'manifest.json').read_text())
evidence = json.loads((root/'source-evidence.json').read_text())

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

arm = Path(evidence['arm64']['path']).read_bytes()
assert hashlib.sha256(arm).hexdigest() == evidence['arm64']['sha256']
sections = []
pos = 32
for _ in range(struct.unpack_from('<I',arm,16)[0]):
    command,size = struct.unpack_from('<II',arm,pos)
    if command == 0x19:
        for i in range(struct.unpack_from('<I',arm,pos+64)[0]):
            sections.append(struct.unpack_from('<QQI',arm,pos+72+i*80+32))
    pos += size

def read(address,count):
    start,_,offset = next(s for s in sections if s[0] <= address < s[0]+s[1])
    return arm[offset+address-start:offset+address-start+count]

def word(address):
    return struct.unpack('<I',read(address,4))[0]

for row in evidence['functions']:
    assert hashlib.sha256(read(int(row['rva'],16),row['bytes'])).hexdigest() == row['sha256']
for row in evidence['strings']:
    assert read(int(row['rva'],16),len(row['value'])+1) == row['value'].encode()+b'\0'
native = Path('/Users/rcourson/Documents/Code/aux-chromium-security-155/chromium/src')
for row in evidence['platformSources']:
    assert sha(native/row['path']) == row['sha256']

# Evaluate only the original reason-dispatch block, not target machine code.
# Stops before object copying/extension ID access, retaining the enum write.
def exported_enum(reason):
    registers = {0:reason}
    result = 0
    pc = 0x7631ccc
    comparison = None
    for _ in range(16):
        if pc in (0x7631ce0,0x7631d40):
            return result
        instruction = word(pc)
        if instruction & 0xffc00000 == 0x51000000:  # SUB Wd,Wn,#imm
            registers[instruction&31] = (registers[instruction>>5&31]-(instruction>>10&4095))&0xffffffff
        elif instruction & 0xffc0001f == 0x7100001f:  # CMP Wn,#imm
            comparison = (registers[instruction>>5&31],instruction>>10&4095)
        elif instruction & 0xff000010 == 0x54000000:  # B.cond
            condition = instruction&15
            assert condition in (1,2)
            take = comparison[0] != comparison[1] if condition == 1 else comparison[0] >= comparison[1]
            if take:
                displacement = instruction>>5&0x7ffff
                if displacement&0x40000:
                    displacement -= 0x80000
                pc += displacement*4
                continue
        elif instruction & 0xff800000 == 0x52800000:  # MOVZ Wd,#imm
            registers[instruction&31] = (instruction>>5&65535)<<((instruction>>21&3)*16)
        elif instruction == 0xb90007e8:  # STR W8,[SP,#4]: reason field
            result = registers[8]
        else:
            raise AssertionError(hex(instruction))
        pc += 4
    raise AssertionError('Unexpected dispatch loop')

assert [exported_enum(i) for i in range(7)] == [0,3,1,1,1,1,0]
# Original serializer branch loads exact literal user for exported1.
assert word(0xc489b20) == 0x7100051f  # CMP W8,#1
assert word(0xc489b24) == 0x54000461  # B.NE unreachable-enum check
assert word(0xc489b28) == 0xf000a263  # ADRP X3,user page
assert word(0xc489b2c) == 0x91377063  # ADD X3,#ddc -> user
assert read(0xd8d8ddc,5) == b'user\0'
# The real tab serializer passes Tab+38 to this actual MutedInfo serializer.
assert word(0xc48a950) == 0x9100e280
branch = word(0xc48a954)
imm = branch&0x3ffffff
if imm&0x2000000:
    imm -= 0x4000000
assert 0xc48a954+imm*4 == 0xc489ad4
for address in map(lambda x:int(x,16),evidence['reasonGetterDirectCallers']):
    branch = word(address)
    assert branch&0xfc000000 == 0x94000000
    immediate = branch&0x3ffffff
    if immediate&0x2000000:
        immediate -= 0x4000000
    assert address+immediate*4 == 0x76832e0

with tempfile.TemporaryDirectory(prefix='aux-muted-info-') as directory:
    replay = Path(directory)
    subprocess.run(['git','init','-q',directory],check=True)
    for row in manifest['files']:
        path = row['path']
        assert sha(root/'baseline'/path) == row['baselineSha256']
        assert sha(root/'source'/path) == row['outputSha256']
        before = (root/'baseline'/path).read_text()
        after = (root/'source'/path).read_text()
        assert before.replace('    case TabMutedReason::kContentSettingChrome:\n','    case TabMutedReason::kContentSettingChrome:\n    case TabMutedReason::kAgentGroup:\n',1) == after
        target = replay/path
        target.parent.mkdir(parents=True,exist_ok=True)
        target.write_text(before)
    subprocess.run(['git','apply','--check',str(root/'native.patch')],cwd=replay,check=True)
    subprocess.run(['git','apply',str(root/'native.patch')],cwd=replay,check=True)
    for row in manifest['files']:
        assert sha(replay/row['path']) == row['outputSha256']
print('Verified original reason5 -> enum1 -> user, all existing enum dispatch cases, original tab serializer linkage and exact one-case replay. Native compile pending.')
