"""Verify supplied pager leaf provenance and replay only in a temporary tree."""
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

sections = []
position = 32
for _ in range(struct.unpack_from('<I', arm, 16)[0]):
    command, size = struct.unpack_from('<II', arm, position)
    if command == 0x19:
        for index in range(struct.unpack_from('<I', arm, position + 64)[0]):
            row = position + 72 + index * 80
            sections.append(struct.unpack_from('<QQI', arm, row + 32))
    position += size


def read(address, count):
    start, length, offset = next(row for row in sections
                                 if row[0] <= address < row[0] + row[1])
    return arm[offset + address - start:offset + address - start + count]


def pointer(address):
    return struct.unpack('<Q', read(address, 8))[0] & 0xfffffffff


def word(address):
    return struct.unpack_from('<I', arm, address)[0]


for row in proof['data']:
    assert sha(read(int(row['rva'], 16), row['bytes'])) == row['sha256']
assert read(0xdecc1d8, 30) == b'ProfilePageIndicatorDotButton\0'
assert struct.unpack('<4f', read(0xdf47a90, 16)) == (-3, -3, 3, 3)
for slot, function in ((0x130, 0x467be84), (0x138, 0x467bfa4),
                       (0x140, 0x467c164), (0x148, 0x467c330),
                       (0x438, 0x467c400)):
    assert pointer(0xe72ccf0 + slot) == function
assert word(0x4631d98) == 0xb21d07e1  #24x24 preferred size.
assert word(0x4631de4) == 0x52800041  #FocusBehavior2.
assert word(0x467bf64) == 0xf9027668  #Original local press remains at+4e8.
assert word(0x467bf94) == 0x91138262  #Parent conversion mutates+4e0.
assert word(0x467c05c) == 0xfd427261  #Threshold reads converted press+4e0.
assert word(0x467c068) == 0x0f000501  #Strict greater-than8 per axis.
assert word(0x467c100) == 0x9113a263  #Update receives local press+4e8.
assert word(0x467c1cc) == 0x52800002  #Release false.
assert word(0x467c390) == 0x52800022  #Capture loss true.
assert word(0x467c460) == 0x52801ee1  #Hover/pressed role247.
assert word(0x467c4ac) == 0x1e241000  #Radius8.
assert word(0x467c5b4) == 0x528001c2  #Vector icon14px.

native = Path('/Users/rcourson/Documents/Code/aux-chromium-security-155/chromium/src')
for row in proof['platformSources']:
    assert sha((native / row['path']).read_bytes()) == row['sha256']
with tempfile.TemporaryDirectory(prefix='aux-pager-leaf-') as directory:
    subprocess.run(['git', 'apply', '--unsafe-paths', str(root / 'native.patch')],
                   cwd=directory, check=True, capture_output=True)
    for row in manifest['files']:
        assert row['baselineSha256'] is None and row['newFile']
        expected = (root / 'source' / row['path']).read_bytes()
        assert sha(expected) == row['outputSha256']
        assert (Path(directory) / row['path']).read_bytes() == expected
print('PASS: supplied pager event/geometry pins,155API pins and disposable patch replay; no compile/runtime claim')
