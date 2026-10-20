"""Pin real pager mutation/cancellation and replay the unmounted155 proposal."""
from pathlib import Path
import hashlib
import json
import struct
import subprocess
import tempfile

root = Path(__file__).resolve().parent
proof = json.loads((root / 'source-evidence.json').read_text())
manifest = json.loads((root / 'manifest.json').read_text())
sha = lambda data: hashlib.sha256(data).hexdigest()
arm = Path(proof['arm64']['path']).read_bytes()
assert sha(arm) == proof['arm64']['sha256']
for row in proof['functions']:
    start = int(row['rva'], 16)
    assert sha(arm[start:start + row['bytes']]) == row['sha256']
    assert sha((root / 'evidence' / (row['name'] + '.asm')).read_bytes()) == row['assemblySha256']
rea = proof['rea']
assert sha(arm[int(rea['inputStart'], 16):int(rea['inputStop'], 16)]) == rea['sha256']
assert sha((root / 'evidence/reorder.c').read_bytes()) == rea['pseudocodeSha256']


def word(address):
    return struct.unpack_from('<I', arm, address)[0]


def branch(address):
    instruction = word(address)
    assert instruction & 0xfc000000 == 0x94000000
    delta = instruction & 0x3ffffff
    if delta & 0x2000000:
        delta -= 0x4000000
    return address + 4 * delta


assert word(0x46566c4) == 0xeb02003f  #Actual from/to parameters.
assert word(0x46566dc) == 0xaa0103f6  #Preserves from.
assert word(0x46566d8) == 0xaa0203f9  #Preserves to.
assert branch(0x4656dd4) == 0x364f578  #Actual ReorderChildView.
assert word(0x4656dd8) == 0xf903de75  #Current index becomes to.
assert word(0x37e0364) == 0x529a9808
assert word(0x37e0368) == 0x72a00028  #100000us, not155 default120ms.
assert word(0x37e03c8) == 0x529a9808
assert word(0x37e03cc) == 0x72a00028
sections = []
position = 32
for _ in range(struct.unpack_from('<I', arm, 16)[0]):
    command, size = struct.unpack_from('<II', arm, position)
    if command == 0x19:
        for index in range(struct.unpack_from('<I', arm, position + 64)[0]):
            sections.append(struct.unpack_from('<QQI', arm, position + 72 + index * 80 + 32))
    position += size
start, length, offset = next(row for row in sections if row[0] <= 0xdf51324 < row[0] + row[1])
opacity = arm[offset + 0xdf51324 - start:offset + 0xdf51324 - start + 4]
assert sha(opacity) == proof['opacity']['sha256']
assert opacity == struct.pack('<f', 0.94)

assert proof['nextafterImport'] == '_nextafter'
assert branch(0x4649c9c) == branch(0x4649ccc) == 0x94b2218
assert word(0x4652af4) == 0x52800001  #Slide direction0=Show; not Reset.

native = Path('/Users/rcourson/Documents/Code/aux-chromium-security-155/chromium/src')
for row in proof['platformSources']:
    assert sha((native / row['path']).read_bytes()) == row['sha256']
with tempfile.TemporaryDirectory(prefix='aux-pager-drag-') as directory:
    subprocess.run(['git', 'apply', str(root / 'native.patch')], cwd=directory,
                   check=True, capture_output=True)
    for row in manifest['files']:
        assert row['baselineSha256'] is None and row['newFile']
        output = (Path(directory) / row['path']).read_bytes()
        assert sha(output) == row['outputSha256']
        assert output == (root / 'source' / row['path']).read_bytes()
print('PASS: original pager mutation/animation/cancel pins,155API pins and disposable2-file replay; uncompiled')
