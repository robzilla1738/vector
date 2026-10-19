#!/usr/bin/env python3
"""Static Mach-O table/range extraction. Never loads or executes the target."""
import hashlib
import json
from pathlib import Path
import struct
import sys

expected = '64c6c8a366d36d4c86b429de2f7fb0b7103099317f0a84f1cfded1bc87f4b31c'
data = Path(sys.argv[1]).read_bytes()
if hashlib.sha256(data).hexdigest() != expected:
    raise ValueError('Unrecognized pinned arm64 framework slice')
segments = []
offset = 32
for _ in range(struct.unpack_from('<I', data, 16)[0]):
    command, size = struct.unpack_from('<II', data, offset)
    if command == 0x19:
        address, span, position, length = struct.unpack_from('<QQQQ', data, offset + 24)
        segments.append((address, span, position, length))
    offset += size

def position(address):
    base, span, start, length = next(s for s in segments if s[0] <= address < s[0] + s[1])
    relative = address - base
    if relative >= length:
        raise ValueError('Address is not file-backed')
    return start + relative

def cstring(address):
    start = position(address)
    end = data.index(b'\0', start, start + 256)
    return data[start:end].decode('ascii')

fields = []
for index in range(3):
    address = 0xead93c8 + index * 32
    name, kind, optional, parser = struct.unpack_from('<QQQQ', data, position(address))
    fields.append({'tableAddress': hex(address), 'name': cstring(name & 0xfffffffff),
                   'rawKind': kind, 'optional': optional, 'parserAddress': hex(parser & 0xfffffffff)})
assert [(f['name'], f['optional']) for f in fields] == [('profileIndex', 0), ('shouldFocus', 1), ('url', 1)]
ranges = []
for name, start, end in [('dispatcher', 0x46b5fc0, 0x46b6320),
                         ('backend', 0x46b4a74, 0x46b51a8),
                         ('empty-success-serializer', 0x46b6320, 0x46b63f0)]:
    block = data[position(start):position(end)]
    ranges.append({'name': name, 'start': hex(start), 'endExclusive': hex(end),
                   'sha256': hashlib.sha256(block).hexdigest()})
print(json.dumps({'targetSha256': expected, 'authority': 'static shipped bytes',
                  'coverage': 'three generated field descriptors and explicit instruction ranges; not runtime observation or complete decompilation',
                  'fields': fields, 'ranges': ranges,
                  'guardAndErrors': {hex(a): cstring(a) for a in [0xded6978, 0xded69e4, 0xded69fe, 0xded6a13, 0xded6d0c]}}, indent=2))
