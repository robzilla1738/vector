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
for item in evidence.get('selectors', []):
    assert read(int(item['address'],16),12).hex() == item['hex']
assert len(manifest['files']) == 2
assert len(anchors) == 8
outputs = {}
for item in manifest['files']:
    before = (root/'baseline'/item['path']).read_bytes()
    assert sha(before) == item['baselineSha256']
    text = before.decode()
    for anchor in anchors:
        if anchor['path'] == item['path']:
            assert text.count(anchor['before']) == anchor['count'] == 1
            text = text.replace(anchor['before'], anchor['after'], 1)
    outputs[item['path']] = text.encode()
for item in manifest['files']:
    assert outputs[item['path']] == (root/'source'/item['path']).read_bytes()
    assert sha((root/'source'/item['path']).read_bytes()) == item['outputSha256']
with tempfile.TemporaryDirectory(prefix='aux-target-chooser-replay-') as temp:
    for item in manifest['files']:
        file = Path(temp)/item['path']
        file.parent.mkdir(parents=True, exist_ok=True)
        file.write_bytes((root/'baseline'/item['path']).read_bytes())
    subprocess.run(['git','apply','--check',str(root/'native.patch')],cwd=temp,check=True)
    subprocess.run(['git','apply',str(root/'native.patch')],cwd=temp,check=True)
    for item in manifest['files']:
        assert sha((Path(temp)/item['path']).read_bytes()) == item['outputSha256']
print('PASS: standalone importer creator/owner pins and eight count-checked authority anchors; no runtime')
