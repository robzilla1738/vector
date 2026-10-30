#!/usr/bin/env python3
"""Extract the deunicode 1.6.2 transliteration tables from the supplied memory helper.

    extract-deunicode.py <supplied aux-memory> <out deunicode.bin>

The supplied helper's sparse index normalizes text with deunicode (via the bm25 crate). Its
tables are copied as they are, located by content: the pointer table (3-byte entries per code
point, U+0000 upward) ends where the mapping text begins. Output: u32 LE entry count, the
pointer table, then the mapping text. Refuses any helper other than the pinned ones.
"""
import hashlib
import struct
import sys
from pathlib import Path

# Supplied helpers known to carry the same tables (signed copy and unsigned-identity copy).
PINNED = {
    '1656d4b83706e75a02107eaecb7e92488430d52d3312cf6f1b7b8f984d7c5a90',
    'b4c7d12efa87ed88515092527c7d1e7d9b43e605f39f03543e2b0e8e7005b3c0',
}
OUTPUT_SHA256 = '4176eaa94b2684387d8abd1e18d108766f8243590e59972e016b4543351628e6'


def main() -> int:
    source, out = Path(sys.argv[1]), Path(sys.argv[2])
    data = source.read_bytes()
    if hashlib.sha256(data).hexdigest() not in PINNED:
        raise SystemExit(f'{source}: not a pinned supplied memory helper')
    ascii_run = b''.join(bytes([c, 0, 1]) for c in range(0x20, 0x7f))
    first = data.find(ascii_run)
    start = first - 0x20 * 3
    if first < 0 or data[start:start + 0x20 * 3] != bytes(0x20 * 3):
        raise SystemExit('pointer table not found')
    # The mapping follows the table; locate it by three known transliterations.
    def entry(c):
        o = start + 3 * c
        return data[o] | data[o + 1] << 8, data[o + 2]
    probes = [(0x65E5, b'Ri '), (0x672C, b'Ben '), (0x8A9E, b'Yu ')]
    mapping = None
    off0, len0 = entry(probes[0][0])
    pos = data.find(probes[0][1])
    while pos >= 0:
        base = pos - off0
        if all(data[base + o:base + o + l] == t for (o, l), t in ((entry(c), t) for c, t in probes)):
            mapping = base
            break
        pos = data.find(probes[0][1], pos + 1)
    if mapping is None or (mapping - start) % 3:
        raise SystemExit('mapping text not found')
    count = (mapping - start) // 3
    end = 0
    for c in range(count):
        o, l = entry(c)
        if l != 255 and l > 2:
            end = max(end, o + l)
    blob = struct.pack('<I', count) + data[start:mapping] + data[mapping:mapping + end]
    if hashlib.sha256(blob).hexdigest() != OUTPUT_SHA256:
        raise SystemExit('extracted tables differ from the reviewed extraction')
    out.write_bytes(blob)
    print(f'{count} entries, mapping {end} bytes, sha256 {hashlib.sha256(blob).hexdigest()}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
