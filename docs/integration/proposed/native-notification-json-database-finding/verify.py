from pathlib import Path
import hashlib
import json
import struct

root = Path(__file__).resolve().parent
manifest = json.loads((root / 'source-evidence.json').read_text())
sha = lambda data: hashlib.sha256(data).hexdigest()
binary = Path(manifest['thinPath']).read_bytes()
assert sha(binary) == manifest['thinSha256']
sections = []
pos = 32
for _ in range(struct.unpack_from('<I', binary, 16)[0]):
    command, size = struct.unpack_from('<II', binary, pos)
    if command == 0x19:
        for index in range(struct.unpack_from('<I', binary, pos + 64)[0]):
            sections.append(struct.unpack_from('<QQI', binary, pos + 72 + index * 80 + 32))
    pos += size

def read(address, length):
    start, size, offset = next(s for s in sections
                               if s[0] <= address and address + length <= s[0] + s[1])
    return binary[offset + address - start:offset + address - start + length]

def word(address):
    return struct.unpack('<I', read(address, 4))[0]

def pointer(address):
    return struct.unpack('<Q', read(address, 8))[0] & 0xfffffffff

for item in manifest['ranges']:
    start, end = int(item['start'], 16), int(item['end'], 16)
    assert sha(read(start, end - start)) == item['sha256']
    assert sha((root / 'evidence' / item['listing']).read_bytes()) == item['listingSha256']
for item in manifest['data']:
    value = bytes.fromhex(item['hex'])
    assert read(int(item['address'], 16), len(value)) == value
    assert sha(value) == item['sha256']
for item in manifest['api155']:
    assert sha(Path(item['path']).read_bytes()) == item['sha256']
assert pointer(0xe9c8710) == 0xec7efb0
assert pointer(0xe9c8718) == 0xec7f1e8
assert pointer(0xec7efb0) == 0xe55cb40
assert pointer(0xe55cb68) == 0xa08163c
name = b'content.NotificationDatabaseDataProto.NotificationData\0'
assert read(0xe9c8750, len(name)) == name
assert word(0xec7f1ec) == 16  # Actual payload parse-table maximum field.
assert struct.unpack('<H', read(0xec7f1fc, 2))[0] == 16  # Actual field count.
# Original serializer's clone length/pointer and next actions read; the
# complete pinned function provides the intervening control-flow proof.
assert word(0x672aca4) == 0xf9414e82  # ldr x2,[x20,#0x298]
assert word(0x672acac) == 0xf9414a81  # ldr x1,[x20,#0x290]
assert word(0x672accc) == 0x9101c2a0  # add x0,x21,#0x70 (proto data)
assert word(0x672acd4) == 0xf9416a88  # ldr x8,[x20,#0x2d0] (actions)
assert word(0xa0817b0) == 0x52800101  # mov w1,#8 (clone bytes field)
assert word(0x672a6d4) == 0x910a4260  # add x0,x19,#0x290 (read clone)
assert word(0x672a6fc) == 0x910b2278  # add x24,x19,#0x2c8 (then actions)
print('PASS: original DB read/write, generated schema/field8, live JSON consumer and155 boundary pins')
