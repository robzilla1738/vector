from pathlib import Path
import hashlib
import json
import struct
import subprocess
import tempfile

root = Path(__file__).resolve().parent
sha = lambda data: hashlib.sha256(data).hexdigest()
manifest = json.loads((root / 'manifest.json').read_text())
anchors = json.loads((root / 'anchors.json').read_text())
evidence = json.loads((root / 'source-evidence.json').read_text())
binary = Path(evidence['thinPath']).read_bytes()
assert sha(binary) == evidence['thinSha256']
sections = []
pos = 32
for _ in range(struct.unpack_from('<I', binary, 16)[0]):
    command, size = struct.unpack_from('<II', binary, pos)
    if command == 0x19:
        for index in range(struct.unpack_from('<I', binary, pos + 64)[0]):
            at = pos + 72 + index * 80
            sections.append(struct.unpack_from('<QQI', binary, at + 32))
    pos += size

def read(address, length):
    start, size, offset = next(s for s in sections
                               if s[0] <= address and address + length <= s[0] + s[1])
    return binary[offset + address - start:offset + address - start + length]

for item in evidence['ranges']:
    start, end = int(item['start'], 16), int(item['end'], 16)
    assert sha(read(start, end - start)) == item['sha256']
    assert sha((root / 'evidence' / item['listing']).read_bytes()) == item['listingSha256']
for item in evidence['literals']:
    data = bytes.fromhex(item['hex'])
    assert read(int(item['address'], 16), len(data)) == data
    assert data.decode(item['encoding']) == item['text']
assert len(manifest['files']) == 2 and len(anchors) == 4
for item in manifest['files']:
    before = (root / 'baseline' / item['path']).read_text()
    assert sha(before.encode()) == item['baselineSha256']
    after = before
    for anchor in (a for a in anchors if a['path'] == item['path']):
        assert after.count(anchor['before']) == anchor['count'] == 1
        after = after.replace(anchor['before'], anchor['after'])
    assert after == (root / 'source' / item['path']).read_text()
    assert sha(after.encode()) == item['outputSha256']
with tempfile.TemporaryDirectory(prefix='aux-retained-collapse-replay-') as temp:
    for item in manifest['files']:
        target = Path(temp) / item['path']
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes((root / 'baseline' / item['path']).read_bytes())
    subprocess.run(['git', 'apply', '--check', str(root / 'native.patch')], cwd=temp, check=True)
    subprocess.run(['git', 'apply', str(root / 'native.patch')], cwd=temp, check=True)
    for item in manifest['files']:
        assert sha((Path(temp) / item['path']).read_bytes()) == item['outputSha256']
print('PASS: original mode1 bookmark destination/root/flatten pins; four anchors/two-file replay')
