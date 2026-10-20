"""Verify supplied header/pager source anchors and replay the new native files."""
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
for row in proof['pseudocode']:
    assert sha((root / row['path']).read_bytes()) == row['sha256']


def word(address):
    return struct.unpack_from('<I', arm, address)[0]


def branch(address):
    instruction = word(address)
    assert instruction & 0xfc000000 == 0x94000000
    displacement = instruction & 0x3ffffff
    if displacement & 0x2000000:
        displacement -= 0x4000000
    return address + displacement * 4


assert word(0x37e3c34) == 0xd2c00541  #Preferred height42, width0.
assert word(0x37e3ed4) == 0xd2c00301  #Pager height24, width0.
assert word(0x37e4008) == 0xd2800002  #Profile child inserted at index0.
assert branch(0x37e4024) == 0x7793fc  #Search appended after pager.
assert branch(0x37e3c8c) == 0x2218844  #Actual compositor masks-to-bounds.
assert word(0x4640454) == 0x5100814a  #Pager y uses parent height minus32.
assert word(0x4640470) == 0x0f000702  #Pager height24.
assert branch(0x46523c8) == 0x456ee5c  #Original targeted menu, not generic primary.
assert word(0x4631524) == 0xf9422c00  #Search callback's actual BrowserView+458.
assert branch(0x45b63d8) == 0x459fbcc  #Original search feature eligibility.

with tempfile.TemporaryDirectory(prefix='aux-header-pager-') as directory:
    subprocess.run(['git', 'apply', str(root / 'native.patch')], cwd=directory,
                   check=True, capture_output=True)
    for row in manifest['files']:
        assert row['baselineSha256'] is None and row['newFile']
        output = (Path(directory) / row['path']).read_bytes()
        assert sha(output) == row['outputSha256']
        assert output == (root / 'source' / row['path']).read_bytes()
print('PASS: supplied header/pager binary and geometry/callback pins, four-file replay; uncompiled/unmounted')
