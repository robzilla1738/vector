"""Static supplied byte/icon fidelity and isolated patch replay; no target execution."""
import hashlib
import json
from pathlib import Path
import struct
import subprocess
import tempfile

root = Path(__file__).resolve().parent
evidence = json.loads((root/'source-evidence.json').read_text())
manifest = json.loads((root/'manifest.json').read_text())
arm = Path(evidence['artifact']).read_bytes()
def sha(data):
    return hashlib.sha256(data).hexdigest()
assert sha(arm) == evidence['sha256']
for row in evidence['extracts']:
    start, stop = int(row['start'],16), int(row['stop'],16)
    assert sha(arm[start:stop]) == row['bytesSha256']
    assert sha((root/row['file']).read_bytes()) == row['extractSha256']
margin=evidence['avatarMargin']
a=int(margin['rva'],16)
assert sha(arm[a:a+16]) == margin['bytesSha256']
assert list(struct.unpack_from('<4i',arm,a)) == margin['tlbr']
names=['NEW_PATH','FILL_RULE_NONZERO','PATH_COLOR_ALPHA','PATH_COLOR_ARGB','PATH_MODE_CLEAR','STROKE','CAP_SQUARE','MOVE_TO','R_MOVE_TO','ARC_TO','R_ARC_TO','LINE_TO','R_LINE_TO','H_LINE_TO','R_H_LINE_TO','V_LINE_TO','R_V_LINE_TO','CUBIC_TO','R_CUBIC_TO','CUBIC_TO_SHORTHAND','QUADRATIC_TO','R_QUADRATIC_TO','QUADRATIC_TO_SHORTHAND','R_QUADRATIC_TO_SHORTHAND','CIRCLE','OVAL','ROUND_RECT','CLOSE','CANVAS_DIMENSIONS','CLIP','DISABLE_AA','FLIPS_IN_RTL']
code=(root/'port/chrome/browser/ui/views/frame/aux_profile_preview_icons.inc').read_text()
for icon in evidence['icons']:
    path=code.split('k'+icon['name']+'Path[] = {',1)[1].split('};',1)[0]
    encoded=bytearray()
    for token in path.split(','):
        token=token.strip()
        if not token: continue
        if token.startswith('gfx::'):
            encoded.extend(struct.pack('<I',names.index(token[5:])))
        else:
            assert token.endswith('f')
            encoded.extend(struct.pack('<f',float(token[:-1])))
    a=int(icon['path'],16)
    assert len(encoded)==icon['elements']*4
    assert bytes(encoded)==arm[a:a+len(encoded)]
    assert sha(encoded)==icon['sha256']
# Exact immediate colors used by original supplied row painter. MOVN as well as
# MOVZ/MOVK must be decoded: role219's light constant is NOT opaque white.
def color(start, stop, dark):
    regs={20:int(dark)};equal=False
    for (ins,) in struct.iter_unpack('<I',arm[start:stop]):
        dest=ins&31;source=ins>>5&31;other=ins>>16&31
        imm=ins>>5&65535;shift=(ins>>21&3)*16;op=ins&0xff800000
        if op==0x52800000: regs[dest]=imm<<shift
        elif op==0x12800000: regs[dest]=~(imm<<shift)&0xffffffff
        elif op==0x72800000: regs[dest]=(regs[dest]&~(65535<<shift))|imm<<shift
        elif ins&0xffc0001f==0x7100001f: equal=regs[source]==(ins>>10&4095)
        elif ins&0x7fe00c00==0x1a800000:
            cond=ins>>12&15;assert cond in (0,1)
            regs[dest]=regs[source] if (equal if cond==0 else not equal) else regs[other]
        else: raise AssertionError(hex(ins))
    return regs[21]
for dark in (False,True):
    assert color(0x35e7174,0x35e7188,dark)==(0x0afafafa if dark else 0x8cffffff)
    assert color(0x35e7650,0x35e7668,dark)==(0xa6fafafa if dark else 0xb80a0a0a)
with tempfile.TemporaryDirectory(prefix='aux-preview-page-replay-') as directory:
    subprocess.run(['git','init','-q',directory],check=True)
    subprocess.run(['git','apply','--check',str(root/'native.patch')],cwd=directory,check=True)
    subprocess.run(['git','apply',str(root/'native.patch')],cwd=directory,check=True)
    for row in manifest['files']:
        assert row['baselineSha256'] is None
        assert sha((Path(directory)/row['path']).read_bytes())==row['outputSha256']
        assert sha((root/'port'/row['path']).read_bytes())==row['outputSha256']
print('Original page/row source pins, four exact icon paths, row color arithmetic and three-file replay PASS. Not compiled/mounted/UI-accepted.')
