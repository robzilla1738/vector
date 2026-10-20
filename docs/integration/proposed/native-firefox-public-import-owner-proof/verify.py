from pathlib import Path
import hashlib
import json
import struct
import subprocess
import tempfile

root = Path(__file__).resolve().parent
sha = lambda data: hashlib.sha256(data).hexdigest()
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
for item in evidence['vtable']:
    data = read(int(item['address'], 16), 8)
    assert data.hex() == item['rawHex']
    assert hex(struct.unpack('<Q', data)[0] & 0xfffffffff) == item['target']
for item in evidence['upstream']:
    assert sha((root / 'evidence' / item['copy']).read_bytes()) == item['sha256']
assert len(evidence['ranges']) == 12 and len(evidence['vtable']) == 6
print('PASS:12 original bounded ranges, literals,6 observer slots,current155 prerequisite pins; no native patch')
