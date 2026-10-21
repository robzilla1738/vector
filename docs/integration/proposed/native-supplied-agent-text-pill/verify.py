#!/usr/bin/env python3
import hashlib
import json
from pathlib import Path
import subprocess
import tempfile

root = Path(__file__).resolve().parent
manifest = json.loads((root / 'manifest.json').read_text())
for row in manifest['files']:
    before = (root / 'baseline' / row['path']).read_bytes()
    after = (root / 'source' / row['path']).read_bytes()
    assert hashlib.sha256(before).hexdigest() == row['baselineSha256']
    assert hashlib.sha256(after).hexdigest() == row['outputSha256']
    text = before.decode()
    for anchor in row['anchors']:
        assert text.count(anchor['find']) == anchor['count'] == 1
        text = text.replace(anchor['find'], anchor['replace'])
    assert text.encode() == after
with tempfile.TemporaryDirectory(prefix='aux-settings-links-') as directory:
    temporary = Path(directory)
    for row in manifest['files']:
        path = temporary / row['path']
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes((root / 'baseline' / row['path']).read_bytes())
    subprocess.run(['git', 'apply', '--check', str(root / 'native.patch')], cwd=temporary, check=True)
    subprocess.run(['git', 'apply', str(root / 'native.patch')], cwd=temporary, check=True)
    for row in manifest['files']:
        assert (temporary / row['path']).read_bytes() == (root / 'source' / row['path']).read_bytes()
print('PASS: exact two-file counted replay and disposable patch application')

import mmap
import struct
e = json.loads((root / 'source-evidence.json').read_text())
with Path(e['framework']['path']).open('rb') as handle:
    binary = mmap.mmap(handle.fileno(), 0, access=mmap.ACCESS_READ)
    # Whole framework was pinned by original source inventory; range checks keep
    # this followup bounded and avoid another full-framework scan.
    segments = []
    offset = 32
    for _ in range(struct.unpack_from('<I', binary, 16)[0]):
        command, size = struct.unpack_from('<II', binary, offset)
        if command == 25:
            segments.append(struct.unpack_from('<QQQQ', binary, offset + 24))
        offset += size
    def read(address, size):
        for vm, _, file_offset, file_size in segments:
            if vm <= address < address + size <= vm + file_size:
                return binary[file_offset + address - vm:file_offset + address - vm + size]
        raise AssertionError(hex(address))
    for row in e['ranges']:
        assert hashlib.sha256(read(int(row['rva'], 16), row['bytes'])).hexdigest() == row['sha256']
    for row in e['colorNames']:
        actual_id, pointer = struct.unpack('<QQ', read(int(row['entryRva'], 16), 16))
        assert actual_id == row['id']
        assert pointer & ((1 << 36) - 1) == int(row['nameRva'], 16)
        assert read(int(row['nameRva'], 16), len(row['name']) + 1) == row['name'].encode() + b'\0'
    assert struct.unpack('<4i', read(0xdf40740, 16)) == (4, 10, 4, 10)
    assert struct.unpack('<f', read(0xdf50c0c, 4))[0] == 999.0
    assert struct.pack('<f', 26.0 / 255.0) == read(0xdf50c1c, 4)
for row in e['files']:
    assert hashlib.sha256((root / row['path']).read_bytes()).hexdigest() == row['sha256']
print('PASS: bounded original renderer, border, size, font/color/AlphaBlend pins')
